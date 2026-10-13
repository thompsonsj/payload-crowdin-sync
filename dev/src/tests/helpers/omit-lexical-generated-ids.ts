/**
 * Payload's convertHTMLToLexical assigns ObjectIDs to link and upload nodes.
 * Strip them before comparing editor state so tests stay stable.
 */
export const omitLexicalGeneratedIds = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(omitLexicalGeneratedIds)
  }
  if (value && typeof value === 'object') {
    const node = value as Record<string, unknown>
    const next: Record<string, unknown> = {}
    for (const [key, child] of Object.entries(node)) {
      if (key === 'id' && (node.type === 'link' || node.type === 'upload')) {
        continue
      }
      next[key] = omitLexicalGeneratedIds(child)
    }
    return next
  }
  return value
}
