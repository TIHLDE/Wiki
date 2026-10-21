import { termPatterns } from '@/lib/searchTerms'

const HIGHLIGHT_NAME = 'search-term'
const TIMEOUT_MS = 3000
const SCROLL_OFFSET_PX = 120

function isBefore(a: Node, b: Node) {
  return Boolean(
    a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING,
  )
}

function headingLevel(element: Element) {
  return /^H([1-6])$/.exec(element.tagName)?.[1]
}

function sectionEnd(root: Element, start: Element | null) {
  let level = start && headingLevel(start)
  if (!start || !level) return null
  let selector = ['h1', 'h2', 'h3']
    .slice(0, Math.max(2, Number(level)))
    .join(', ')
  return (
    Array.from(root.querySelectorAll(selector)).find((heading) =>
      isBefore(start, heading),
    ) ?? null
  )
}

function findMatch(
  root: Element,
  start: Element | null,
  end: Element | null,
  query: string,
) {
  for (let pattern of termPatterns(query)) {
    let walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
    let node: Node | null
    while ((node = walker.nextNode())) {
      if (start && !start.contains(node) && isBefore(node, start)) continue
      if (end && (end.contains(node) || isBefore(end, node))) break
      let match = pattern.exec(node.textContent ?? '')
      if (match) {
        let range = document.createRange()
        range.setStart(node, match.index)
        range.setEnd(node, match.index + match[0].length)
        return range
      }
    }
  }
  return null
}

function findHeading(root: Element, start: Element | null, title: string) {
  let headings = Array.from(root.querySelectorAll('h1, h2, h3'))
  return (
    headings.find(
      (heading) =>
        heading.textContent?.trim() === title.trim() &&
        (!start || start === heading || isBefore(start, heading)),
    ) ?? null
  )
}

function revealAndHighlight(
  article: Element,
  url: URL,
  title: string,
  query: string,
) {
  let hash = decodeURIComponent(url.hash.slice(1))
  let start = hash ? document.getElementById(hash) : null
  if (hash && !start) return false

  let from = findHeading(article, start, title) ?? start
  // Page-level results match text from components further down the page.
  let range =
    findMatch(article, from, sectionEnd(article, from), query) ??
    findMatch(article, from, null, query)
  if (!range) return true

  if (typeof CSS !== 'undefined' && 'highlights' in CSS) {
    CSS.highlights.set(HIGHLIGHT_NAME, new Highlight(range))
  }
  let top = range.getBoundingClientRect().top + window.scrollY
  window.scrollTo({ top: Math.max(0, top - SCROLL_OFFSET_PX) })
  return true
}

export function highlightSearchTermAfterNavigation(
  itemUrl: string,
  title: string,
  query: string,
) {
  if (typeof CSS !== 'undefined' && 'highlights' in CSS) {
    CSS.highlights.delete(HIGHLIGHT_NAME)
  }

  let url = new URL(itemUrl, window.location.href)
  let samePage = url.pathname === window.location.pathname
  let previousArticle = document.querySelector('main article')
  let deadline = performance.now() + TIMEOUT_MS

  function attempt() {
    let article = document.querySelector('main article')
    // The old page stays mounted for a moment after the URL changes.
    let arrived = article && (samePage || article !== previousArticle)
    if (article && arrived && revealAndHighlight(article, url, title, query)) {
      return
    }
    if (performance.now() < deadline) requestAnimationFrame(attempt)
  }

  // Next.js scrolls to the hash after rendering; wait a frame so ours wins.
  requestAnimationFrame(() => requestAnimationFrame(attempt))
}
