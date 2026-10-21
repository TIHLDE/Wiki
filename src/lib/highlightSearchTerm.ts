import { termPatterns } from '@/lib/searchTerms'

const HIGHLIGHT_NAME = 'search-term'
const TIMEOUT_MS = 3000
const SCROLL_OFFSET_PX = 120

function findMatch(root: Element, start: Node | null, query: string) {
  for (let pattern of termPatterns(query)) {
    let walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
    let node: Node | null
    while ((node = walker.nextNode())) {
      if (
        start &&
        !start.contains(node) &&
        start.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_PRECEDING
      ) {
        continue
      }
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
        (!start ||
          start === heading ||
          start.compareDocumentPosition(heading) &
            Node.DOCUMENT_POSITION_FOLLOWING),
    ) ?? null
  )
}

function revealAndHighlight(url: URL, title: string, query: string) {
  let article = document.querySelector('main article')
  if (!article) return false

  let hash = decodeURIComponent(url.hash.slice(1))
  let start = hash ? document.getElementById(hash) : null
  if (hash && !start) return false

  let heading = findHeading(article, start, title)
  let range = findMatch(article, heading ?? start, query)
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

  let url = new URL(itemUrl, window.location.origin)
  let deadline = performance.now() + TIMEOUT_MS

  function attempt() {
    let arrived = window.location.pathname === url.pathname
    if (arrived && revealAndHighlight(url, title, query)) return
    if (performance.now() < deadline) requestAnimationFrame(attempt)
  }

  // Next.js scrolls to the hash after rendering; wait a frame so ours wins.
  requestAnimationFrame(() => requestAnimationFrame(attempt))
}
