// Build-time (Node only) generator for the search index data.
//
// Historically this lived inside a custom webpack loader (`search.mjs`). Next.js
// 16 builds with Turbopack by default, which does not run arbitrary webpack
// loaders, so the scanning/extraction step now runs here at build time and is
// written to `.search-data.json`. The browser-side `search.mjs` imports that
// JSON and builds the FlexSearch index at runtime.

import { slugifyWithCounter } from '@sindresorhus/slugify'
import glob from 'fast-glob'
import * as fs from 'fs'
import { toString } from 'mdast-util-to-string'
import * as path from 'path'
import { remark } from 'remark'
import remarkMdx from 'remark-mdx'
import { filter } from 'unist-util-filter'
import { SKIP, visit } from 'unist-util-visit'
import * as url from 'url'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

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
  if (source.startsWith('@/'))
    return path.resolve(projectRoot, 'src', source.slice(2))
  if (source.startsWith('./') || source.startsWith('../'))
    return path.resolve(projectRoot, 'src/app', source)
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

export function generateSearchData() {
  let projectRoot = path.resolve('.')
  let appDir = path.resolve('./src/app')
  let compCache = new Map()

  let files = glob.sync('**/*.mdx', { cwd: appDir })
  return files.map((file) => {
    let pageUrl = '/' + file.replace(/(^|\/)page\.mdx$/, '')
    let mdx = fs.readFileSync(path.join(appDir, file), 'utf8')

    let metaMatch = mdx.match(
      /export\s+const\s+metadata\s*=\s*\{\s*[\s\S]*?title\s*:\s*(['"])(.*?)\1[\s\S]*?\}/,
    )
    let metaTitle = metaMatch?.[2]?.trim()

    let sections = []
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
      sections
        .flatMap(([title, _hash, content]) => [title, ...content])
        .join('\n') +
      (importedTexts.length ? '\n' + importedTexts.join('\n') : '')

    return { url: pageUrl, sections, metaTitle, allContent }
  })
}

const DATA_FILE = path.join(__dirname, '.search-data.json')

export function writeSearchData() {
  let data = generateSearchData()
  fs.writeFileSync(DATA_FILE, JSON.stringify(data))
  return data
}
