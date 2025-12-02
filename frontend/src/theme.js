// Theme Color System
export const theme = {
  colors: {
    primary: {
      50: '#f0f7ff',
      100: '#e0efff',
      200: '#bae0ff',
      300: '#7ac8ff',
      400: '#36b3ff',
      500: '#0090ff',
      600: '#0070d8',
      700: '#0055b8',
      800: '#003d8a',
      900: '#002b5c',
    },
    secondary: {
      50: '#e6f3ff',
      100: '#cce6ff',
      200: '#99cdff',
      300: '#66b3ff',
      400: '#3399ff',
      500: '#0066ff',
      600: '#0052cc',
      700: '#003d99',
      800: '#002966',
      900: '#001a33',
    },
    accent: {
      50: '#f5f9fc',
      100: '#e8f2f8',
      200: '#d1e5f0',
      300: '#aad4e6',
      400: '#7dbdd6',
      500: '#4fa3c2',
      600: '#3484a8',
      700: '#25658e',
      800: '#1a4a6f',
      900: '#0d2e47',
    },
    neutral: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
    status: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#0090ff',
    },
  },
  gradients: {
    primary: 'linear-gradient(135deg, #0090ff 0%, #0055b8 100%)',
    secondary: 'linear-gradient(135deg, #0066ff 0%, #4fa3c2 100%)',
    accent: 'linear-gradient(135deg, #4fa3c2 0%, #0090ff 100%)',
    success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  },
  shadows: {
    sm: '0 4px 15px rgba(0, 0, 0, 0.08)',
    md: '0 10px 30px rgba(0, 0, 0, 0.1)',
    lg: '0 20px 50px rgba(0, 0, 0, 0.15)',
    primary: '0 20px 40px rgba(0, 144, 255, 0.2)',
  },
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
  borderRadius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    full: '50%',
  },
};

// Utility function to get color
export const getColor = (path) => {
  return path.split('.').reduce((obj, key) => obj?.[key], theme.colors);
};

// Utility function to get gradient
export const getGradient = (name) => theme.gradients[name];

export default theme;
