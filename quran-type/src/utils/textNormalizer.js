export function normalizeText(text) {
  return (text ?? '')
    .replace(/<sup[^>]*>[\s\S]*?<\/sup>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/[\u200b\u200c\u200d\ufeff]/g, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .normalize('NFC')
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2018\u2019\u02bf\u02be]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}
