export interface Rgb {
  r: number;
  g: number;
  b: number;
}

const HEX_RE = /^#?([a-f\d]{3}|[a-f\d]{4}|[a-f\d]{6}|[a-f\d]{8})$/i;

/** Parses #rgb, #rgba, #rrggbb, and #rrggbbaa into an { r, g, b } triplet (alpha is dropped). */
export function parseHexColor(input: string): Rgb | null {
  const match = HEX_RE.exec(input.trim());
  const captured = match?.[1];
  if (!captured) return null;
  const hex =
    captured.length <= 4
      ? captured
          .slice(0, 3)
          .split('')
          .map((c) => c + c)
          .join('')
      : captured.slice(0, 6);
  const value = Number.parseInt(hex, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

export function isValidHexColor(input: string): boolean {
  return HEX_RE.test(input.trim());
}

export function rgbToHex({ r, g, b }: Rgb): string {
  const toHex = (n: number) =>
    Math.round(clamp(n, 0, 255))
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/** Converts a hex color into the "R G B" space-separated triplet Tailwind's rgb()/<alpha-value> syntax expects. */
export function hexToRgbTriplet(input: string, fallback: Rgb = { r: 0, g: 0, b: 0 }): string {
  const rgb = parseHexColor(input) ?? fallback;
  return `${rgb.r} ${rgb.g} ${rgb.b}`;
}

export function mix(a: string, b: string, weight: number): string {
  const colorA = parseHexColor(a);
  const colorB = parseHexColor(b);
  if (!colorA || !colorB) return a;
  const w = clamp(weight, 0, 1);
  return rgbToHex({
    r: colorA.r + (colorB.r - colorA.r) * w,
    g: colorA.g + (colorB.g - colorA.g) * w,
    b: colorA.b + (colorB.b - colorA.b) * w,
  });
}

export function lighten(hex: string, amount: number): string {
  return mix(hex, '#ffffff', amount);
}

export function darken(hex: string, amount: number): string {
  return mix(hex, '#000000', amount);
}

/** WCAG 2.1 relative luminance. */
export function relativeLuminance(hex: string): number {
  const rgb = parseHexColor(hex) ?? { r: 0, g: 0, b: 0 };
  const channel = (value: number) => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b);
}

/** WCAG 2.1 contrast ratio, 1–21. */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/**
 * Nudges `color` toward white or black — whichever direction moves away from
 * `background` — until it clears `target`. Preserves hue far better than
 * substituting a different color, so an imported theme still looks like itself.
 */
export function ensureContrast(color: string, background: string, target = 4.5): string {
  if (contrastRatio(color, background) >= target) return color;
  const towardLight = relativeLuminance(background) < 0.5;
  let result = color;
  for (let step = 1; step <= 20; step++) {
    result = towardLight ? lighten(color, step * 0.05) : darken(color, step * 0.05);
    if (contrastRatio(result, background) >= target) return result;
  }
  return towardLight ? '#ffffff' : '#000000';
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
