// ---------------------------------------------------------------
// Centralised design tokens — single source of truth for the site.
// Consumed by Tailwind (tailwind.config.js) and by the chart/SVG
// code that needs raw colour values for inline styles.
// ---------------------------------------------------------------

// Solid palette (minimalist dark theme)
export const palette = {
  bg: "#0a0e1a",
  card: "#111827",
  border: "#1e293b",
  borderStrong: "#334155",
  text: "#f1f5f9",
  textDim: "#94a3b8",
  textMuted: "#64748b",
  blue: "#3b82f6",
  amber: "#f59e0b",
  green: "#10b981",
  red: "#ef4444",
  purple: "#a78bfa",
};

// Translucent helpers derived from the palette above
export const alpha = {
  blueDim: "rgba(59,130,246,0.25)",
  blueGlow: "rgba(59,130,246,0.4)",
  amberDim: "rgba(245,158,11,0.15)",
  amberGlow: "rgba(245,158,11,0.4)",
  greenDim: "rgba(16,185,129,0.2)",
  greenGlow: "rgba(16,185,129,0.4)",
  meanLine: "rgba(148,163,184,0.5)",
  gridLine: "rgba(148,163,184,0.10)",
};

// Typography tokens (fonts are loaded once in index.html)
export const fonts = {
  sans: "'Nunito Sans', system-ui, -apple-system, sans-serif",
  mono: "'JetBrains Mono', monospace",
  display: "'Space Mono', monospace",
};
