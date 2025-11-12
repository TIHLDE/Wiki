import { slugifyWithCounter } from '@sindresorhus/slugify'
import glob from 'fast-glob'
import * as fs from 'fs'
import { toString } from 'mdast-util-to-string'
import * as path from 'path'
import { remark } from 'remark'
import remarkMdx from 'remark-mdx'
import { createLoader } from 'simple-functional-loader'
import { filter } from 'unist-util-filter'
import { SKIP, visit } from 'unist-util-visit'
import * as url from 'url'

const __filename = url.fileURLToPath(import.meta.url)
const processor = remark().use(remarkMdx).use(extractSections)
const slugify = slugifyWithCounter()

function isObjectExpression(node) {
  return (
    node.type === 'mdxTextExpression' &&
    node.data?.estree?.body?.[0]?.expression?.type === 'ObjectExpression'
  )
}

function excludeObjectExpressions(tree) {
  return filter(tree, (node) => !isObjectExpression(node))
}

function extractSections() {
  return (tree, { sections }) => {
    slugify.reset()
    visit(tree, (node) => {
      let isHeading = node.type === 'heading'
      let isParagraph = node.type === 'paragraph'
      let isTextComponent =
        node.type === 'mdxJsxTextElement' &&
        typeof node.name === 'string' &&
        node.name.toLowerCase() === 'text'

      if (isHeading || isParagraph || isTextComponent) {
        let content = toString(excludeObjectExpressions(node))
        if (isHeading && node.depth <= 2) {
          let hash = slugify(content)
          sections.push([content, hash, []])
        } else {
          if (sections.length === 0) {
            sections.push([content, '_section', []])
          } else {
            sections.at(-1)?.[2].push(content)
          }
        }
        return SKIP
      }
    })
  }
}

const COMPONENT_EXTS = ['.tsx', '.ts', '.jsx', '.js']

function parseImportsAndUsages(mdx) {
  let importMap = new Map()
  let importRE = /^import\s+(.+?)\s+from\s+['"]([^'"]+)['"];?/gm
  let m
  while ((m = importRE.exec(mdx))) {
    let spec = m[1].trim()
    let src = m[2].trim()
    let named = []
    let def = null
    if (spec.startsWith('{')) {
      spec
        .replace(/^{|}$/g, '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((s) => {
          let parts = s.split(/\s+as\s+/)
          let local = (parts[1] || parts[0]).trim()
          named.push(local)
        })
    } else if (spec.includes('{')) {
      let [d, rest] = spec.split('{')
      def = d.replace(/,/g, '').trim()
      rest
        .replace(/}/g, '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((s) => {
          let parts = s.split(/\s+as\s+/)
          let local = (parts[1] || parts[0]).trim()
          named.push(local)
        })
    } else {
      def = spec
    }
    if (def) importMap.set(def, src)
    for (let n of named) importMap.set(n, src)
  }

  let used = new Set()
  let tagRE = /<([A-Z][A-Za-z0-9_]*)\b/g
  let t
  while ((t = tagRE.exec(mdx))) used.add(t[1])

  return { importMap, used }
}

function resolveImportPath(source, projectRoot) {
  if (source.startsWith('@/')) return path.resolve(projectRoot, 'src', source.slice(2))
  if (source.startsWith('./') || source.startsWith('../')) return path.resolve(projectRoot, 'src/app', source)
  return null
}

function readFirstExisting(base) {
  for (let ext of COMPONENT_EXTS) {
    let p = base.endsWith(ext) ? base : base + ext
    if (fs.existsSync(p) && fs.statSync(p).isFile()) return p
  }
  return null
}

