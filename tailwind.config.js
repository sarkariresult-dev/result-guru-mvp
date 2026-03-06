/**
 * Tailwind CSS v4 uses CSS-based configuration (@theme / @utility / @custom-variant
 * in globals.css). This file exists ONLY for editor tooling (IntelliSense,
 * Prettier plugin).
 *
 * Do NOT add theme tokens here — define them in app/globals.css via @theme.
 *
 * @type {import('tailwindcss').Config}
 */
export default {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  plugins: [],
}