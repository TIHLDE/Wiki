import nextMDX from '@next/mdx'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { writeSearchData } from './src/mdx/search-data.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const plugin = (name) => path.join(__dirname, 'src/mdx/plugins', name)

// Generate the search index data at build time. This used to be done by a custom
// webpack loader, but Next.js 16 builds with Turbopack, so the data is written to
// `src/mdx/.search-data.json` here and imported by the browser-side search module.
writeSearchData()

const withMDX = nextMDX({
  // Turbopack requires remark/rehype/recma plugins to be referenced by module
  // path (or package name) with serializable options, since plugin functions
  // can't be passed across the Rust/JS boundary. `@next/mdx` resolves these with
  // `require.resolve`, which only treats bare specifiers as project-relative, so
  // local plugins must be passed as absolute paths. Each module default-exports
  // its plugin. See ./src/mdx/plugins/*.
  options: {
    remarkPlugins: [plugin('remark-mdx-annotations.mjs'), 'remark-gfm'],
    rehypePlugins: [
      plugin('rehype-mdx-annotations.mjs'),
      plugin('rehype-parse-code-blocks.mjs'),
      plugin('rehype-shiki.mjs'),
      plugin('rehype-slugify.mjs'),
      plugin('rehype-add-mdx-exports.mjs'),
    ],
    recmaPlugins: [plugin('recma-mdx-annotations.mjs')],
  },
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'mdx'],
  outputFileTracingIncludes: {
    '/**/*': ['./src/app/**/*.mdx'],
  },
}

export default withMDX(nextConfig)
