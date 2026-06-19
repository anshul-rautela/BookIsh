export function hasSpoilerTag(text) {
  return text && text.includes('[spoiler]')
}

export function stripSpoilerTags(text) {
  if (!text) return ''
  return text.replace(/\[spoiler\]/gi, '').replace(/\[\/spoiler\]/gi, '').trim()
}
