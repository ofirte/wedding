/**
 * Extract plain text from HTML string
 */
export function htmlToPlainText(html: string): string {
  if (!html) return "";

  // Use DOMParser for safe HTML parsing
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

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
