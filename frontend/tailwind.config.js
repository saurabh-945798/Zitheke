/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bliyeBlue: "#2563eb",   // company blue
        bliyeYellow: "#facc15", // accent yellow
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"], // global premium font
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide'), // 👈 hides scrollbar (for category bar)
  ],
};
