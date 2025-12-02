/**
 * Theme Configuration & Customization
 * BaraCorrespondance - Advanced Theming System
 */

// Color Palettes
export const colors = {
  // Primary Blue Palette
  blue: {
    50: '#f0f7ff',
    100: '#e0effe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c3d66'
  },

  // Secondary Purple Palette
  purple: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87'
  },

  // Accent Green Palette
  green: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#145231'
  },

  // Neutral Gray Palette
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827'
  },

  // Semantic Colors
  semantic: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#0090ff'
  }
};

// Typography
export const typography = {
  fontFamily: {
    sans: "'Inter', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'Fira Code', 'Courier New', monospace"
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem'
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800
  },
  lineHeight: {
    tight: 1.2,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2
  }
};

// Spacing System
export const spacing = {
  xs: '0.25rem',  // 4px
  sm: '0.5rem',   // 8px
  md: '1rem',     // 16px
  lg: '1.5rem',   // 24px
  xl: '2rem',     // 32px
  '2xl': '2.5rem', // 40px
  '3xl': '3rem',  // 48px
  '4xl': '4rem'   // 64px
};

// Border Radius
export const borderRadius = {
  none: '0',
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.5rem',
  full: '9999px'
};

// Shadow System
export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  glow: '0 0 20px rgba(0, 144, 255, 0.3)',
  'glow-lg': '0 0 40px rgba(0, 144, 255, 0.5)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
};

// Gradients
export const gradients = {
  primary: 'linear-gradient(135deg, #0090ff 0%, #0055b8 100%)',
  secondary: 'linear-gradient(135deg, #9333ea 0%, #6b21a8 100%)',
  accent: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
  warm: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  cool: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
  // Multi-color gradients
  multiBlue: 'linear-gradient(135deg, #0090ff 0%, #4fa3c2 50%, #0055b8 100%)',
  rainbow: 'linear-gradient(90deg, #0090ff, #9333ea, #10b981, #f59e0b, #ef4444)'
};

// Transitions
export const transitions = {
  fast: '150ms ease-in-out',
  base: '200ms ease-in-out',
  slow: '300ms ease-in-out',
  slower: '500ms ease-in-out'
};

// Breakpoints
export const breakpoints = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};

// Component Sizes
export const componentSizes = {
  button: {
    xs: {
      height: '1.75rem',
      padding: '0 0.5rem',
      fontSize: '0.75rem'
    },
    sm: {
      height: '2rem',
      padding: '0 0.75rem',
      fontSize: '0.875rem'
    },
    md: {
      height: '2.5rem',
      padding: '0 1rem',
      fontSize: '1rem'
    },
    lg: {
      height: '3rem',
      padding: '0 1.5rem',
      fontSize: '1.125rem'
    },
    xl: {
      height: '3.5rem',
      padding: '0 2rem',
      fontSize: '1.25rem'
    }
  },
  input: {
    sm: {
      height: '2rem',
      padding: '0 0.75rem',
      fontSize: '0.875rem'
    },
    md: {
      height: '2.5rem',
      padding: '0 1rem',
      fontSize: '1rem'
    },
    lg: {
      height: '3rem',
      padding: '0 1.25rem',
      fontSize: '1.125rem'
    }
  }
};

// Z-index Scale
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  backdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
  notification: 80
};

// Animation Durations
export const durations = {
  fastest: '50ms',
  faster: '100ms',
  fast: '150ms',
  base: '200ms',
  slow: '300ms',
  slower: '500ms',
  slowest: '1000ms'
};

// Response States
export const states = {
  hover: {
    opacity: 0.9,
    transform: 'scale(1.02)',
    transition: 'all 200ms ease-in-out'
  },
  active: {
    opacity: 0.8,
    transform: 'scale(0.98)'
  },
  disabled: {
    opacity: 0.5,
    cursor: 'not-allowed'
  },
  focus: {
    outline: 'none',
    boxShadow: '0 0 0 3px rgba(0, 144, 255, 0.1)',
    borderColor: '#0090ff'
  }
};

// Custom Theme Creator
export const createTheme = (overrides = {}) => {
  const baseTheme = {
    colors,
    typography,
    spacing,
    borderRadius,
    shadows,
    gradients,
    transitions,
    breakpoints,
    componentSizes,
    zIndex,
    durations,
    states
  };

  // Deep merge with overrides
  return {
    ...baseTheme,
    ...overrides
  };
};

// Theme Context Utility
export const useTheme = () => {
  return {
    colors,
    typography,
    spacing,
    borderRadius,
    shadows,
    gradients,
    transitions,
    breakpoints,
    componentSizes,
    zIndex,
    durations,
    states
  };
};

// CSS Variables Generator
export const generateCSSVariables = (theme = {}) => {
  const vars = {};

  // Colors
  Object.entries(theme.colors || colors).forEach(([key, value]) => {
    if (typeof value === 'string') {
      vars[`--color-${key}`] = value;
    } else {
      Object.entries(value).forEach(([shade, color]) => {
        vars[`--color-${key}-${shade}`] = color;
      });
    }
  });

  // Spacing
  Object.entries(theme.spacing || spacing).forEach(([key, value]) => {
    vars[`--spacing-${key}`] = value;
  });

  // Shadows
  Object.entries(theme.shadows || shadows).forEach(([key, value]) => {
    vars[`--shadow-${key}`] = value;
  });

  // Transitions
  Object.entries(theme.transitions || transitions).forEach(([key, value]) => {
    vars[`--transition-${key}`] = value;
  });

  return vars;
};

// Utility function to convert hex to RGB
export const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : null;
};

// Utility function to lighten/darken color
export const adjustColor = (color, percent) => {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return '#' + (
    0x1000000 + (
      R < 255 ? R < 1 ? 0 : R : 255
    ) * 0x10000 +
    (
      G < 255 ? G < 1 ? 0 : G : 255
    ) * 0x100 +
    (
      B < 255 ? B < 1 ? 0 : B : 255
    )
  ).toString(16).slice(1);
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  gradients,
  transitions,
  breakpoints,
  componentSizes,
  zIndex,
  durations,
  states,
  createTheme,
  useTheme,
  generateCSSVariables,
  hexToRgb,
  adjustColor
};
