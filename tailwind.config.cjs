module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'sans-serif'], heading: ['Poppins', 'sans-serif'] },
      colors: {
        brand: { blue: '#0a2540', lightBlue: '#1e4a7a', gold: '#f6b716', goldDark: '#d99e0b', accent: '#e6f0fa' }
      },
      boxShadow: {
        premium: '0 20px 40px -15px rgba(10, 37, 64, 0.1)',
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
      },
      animation: { 'scroll-x': 'scrollX 30s linear infinite' },
      keyframes: { scrollX: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-100%)' } } }
    }
  },
  plugins: []
};
