/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#4B50EC",
        neutral: {
          10: "#f8f9fb",
          20: "#f1f5f9",
          30: "#e2e8f0",
          40: "#cbd5e1",
          50: "#94a3b8",
          60: "#64748b",
          70: "#475569",
          80: "#334155",
          90: "#1e293b",
          100: "#1c1d22",
        },
      },
    },
  },
  plugins: [],
};
