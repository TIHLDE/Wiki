// Browser-side search module.
//
// The search index data is generated at build time by `search-data.mjs` (run
// from `next.config.mjs`) and written to `.search-data.json`. Here we load that
// data and build the FlexSearch index at runtime. Type declarations for this
// module live in `types.d.ts`.

import FlexSearch from 'flexsearch'

import data from './.search-data.json'
import {
  phrasePattern,
  termPatterns,
  wordPatterns,
} from '../lib/searchTerms.ts'

const MAX_SECTIONS_PER_PAGE = 3
const CANDIDATE_LIMIT = 100

let index = new FlexSearch.Document({
  preset: 'balance',
  tokenize: 'full',
  document: {
    id: 'id',
    index: [
      { field: 'title', tokenize: 'forward', resolution: 9 },
      { field: 'content', tokenize: 'full', resolution: 9 },
    ],
  },
  context: { resolution: 9, depth: 2, bidirectional: true },
})

let docs = new Map()

for (let { url, sections, metaTitle, allContent } of data) {
  let pageTitle = metaTitle ?? sections.find(([title]) => title)?.[0] ?? url

  // Imported component text lives only here, so component-built pages stay findable.
  let pageId = url + '#'
  docs.set(pageId, {
    url,
    title: pageTitle,
    pageTitle,
    base: url,
    page: true,
    text: allContent,
  })
  index.add({ id: pageId, title: pageTitle, content: allContent })

  sections.forEach(([title, hash, content], i) => {
    let id = url + '#' + i
    let text = content.join('\n')
    docs.set(id, {
      url: hash ? url + '#' + hash : url,
      title: title || pageTitle,
      pageTitle,
      base: url,
      text,
    })
    index.add({ id, title: title || pageTitle, content: text })
  })
}

function normalizeQuery(q) {
  return q
    .replace(/([A-Za-zÆØÅæøå])\1{2,}/g, '$1$1')
    .replace(/\s+/g, ' ')
    .trim()
}

function makeSnippet(text, query) {
  if (!text) return undefined
  let flat = text.replace(/\s+/g, ' ').trim()
  let match = null
  for (let pattern of termPatterns(query)) {
    if ((match = pattern.exec(flat))) break
  }
  let start = match ? Math.max(0, match.index - 40) : 0
  if (start > 0) {
    let space = flat.indexOf(' ', start)
    if (space !== -1 && space < match.index) start = space + 1
  }
  let end = Math.min(flat.length, start + 140)
  if (end < flat.length) {
    let space = flat.lastIndexOf(' ', end)
    if (space > start) end = space
  }
  return (
    (start > 0 ? '… ' : '') +
    flat.slice(start, end) +
    (end < flat.length ? ' …' : '')
  )
}

function textBonus(doc, query) {
  let haystack = doc.title + '\n' + (doc.text ?? '')
  let bonus = phrasePattern(query)?.test(haystack) ? 3 : 0
  for (let word of wordPatterns(query)) {
    if (word.test(doc.title)) bonus += 1
    else if (word.test(haystack)) bonus += 0.5
  }
  return bonus
}

function rankedIds(groups, query) {
  let scores = new Map()
  for (let { field, result } of groups) {
    let weight = field === 'title' ? 2 : 1
    result.forEach((id, position) => {
      let score = weight * (1 - position / (result.length + 1))
      scores.set(id, (scores.get(id) ?? 0) + score)
    })
  }
  for (let [id, score] of scores) {
    scores.set(id, score + textBonus(docs.get(id), query))
  }
  return [...scores.entries()].sort((a, b) => b[1] - a[1])
}

function collect(groups, query, limit) {
  let ranked = rankedIds(groups, query)
  let titleHits = new Set(groups.find((g) => g.field === 'title')?.result ?? [])
  let basesWithSections = new Set(
    ranked
      .map(([id]) => docs.get(id))
      .filter((d) => !d.page)
      .map((d) => d.base),
  )

  let out = []
  let seen = new Set()
  let perPage = new Map()
  for (let [id] of ranked) {
    let doc = docs.get(id)
    if (doc.page && basesWithSections.has(doc.base) && !titleHits.has(id)) {
      continue
    }
    let key = doc.url + '\n' + doc.title
    if (seen.has(key)) continue
    let count = perPage.get(doc.base) ?? 0
    if (count >= MAX_SECTIONS_PER_PAGE) continue

    seen.add(key)
    perPage.set(doc.base, count + 1)
    out.push({
      url: doc.url,
      title: doc.title,
      pageTitle: doc.title === doc.pageTitle ? undefined : doc.pageTitle,
      snippet: makeSnippet(doc.text, query),
    })
    if (out.length >= limit) break
  }
  return out
}

export function search(query, options = {}) {
  let { limit = 5, ...rest } = options
  let base = { ...rest, limit: CANDIDATE_LIMIT }
  let relaxedQuery = normalizeQuery(query)

  let attempts = [
    [query, {}],
    [relaxedQuery, { suggest: true }],
  ]
  for (let [q, extra] of attempts) {
    let out = collect(
      index.search(q, { ...base, ...extra }),
      relaxedQuery,
      limit,
    )
    if (out.length > 0) return out
  }
  return []
}
