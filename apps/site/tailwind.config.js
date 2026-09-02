/** @type {import('tailwindcss').Config} */

// Colors resolve through CSS variables (see src/index.css) so swapping a theme is
// a variable write rather than a rebuild. Values are "R G B" triplets.
const withAlpha = (variable) => `rgb(var(${variable}) / <alpha-value>)`;

export default {
  darkMode: ['class', '[data-panel="dark"]'],
  content: ['./index.html', './src/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: withAlpha('--rl-surface-1'),
          1: withAlpha('--rl-surface-1'),
          2: withAlpha('--rl-surface-2'),
          3: withAlpha('--rl-surface-3'),
        },
        rule: {
          DEFAULT: withAlpha('--rl-rule'),
          strong: withAlpha('--rl-rule-strong'),
        },
        border: {
          DEFAULT: withAlpha('--rl-rule'),
        },
        text: {
          primary: withAlpha('--rl-ink-1'),
          secondary: withAlpha('--rl-ink-2'),
          muted: withAlpha('--rl-ink-3'),
        },
        // The only hue in the system. Everything else is neutral graphite.
        accent: {
          DEFAULT: withAlpha('--rl-accent'),
          ink: withAlpha('--rl-accent-ink'),
        },
      },
      fontFamily: {
        sans: [
          '"Inter Variable"',
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'sans-serif',
        ],
        mono: [
          '"JetBrains Mono Variable"',
          '"JetBrains Mono"',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          '"Liberation Mono"',
          'monospace',
        ],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '0.9375rem' }],
        xs: ['0.75rem', { lineHeight: '1.0625rem' }],
        sm: ['0.8125rem', { lineHeight: '1.25rem' }],
        base: ['0.875rem', { lineHeight: '1.375rem' }],
        lg: ['1rem', { lineHeight: '1.5rem' }],
        xl: ['1.25rem', { lineHeight: '1.625rem' }],
        '2xl': ['1.625rem', { lineHeight: '1.875rem' }],
        '3xl': ['2rem', { lineHeight: '2.25rem' }],
      },
      borderRadius: {
        control: '3px',
      },
    },
  },
  plugins: [],
};
