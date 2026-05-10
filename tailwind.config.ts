import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0F172A",
          50: "#F8FAFC",
          100: "#F1F5F9",
          800: "#1E293B",
          900: "#0F172A",
        },
        sky: {
          brand: "#38BDF8",
          400: "#38BDF8",
        },
        cyan: {
          glow: "#22D3EE",
        },
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-plus-jakarta)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-mesh":
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(56,189,248,0.35), transparent), radial-gradient(ellipse 60% 40% at 100% 0%, rgba(34,211,238,0.2), transparent), linear-gradient(180deg, #F0F9FF 0%, #FFFFFF 45%, #F8FAFC 100%)",
        "glass-shine":
          "linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 50%)",
        "emergency":
          "linear-gradient(135deg, #DC2626 0%, #991B1B 50%, #7F1D1D 100%)",
        "cyan-soft": "linear-gradient(135deg, #38BDF8 0%, #22D3EE 50%, #06B6D4 100%)",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(15, 23, 42, 0.08), 0 2px 8px rgba(56, 189, 248, 0.12)",
        "glass-lg":
          "0 25px 50px -12px rgba(15, 23, 42, 0.15), 0 0 0 1px rgba(255,255,255,0.5) inset",
        float: "0 12px 40px rgba(56, 189, 248, 0.35)",
      },
      animation: {
        shimmer: "shimmer 2s linear infinite",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
