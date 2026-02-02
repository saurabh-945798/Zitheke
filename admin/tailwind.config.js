/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", "sans-serif"], // Consistent with sidebar
      },
      colors: {
        brand: {
          dark: "#1E1B4B",   // deep indigo
          main: "#2E3192",   // primary blue
          accent: "#4A47A3", // lighter violet-blue
          gold: "#F4B400",   // yellow accent
          gray: "#F8FAFC",   // dashboard background
        },
      },
      backgroundImage: {
        "admin-gradient": "linear-gradient(to bottom right, #1E1B4B, #2E3192, #4A47A3)",
      },
    },
  },
  plugins: [],
};
