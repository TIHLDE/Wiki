// Browser-side search module.
//
// The search index data is generated at build time by `search-data.mjs` (run
// from `next.config.mjs`) and written to `.search-data.json`. Here we load that
// data and build the FlexSearch index at runtime. Type declarations for this
// module live in `types.d.ts`.

import FlexSearch from 'flexsearch'

import data from './.search-data.json'

let sectionIndex = new FlexSearch.Document({
  preset: 'balance',
  tokenize: 'full',
  document: {
    id: 'url',
    index: [
      { field: 'title', tokenize: 'forward', resolution: 9 },
      { field: 'content', tokenize: 'full', resolution: 9 },
    ],
    store: ['title', 'pageTitle', 'base'],
  },
  context: { resolution: 9, depth: 2, bidirectional: true },
})

for (let { url, sections, metaTitle, allContent } of data) {
  let pageTitle = metaTitle ?? (sections?.[0]?.[0] ?? undefined)

  sectionIndex.add({
    url,
    title: pageTitle,
    content: allContent,
    pageTitle,
    base: url,
  })

  for (let [title, hash, content] of sections) {
    let idUrl = url + '#' + (hash ?? '_section')
    sectionIndex.add({
      url: idUrl,
      title,
      content: [title, ...content].join('\n'),
      pageTitle,
      base: url,
    })
  }
}

function normalizeQuery(q) {
  return q
    .replace(/([A-Za-zÆØÅæøå])\1{2,}/g, '$1$1')
    .replace(/\s+/g, ' ')
    .trim()
}

function postprocess(groups) {
  if (!groups || groups.length === 0) return []

  let merged = []
  let seen = new Set()
  for (let g of groups) {
    for (let item of g.result) {
      if (seen.has(item.id)) continue
      seen.add(item.id)
      merged.push({
        url: item.id,
        title: item.doc.title,
        pageTitle: item.doc.pageTitle,
        base: item.doc.base ?? item.id.split('#')[0],
      })
    }
  }

  let byBase = new Map()
  for (let r of merged) {
    if (!byBase.has(r.base)) byBase.set(r.base, [])
    byBase.get(r.base).push(r)
  }

  let out = []
  for (let [base, items] of byBase.entries()) {
    let baseDoc = items.find((i) => i.url === base)
    let chosen = baseDoc ?? items[0]
    out.push({ url: chosen.url, title: chosen.title, pageTitle: chosen.pageTitle })
  }

  let rank = (u) => merged.findIndex((m) => m.url === u.url || m.base === u.url)
  out.sort((a, b) => rank(a) - rank(b))
  return out
}

export function search(query, options = {}) {
  let groups = sectionIndex.search(query, {
    ...options,
    enrich: true,
    boolean: 'and',
  })
  let out = postprocess(groups)
  if (out.length > 0) return out

  let relaxedQuery = normalizeQuery(query)
  groups = sectionIndex.search(relaxedQuery, {
    ...options,
    enrich: true,
    boolean: 'and',
    suggest: true,
    threshold: 2,
  })
  out = postprocess(groups)
  if (out.length > 0) return out

  groups = sectionIndex.search(relaxedQuery, {
    ...options,
    enrich: true,
    boolean: 'or',
    suggest: true,
    threshold: 3,
  })
  return postprocess(groups)
}
