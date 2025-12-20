/**
 * Extract plain text from HTML string
 */
export function htmlToPlainText(html: string): string {
  if (!html) return "";

  // Replace block-level elements and line breaks with spaces before parsing
  let processed = html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/p>/gi, " ")
    .replace(/<\/li>/gi, " ")
    .replace(/<\/div>/gi, " ")
    .replace(/<\/h[1-6]>/gi, " ");

  // Use DOMParser for safe HTML parsing
  const parser = new DOMParser();
  const doc = parser.parseFromString(processed, "text/html");

  // Get text content, normalize whitespace
  return (doc.body.textContent || "").replace(/\s+/g, " ").trim();
}

/**
 * Truncate text to specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
}

/**
 * Get preview text from HTML content
 */
export function getHtmlPreview(html: string, maxLength: number = 50): string {
  const plainText = htmlToPlainText(html);
  return truncateText(plainText, maxLength);
}
