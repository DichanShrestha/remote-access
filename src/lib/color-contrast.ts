/**
 * Return a readable label color for a solid button fill.
 * Accepts #rgb/#rrggbb; falls back to dark text for unknown formats.
 */
export function readableTextColor(background: string | undefined, light = '#ffffff', dark = '#171715'): string {
  if (!background) return dark;
  const hex = background.trim().replace('#', '');
  const full = hex.length === 3 ? hex.split('').map((char) => char + char).join('') : hex;
  if (!/^[0-9a-f]{6}$/i.test(full)) return dark;
  const [r, g, b] = [0, 2, 4].map((offset) => parseInt(full.slice(offset, offset + 2), 16) / 255);
  const channel = (value: number) => (value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  const luminance = 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
  return luminance > 0.45 ? dark : light;
}
