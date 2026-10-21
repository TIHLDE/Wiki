function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function wordStart(pattern: string) {
  return new RegExp('(?<![\\p{L}\\d])' + pattern, 'iu')
}

export function queryWords(query: string) {
  return query
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 1)
}

// Best match first: the whole phrase, then whole words, then any substring.
export function termPatterns(query: string) {
  let words = queryWords(query).map(escapeRegExp)
  if (words.length === 0) return []
  let patterns = words.map(wordStart)
  if (words.length > 1) patterns.unshift(wordStart(words.join('\\s+')))
  patterns.push(new RegExp(words.join('|'), 'i'))
  return patterns
}

export function phrasePattern(query: string) {
  let words = queryWords(query).map(escapeRegExp)
  return words.length > 1 ? wordStart(words.join('\\s+')) : null
}

export function wordPatterns(query: string) {
  return queryWords(query).map(escapeRegExp).map(wordStart)
}
