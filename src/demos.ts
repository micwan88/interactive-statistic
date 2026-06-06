// Registry of interactive demos — drives the landing page cards.
// Add a new demo here and create its route in App.tsx.
export interface Demo {
  path: string;
  emoji: string;
  title: string;
  blurb: string;
}

export const DEMOS: Demo[] = [
  {
    path: "/binomial-normal",
    emoji: "🪙",
    title: "Binomial → Normal",
    blurb:
      "Flip n coins and watch the binomial distribution approach the normal as n grows.",
  },
  {
    path: "/clt",
    emoji: "🎲",
    title: "Central Limit Theorem",
    blurb:
      "Roll dice and see the sample mean turn from a uniform distribution into a bell curve.",
  },
  {
    path: "/r-squared",
    emoji: "📈",
    title: "R²: Decomposing Variance",
    blurb:
      "Split total variance into the part explained by regression (SSR) and the residual (SSE).",
  },
];
