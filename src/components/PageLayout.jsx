import { Link } from "react-router-dom";
import { palette, fonts } from "../style/theme.js";

// Shared shell so every interactive page has the same background,
// container width, top navigation and header treatment.
export default function PageLayout({ title, subtitle, maxWidth = 900, children }) {
  return (
    <div
      style={{
        background: palette.bg,
        minHeight: "100vh",
        color: palette.text,
        fontFamily: fonts.sans,
        padding: "24px 16px",
      }}
    >
      <div style={{ maxWidth, margin: "0 auto" }}>
        <nav style={{ marginBottom: 8 }}>
          <Link
            to="/"
            style={{
              fontSize: 13,
              color: palette.textDim,
              textDecoration: "none",
              fontFamily: fonts.mono,
            }}
          >
            ← All demos
          </Link>
        </nav>

        <header style={{ textAlign: "center", marginBottom: 28 }}>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 800,
              fontFamily: fonts.display,
              background: `linear-gradient(135deg, ${palette.amber}, ${palette.blue}, ${palette.green})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              margin: 0,
              letterSpacing: -0.5,
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p style={{ color: palette.textMuted, fontSize: 14, marginTop: 8 }}>
              {subtitle}
            </p>
          )}
        </header>

        {children}
      </div>
    </div>
  );
}
