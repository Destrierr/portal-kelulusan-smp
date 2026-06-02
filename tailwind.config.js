/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Mengatur Manrope sebagai font sans-serif utama
        sans: ['Manrope', 'sans-serif'], 
      keyframes: {
        'aurora-intense': {
          '0%, 100%': {
            'background-position': '0% 50%',
          },
          '25%': {
            'background-position': '100% 0%',
          },
          '50%': {
            'background-position': '100% 100%',
          },
          '75%': {
            'background-position': '0% 100%',
          },
        },
      },
      animation: {
        // Durasi 15 detik (ease-in-out) membuat pergerakan warna gradasi 
        // terlihat jelas mengalir bergantian tanpa terlihat patah/kasar.
        'aurora-intense': 'aurora-intense 15s ease-in-out infinite',
      },
      },
    },
    plugins: [],
  }
}