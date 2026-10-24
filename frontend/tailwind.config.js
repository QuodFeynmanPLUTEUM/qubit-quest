/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        qq: {
          bg: '#f4f5fb',
          surface: '#ffffff',
          border: '#e6e7f2',
          ink: '#1e2130',
          subtle: '#6b7084',
          faint: '#9397a8',
          primary: '#7c5cff',
          primaryDark: '#6a47f0',
          primarySoft: '#efeaff',
          blue: '#3b82f6',
          blueSoft: '#dbe9ff',
          orange: '#f97316',
          orangeSoft: '#ffe7d1',
          green: '#16a34a',
          greenSoft: '#dcfce7',
          amber: '#d97706',
          amberSoft: '#fef3c7',
          rose: '#e11d48',
          roseSoft: '#ffe4e9',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(30, 33, 48, 0.04), 0 8px 24px -12px rgba(30, 33, 48, 0.12)',
      },
    },
  },
  plugins: [],
};
