import { Bricolage_Grotesque, Manrope } from "next/font/google";

// latin-ext is required for French, German, Italian and Spanish accents.
export const fontDisplay = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const fontBody = Manrope({
  variable: "--font-body",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const fontVariables = `${fontDisplay.variable} ${fontBody.variable}`;