function extractStringsFromComponent(code, maxChars = 4000) {
  let out = []
  let keyREs = [
    /name\s*:\s*(['"`])([\s\S]*?)\1/g,
    /title\s*:\s*(['"`])([\s\S]*?)\1/g,
    /description\s*:\s*(['"`])([\s\S]*?)\1/g,
    /alt\s*:\s*(['"`])([\s\S]*?)\1/g,
    /label\s*:\s*(['"`])([\s\S]*?)\1/g,
  ]
  for (let re of keyREs) {
    let m
    while ((m = re.exec(code))) {
      let s = m[2].trim()
      if (s && s.length >= 2) out.push(s)
    }
  }
  let litRE = /(['"`])((?:\\\1|\\.|(?!\1).)*?)\1/g
  let l
  while ((l = litRE.exec(code))) {
    let s = l[2].trim()
    if (
      s.length >= 2 &&
      /[A-Za-zÆØÅæøå]/.test(s) &&
      !/^[./@]|[{}<>;:$]/.test(s) &&
      !/\b(class(Name)?|href|http|svg|viewBox|px|rem|grid|flex|bg-)\b/i.test(s)
    ) {
      out.push(s)
    }
    if (out.join(' ').length > maxChars) break
  }
  return Array.from(new Set(out))
}

export default function Search(nextConfig = {}) {
  let cache = new Map()
  let compCache = new Map()

  return Object.assign({}, nextConfig, {
    webpack(config, options) {
      config.module.rules.push({
        test: __filename,
        use: [
          createLoader(function () {
            let projectRoot = path.resolve('.')
            let appDir = path.resolve('./src/app')
            let componentsDir = path.resolve('./src/components')
            this.addContextDependency(appDir)
            this.addContextDependency(componentsDir)

            let files = glob.sync('**/*.mdx', { cwd: appDir })
            let data = files.map((file) => {
              let url = '/' + file.replace(/(^|\/)page\.mdx$/, '')
              let mdx = fs.readFileSync(path.join(appDir, file), 'utf8')

              let metaMatch = mdx.match(
                /export\s+const\s+metadata\s*=\s*\{\s*[\s\S]*?title\s*:\s*(['"])(.*?)\1[\s\S]*?\}/
              )
              let metaTitle = metaMatch?.[2]?.trim()

              let sections = []
              if (cache.get(file)?.[0] === mdx) {
                sections = cache.get(file)[1]
              } else {
                let vfile = { value: mdx, sections }
                processor.runSync(processor.parse(vfile), vfile)
                if (sections.length === 0) {
                  let directory = path.dirname(file)
                  let fallback =
                    metaTitle ??
                    (directory && directory !== '.'
                      ? path.basename(directory)
                      : path.basename(file, path.extname(file)))
                  sections.push([fallback, '_section', []])
                }
                cache.set(file, [mdx, sections])
              }

              let { importMap, used } = parseImportsAndUsages(mdx)
              let importedTexts = []
              for (let compName of used) {
                let srcRaw = importMap.get(compName)
                if (!srcRaw) continue
                let resolvedBase = resolveImportPath(srcRaw, projectRoot)
                if (!resolvedBase) continue
                let compPath = readFirstExisting(resolvedBase)
                if (!compPath) continue

                let texts = compCache.get(compPath)
                if (!texts) {
                  try {
                    let code = fs.readFileSync(compPath, 'utf8')
                    texts = extractStringsFromComponent(code)
                  } catch {
                    texts = []
                  }
                  compCache.set(compPath, texts)
                }
                importedTexts.push(...texts)
              }

              let allContent =
                sections.flatMap(([title, _hash, content]) => [title, ...content]).join('\n') +
                (importedTexts.length ? '\n' + importedTexts.join('\n') : '')

              return { url, sections, metaTitle, allContent }
            })

            // When this file is imported within the application the following module is loaded:
            return `
              import FlexSearch from 'flexsearch'

              let sectionIndex = new FlexSearch.Document({
                preset: 'balance',
                tokenize: 'full',
                document: {
                  id: 'url',
                  index: [
                    { field: 'title', tokenize: 'forward', resolution: 9 },
                    { field: 'content', tokenize: 'full',  resolution: 9 },
                  ],
                  store: ['title', 'pageTitle', 'base'],
                },
                context: { resolution: 9, depth: 2, bidirectional: true },
              })

              let data = ${JSON.stringify(data)}

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
                    content: [title, ...content].join('\\n'),
                    pageTitle,
                    base: url,
                  })
                }
              }

              function normalizeQuery(q) {
                return q
                  .replace(/([A-Za-zÆØÅæøå])\\1{2,}/g, '$1$1')
                  .replace(/\\s+/g, ' ')
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
                let groups = sectionIndex.search(query, { ...options, enrich: true, boolean: 'and' })
                let out = postprocess(groups)
                if (out.length > 0) return out

                let relaxedQuery = normalizeQuery(query)
                groups = sectionIndex.search(relaxedQuery, { ...options, enrich: true, boolean: 'and', suggest: true, threshold: 2 })
                out = postprocess(groups)
                if (out.length > 0) return out

                groups = sectionIndex.search(relaxedQuery, { ...options, enrich: true, boolean: 'or', suggest: true, threshold: 3 })
                return postprocess(groups)
              }
            `
          }),
        ],
      })

      if (typeof nextConfig.webpack === 'function') {
        return nextConfig.webpack(config, options)
      }

      return config
    },
  })
}
