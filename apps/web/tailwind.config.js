/** @type {import('tailwindcss').Config} */

// Colors resolve through CSS variables (see src/index.css) so swapping a theme is
// a variable write rather than a rebuild. Values are "R G B" triplets.
const withAlpha = (variable) => `rgb(var(${variable}) / <alpha-value>)`;

export default {
  darkMode: ['class', '[data-sheet="graphite"]'],
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
        // Non-repro blue. Frames and hairlines are the same ink as collar labels
        // because they are the same thing: scaffolding, not content.
        structure: {
          DEFAULT: withAlpha('--rl-structure'),
          ink: withAlpha('--rl-structure-ink'),
        },
        border: {
          DEFAULT: withAlpha('--rl-structure'),
        },
        rule: withAlpha('--rl-structure'),
        text: {
          primary: withAlpha('--rl-ink-1'),
          secondary: withAlpha('--rl-ink-2'),
          muted: withAlpha('--rl-ink-3'),
        },
        // Checker's green. Recency, confirmed, current — and nothing else, ever.
        signal: {
          DEFAULT: withAlpha('--rl-signal'),
          ink: withAlpha('--rl-signal-ink'),
        },
      },
      fontFamily: {
        // Map lettering is condensed because collar space is scarce.
        collar: [
          '"Roboto Condensed Variable"',
          '"Roboto Condensed"',
          '"Liberation Sans Narrow"',
          '"Arial Narrow"',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
        // Survey and geological reports set their descriptive text in a plain
        // oldstyle book face. Not a display serif — this is for reading at 14px.
        prose: [
          '"EB Garamond Variable"',
          '"EB Garamond"',
          '"Crimson Pro"',
          'Garamond',
          '"Liberation Serif"',
          'Georgia',
          'ui-serif',
          'serif',
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Consolas',
          '"Liberation Mono"',
          'monospace',
        ],
      },
      fontSize: {
        // Collar sizes stay small and tight. Prose sizes run larger than a
        // sans would need: EB Garamond has a small oldstyle x-height, so 15px
        // of it reads like 13px of Helvetica.
        '2xs': ['0.625rem', { lineHeight: '0.8125rem' }],
        xs: ['0.6875rem', { lineHeight: '0.9375rem' }],
        sm: ['0.8125rem', { lineHeight: '1.125rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.1875rem', { lineHeight: '1.6875rem' }],
        xl: ['1.4375rem', { lineHeight: '1.8125rem' }],
        '2xl': ['1.875rem', { lineHeight: '2.125rem' }],
        '3xl': ['2.625rem', { lineHeight: '2.75rem' }],
      },
      borderRadius: {
        // Structural frames get 0. Only things you can click get the 2px.
        none: '0',
        control: '2px',
      },
      boxShadow: {
        none: 'none',
      },
    },
  },
  plugins: [],
};
