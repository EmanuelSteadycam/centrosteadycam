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
        cs: {
          orange:    "#ff7302",
          orangeHov: "#ffa902",
          charcoal:  "#3f424a",
          sage:      "#a3d39c",
          sageOv:    "rgba(136,191,129,0.49)",
          text:      "#444444",
          textLight: "#999999",
        },
      },
      fontFamily: {
        sans:  ["var(--font-open-sans)", "system-ui", "sans-serif"],
        title: ["var(--font-montserrat)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
