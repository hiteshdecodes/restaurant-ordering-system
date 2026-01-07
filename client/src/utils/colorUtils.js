/**
 * Color utility functions for automatic hover state generation
 */

/**
 * Convert hex color to RGB
 * @param {string} hex - Hex color code (e.g., '#FF6B35')
 * @returns {object} RGB object {r, g, b}
 */
export const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

/**
 * Convert RGB to hex color
 * @param {number} r - Red value (0-255)
 * @param {number} g - Green value (0-255)
 * @param {number} b - Blue value (0-255)
 * @returns {string} Hex color code
 */
export const rgbToHex = (r, g, b) => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
};

/**
 * Convert RGB to HSL
 * @param {number} r - Red value (0-255)
 * @param {number} g - Green value (0-255)
 * @param {number} b - Blue value (0-255)
 * @returns {object} HSL object {h, s, l}
 */
export const rgbToHsl = (r, g, b) => {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
      default: h = 0;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
};

/**
 * Convert HSL to RGB
 * @param {number} h - Hue (0-360)
 * @param {number} s - Saturation (0-100)
 * @param {number} l - Lightness (0-100)
 * @returns {object} RGB object {r, g, b}
 */
export const hslToRgb = (h, s, l) => {
  h = h / 360;
  s = s / 100;
  l = l / 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
};

/**
 * Generate hover color by lightening the original color
 * @param {string} hexColor - Hex color code
 * @param {number} lightenAmount - Amount to lighten (0-100, default 15)
 * @returns {string} Lightened hex color
 */
export const generateHoverColor = (hexColor, lightenAmount = 15) => {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return hexColor;

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const newL = Math.min(hsl.l + lightenAmount, 95); // Cap at 95% to avoid white
  const newRgb = hslToRgb(hsl.h, hsl.s, newL);

  return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
};

/**
 * Generate darker color for active/pressed state
 * @param {string} hexColor - Hex color code
 * @param {number} darkenAmount - Amount to darken (0-100, default 15)
 * @returns {string} Darkened hex color
 */
export const generateDarkerColor = (hexColor, darkenAmount = 15) => {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return hexColor;

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const newL = Math.max(hsl.l - darkenAmount, 5); // Cap at 5% to avoid black
  const newRgb = hslToRgb(hsl.h, hsl.s, newL);

  return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
};

