export function generateSnippets(
  text: string,
  queryWords: string[],
  snippetLength: number = 200,
  maxSnippets: number = 3
): string[] {
  const normalizedText = text.toLowerCase();
  const snippets: string[] = [];
  const seenStarts = new Set<number>();

  // Find all positions where query words appear
  const positions: number[] = [];
  for (const word of queryWords) {
    let index = normalizedText.indexOf(word.toLowerCase());
    while (index !== -1) {
      positions.push(index);
      index = normalizedText.indexOf(word.toLowerCase(), index + 1);
    }
  }

  // Sort positions and remove duplicates
  const uniquePositions = [...new Set(positions)].sort((a, b) => a - b);

  // Generate snippets around each match
  for (const position of uniquePositions) {
    if (snippets.length >= maxSnippets) break;

    // Find a good start position (prefer word boundaries)
    let start = Math.max(0, position - snippetLength / 2);
    let adjustedStart = start;

    // Try to start at a word boundary
    const searchRange = Math.min(50, start);
    for (let i = start; i >= Math.max(0, start - searchRange); i--) {
      if (i === 0 || /\s/.test(text[i - 1])) {
        adjustedStart = i;
        break;
      }
    }

    // Avoid duplicate snippets
    if (seenStarts.has(adjustedStart)) continue;
    seenStarts.add(adjustedStart);

    const end = Math.min(text.length, adjustedStart + snippetLength);
    let snippet = text.substring(adjustedStart, end);

    // Add ellipsis if not at start/end
    if (adjustedStart > 0) snippet = '...' + snippet;
    if (end < text.length) snippet = snippet + '...';

    snippets.push(snippet);
  }

  return snippets.length > 0 ? snippets : [text.substring(0, snippetLength) + '...'];
}

export function highlightTerms(snippet: string, queryWords: string[]): string {
  let highlighted = snippet;
  const regex = new RegExp(`(${queryWords.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  highlighted = highlighted.replace(regex, '<mark>$1</mark>');
  return highlighted;
}

