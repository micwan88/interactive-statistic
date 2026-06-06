import { Link } from "react-router-dom";
import { palette, fonts } from "../style/theme";
import { DEMOS, type Demo } from "../demos";

function DemoCard({ demo }: { demo: Demo }) {
  return (
    <Link
      to={demo.path}
      style={{
        display: "block",
        background: palette.card,
        border: `1px solid ${palette.border}`,
        borderRadius: 16,
        padding: 20,
        textDecoration: "none",
        color: palette.text,
        transition: "border-color 0.2s, transform 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = palette.blue;
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = palette.border;
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div style={{ fontSize: 32, marginBottom: 10 }}>{demo.emoji}</div>
      <div
        style={{
          fontSize: 17,
          fontWeight: 700,
          fontFamily: fonts.display,
          marginBottom: 8,
        }}
      >
        {demo.title}
      </div>
      <p
        style={{
          margin: 0,
          fontSize: 13,
          lineHeight: 1.6,
          color: palette.textDim,
        }}
      >
        {demo.blurb}
      </p>
    </Link>
  );
}

export default function Home() {
  return (
    <div
      style={{
        background: palette.bg,
        minHeight: "100vh",
        color: palette.text,
        fontFamily: fonts.sans,
        padding: "48px 16px",
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <header style={{ textAlign: "center", marginBottom: 40 }}>
          <h1
            style={{
              fontSize: 34,
              fontWeight: 800,
              fontFamily: fonts.display,
              background: `linear-gradient(135deg, ${palette.amber}, ${palette.blue}, ${palette.green})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              margin: 0,
              letterSpacing: -0.5,
            }}
          >
            Interactive Statistics
          </h1>
          <p style={{ color: palette.textMuted, fontSize: 15, marginTop: 10 }}>
            Hands-on visualizations for some core statistics concepts.
          </p>
        </header>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
          }}
        >
          {DEMOS.map((demo) => (
            <DemoCard key={demo.path} demo={demo} />
          ))}
        </div>
      </div>
    </div>
  );
}
