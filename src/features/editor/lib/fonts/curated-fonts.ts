export interface CuratedFont {
  family: string;
  weights: number[];
  category: "meme" | "display" | "handwriting" | "sans" | "serif";
}

export const CURATED_FONTS: CuratedFont[] = [
  { family: "Anton", weights: [400], category: "meme" },
  { family: "Impact", weights: [400], category: "meme" },
  { family: "Bebas Neue", weights: [400], category: "meme" },
  { family: "Oswald", weights: [400, 500, 600, 700], category: "display" },
  { family: "Archivo Black", weights: [400], category: "display" },
  { family: "Space Grotesk", weights: [400, 500, 600, 700], category: "display" },
  { family: "Poppins", weights: [400, 500, 600, 700], category: "sans" },
  { family: "Inter", weights: [400, 500, 600, 700], category: "sans" },
  { family: "Roboto", weights: [400, 500, 700], category: "sans" },
  { family: "Playfair Display", weights: [400, 600, 700], category: "serif" },
  { family: "Caveat", weights: [400, 600, 700], category: "handwriting" },
  { family: "Permanent Marker", weights: [400], category: "handwriting" },
];

// "Impact" is a system font (not on Google Fonts) — treat separately.
export const SYSTEM_FONTS = new Set(["Impact"]);
