export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,vue,html}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'audiowide': ['Audiowide', 'cursive'],
        'montserrat': ['Montserrat', 'sans-serif'],
      },
      colors: {
        'cyber-blue': '#00f0ff',
        'cyber-purple': '#9d00ff',
        'cyber-pink': '#ff00f7',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}