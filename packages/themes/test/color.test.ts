import { describe, expect, it } from 'vitest';
import {
  hexToRgbTriplet,
  isValidHexColor,
  lighten,
  darken,
  parseHexColor,
  rgbToHex,
} from '../src/color.js';

describe('color utils', () => {
  it('parses hex colors of every valid length', () => {
    expect(parseHexColor('#fff')).toEqual({ r: 255, g: 255, b: 255 });
    expect(parseHexColor('#0d1117')).toEqual({ r: 13, g: 17, b: 23 });
    expect(parseHexColor('#0d1117ff')).toEqual({ r: 13, g: 17, b: 23 });
  });

  it('rejects invalid colors', () => {
    expect(parseHexColor('not-a-color')).toBeNull();
    expect(isValidHexColor('not-a-color')).toBe(false);
    expect(isValidHexColor('#2f81f7')).toBe(true);
  });

  it('converts hex to an "R G B" triplet', () => {
    expect(hexToRgbTriplet('#0d1117')).toBe('13 17 23');
  });

  it('lightens and darkens toward white/black', () => {
    expect(lighten('#000000', 1)).toBe('#ffffff');
    expect(darken('#ffffff', 1)).toBe('#000000');
  });

  it('round-trips rgb -> hex', () => {
    expect(rgbToHex({ r: 13, g: 17, b: 23 })).toBe('#0d1117');
  });
});
