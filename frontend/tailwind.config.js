/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "rgba(255, 255, 255, 0.08)",
        glass: "rgba(10, 10, 15, 0.7)",
        card: "rgba(18, 18, 24, 0.8)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "sans-serif"],
        mono: ["var(--font-mono)", "Roboto Mono", "monospace"],
      },
      backgroundImage: {
        "radial-glow": "radial-gradient(circle at top, rgba(99, 102, 241, 0.15), transparent 60%)",
        "mesh-glow": "radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.1), rgba(99, 102, 241, 0.05), transparent 50%)",
      },
      animation: {
        "pulse-glow": "pulse-glow 2s infinite ease-in-out",
        "float-particle": "float-particle 10s infinite linear",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: 0.6, transform: "scale(1)" },
          "50%": { opacity: 1, transform: "scale(1.05)" },
        },
      },
    },
  },
  plugins: [],
};
