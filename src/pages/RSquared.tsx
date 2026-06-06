/**
 * R² visualization — decomposes total variance into explained (SSR)
 * and unexplained (SSE) parts.
 *
 *   SST = Σ(yᵢ − ȳ)²   (total)
 *   SSR = Σ(ŷᵢ − ȳ)²   (explained by regression)
 *   SSE = Σ(yᵢ − ŷᵢ)²  (unexplained, residuals)
 *
 *   SST = SSR + SSE
 *   R²  = SSR / SST = 1 − SSE / SST
 */

import { useState, useMemo } from "react";
import type { ReactNode } from "react";
import PageLayout from "../components/PageLayout";
import { palette, alpha } from "../style/theme";

// ---- Data ------------------------------------------------------
const BASE_X = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const BASE_Y = [1.7, 2.4, 3.1, 3.8, 4.5, 5.2, 5.9, 6.6, 7.3, 8.0];
const NOISE_OFFSETS = [0.9, -0.6, 1.3, -0.8, 0.4, -1.1, 0.7, 1.2, -0.9, 0.5];

// ---- Plot geometry --------------------------------------------
const X_MIN = 0;
const X_MAX = 11;
const Y_MIN = 0;
const Y_MAX = 10;
const PLOT_LEFT = 50;
const PLOT_RIGHT = 580;
const PLOT_TOP = 20;
const PLOT_BOTTOM = 340;

const xPx = (x: number) =>
  PLOT_LEFT + ((x - X_MIN) / (X_MAX - X_MIN)) * (PLOT_RIGHT - PLOT_LEFT);
const yPx = (y: number) =>
  PLOT_BOTTOM - ((y - Y_MIN) / (Y_MAX - Y_MIN)) * (PLOT_BOTTOM - PLOT_TOP);

// ---- Colors (dark theme, from centralised tokens) -------------
const COLORS = {
  point: palette.blue,
  regLine: palette.blue,
  meanLine: alpha.meanLine,
  total: "rgba(148,163,184,0.55)",
  residual: palette.red,
  explained: palette.green,
  grid: alpha.gridLine,
  axis: palette.textDim,
  bg: palette.card,
  cardBg: palette.card,
  textPrimary: palette.text,
  textSecondary: palette.textDim,
  border: palette.border,
  borderStrong: palette.borderStrong,
};

// ---- Stats -----------------------------------------------------
function computeData(noiseLevel: number) {
  const x = BASE_X;
  const y = BASE_Y.map((v, i) => v + noiseLevel * NOISE_OFFSETS[i]);
  const n = x.length;
  const xMean = x.reduce((a, b) => a + b, 0) / n;
  const yMean = y.reduce((a, b) => a + b, 0) / n;
  const num = x.reduce((s, xi, i) => s + (xi - xMean) * (y[i] - yMean), 0);
  const den = x.reduce((s, xi) => s + (xi - xMean) ** 2, 0);
  const slope = num / den;
  const intercept = yMean - slope * xMean;
  const yHat = x.map((xi) => intercept + slope * xi);
  const sst = y.reduce((s, yi) => s + (yi - yMean) ** 2, 0);
  const sse = y.reduce((s, yi, i) => s + (yi - yHat[i]) ** 2, 0);
  const ssr = yHat.reduce((s, yhi) => s + (yhi - yMean) ** 2, 0);
  const r2 = sst > 0 ? ssr / sst : 1;
  return { x, y, yHat, xMean, yMean, slope, intercept, sst, sse, ssr, r2 };
}

// ---- Subcomponents --------------------------------------------
function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: string;
}) {
  return (
    <div
      style={{
        background: COLORS.cardBg,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 8,
        padding: "10px 12px",
      }}
    >
      <div style={{ fontSize: 12, color: accent || COLORS.textSecondary }}>
        {label}
      </div>
      <div
        style={{
          fontSize: 20,
          fontWeight: 500,
          marginTop: 2,
          color: accent || COLORS.textPrimary,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "6px 12px",
        fontSize: 13,
        borderRadius: 8,
        cursor: "pointer",
        background: active ? COLORS.cardBg : "transparent",
        border: `1px solid ${active ? COLORS.borderStrong : COLORS.border}`,
        color: active ? COLORS.textPrimary : COLORS.textSecondary,
        fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  );
}

// ---- Main component -------------------------------------------
export default function RSquared() {
  const [noisePct, setNoisePct] = useState(60);
  const [mode, setMode] = useState("total");

  const noiseLevel = noisePct / 100;
  const data = useMemo(() => computeData(noiseLevel), [noiseLevel]);

  const showTotal = mode === "total" || mode === "all";
  const showResid = mode === "residual" || mode === "all";
  const showExp = mode === "explained" || mode === "all";

  const yL = data.intercept + data.slope * X_MIN;
  const yR = data.intercept + data.slope * X_MAX;

  const xTicks = [0, 2, 4, 6, 8, 10];
  const yTicks = [0, 2, 4, 6, 8, 10];

  const modes = [
    { id: "total", label: "Total (SST)" },
    { id: "residual", label: "Unexplained (SSE)" },
    { id: "explained", label: "Explained (SSR)" },
    { id: "all", label: "Show all three" },
  ];

  return (
    <PageLayout
      title="📈 R²: Decomposing Variance"
      subtitle="Split total variance into the part explained by regression (SSR) and the residual (SSE)"
      maxWidth={700}
    >
      <svg
        viewBox="0 0 600 380"
        style={{
          width: "100%",
          height: "auto",
          background: COLORS.bg,
          borderRadius: 8,
          border: `1px solid ${COLORS.border}`,
        }}
        role="img"
        aria-label="Interactive scatter plot decomposing total variance into explained and unexplained parts"
      >
        {/* Grid */}
        {xTicks.map((x) => (
          <g key={`gv-${x}`}>
            <line
              x1={xPx(x)}
              x2={xPx(x)}
              y1={PLOT_TOP}
              y2={PLOT_BOTTOM}
              stroke={COLORS.grid}
              strokeWidth="0.5"
            />
            <text
              x={xPx(x)}
              y={PLOT_BOTTOM + 16}
              textAnchor="middle"
              fontSize="11"
              fill={COLORS.axis}
            >
              {x}
            </text>
          </g>
        ))}
        {yTicks.map((y) => (
          <g key={`gh-${y}`}>
            <line
              x1={PLOT_LEFT}
              x2={PLOT_RIGHT}
              y1={yPx(y)}
              y2={yPx(y)}
              stroke={COLORS.grid}
              strokeWidth="0.5"
            />
            <text
              x={PLOT_LEFT - 8}
              y={yPx(y) + 4}
              textAnchor="end"
              fontSize="11"
              fill={COLORS.axis}
            >
              {y}
            </text>
          </g>
        ))}

        {/* Deviation lines (under the regression line so they don't cover it) */}
        {data.x.map((xi, i) => {
          const px = xPx(xi);
          const pyData = yPx(data.y[i]);
          const pyHat = yPx(data.yHat[i]);
          const pyMean = yPx(data.yMean);
          const offsetT = mode === "all" ? -3.5 : 0;
          const offsetE = mode === "all" ? 3.5 : 0;
          return (
            <g key={`dev-${i}`}>
              {showTotal && (
                <line
                  x1={px + offsetT}
                  x2={px + offsetT}
                  y1={pyData}
                  y2={pyMean}
                  stroke={COLORS.total}
                  strokeWidth={mode === "all" ? 1.5 : 2}
                />
              )}
              {showResid && (
                <line
                  x1={px}
                  x2={px}
                  y1={pyData}
                  y2={pyHat}
                  stroke={COLORS.residual}
                  strokeWidth="2"
                />
              )}
              {showExp && (
                <line
                  x1={px + offsetE}
                  x2={px + offsetE}
                  y1={pyHat}
                  y2={pyMean}
                  stroke={COLORS.explained}
                  strokeWidth="2"
                />
              )}
            </g>
          );
        })}

        {/* Mean line */}
        <line
          x1={PLOT_LEFT}
          x2={PLOT_RIGHT}
          y1={yPx(data.yMean)}
          y2={yPx(data.yMean)}
          stroke={COLORS.meanLine}
          strokeWidth="1"
          strokeDasharray="4 3"
        />

        {/* Regression line */}
        <line
          x1={xPx(X_MIN)}
          x2={xPx(X_MAX)}
          y1={yPx(yL)}
          y2={yPx(yR)}
          stroke={COLORS.regLine}
          strokeWidth="1.5"
        />

        {/* Predicted points (hollow markers on the regression line) */}
        {(showResid || showExp || mode === "all") &&
          data.x.map((xi, i) => (
            <circle
              key={`pred-${i}`}
              cx={xPx(xi)}
              cy={yPx(data.yHat[i])}
              r="2.5"
              fill={COLORS.bg}
              stroke={COLORS.regLine}
              strokeWidth="1"
            />
          ))}

        {/* Data points */}
        {data.x.map((xi, i) => (
          <circle
            key={`pt-${i}`}
            cx={xPx(xi)}
            cy={yPx(data.y[i])}
            r="4"
            fill={COLORS.point}
          />
        ))}

        {/* Line labels */}
        <text
          x={xPx(X_MAX) - 5}
          y={yPx(yR) - 6}
          textAnchor="end"
          fontSize="11"
          fill={COLORS.regLine}
        >
          ŷ (regression line)
        </text>
        <text
          x={xPx(X_MIN) + 5}
          y={yPx(data.yMean) - 5}
          fontSize="11"
          fill={COLORS.textSecondary}
        >
          ȳ (mean of y)
        </text>
      </svg>

      {/* Slider */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          margin: "1.25rem 0 1rem",
        }}
      >
        <label
          style={{
            fontSize: 13,
            color: COLORS.textSecondary,
            minWidth: 110,
          }}
        >
          Scatter amount
        </label>
        <input
          type="range"
          min="0"
          max="120"
          step="1"
          value={noisePct}
          onChange={(e) => setNoisePct(Number(e.target.value))}
          style={{ flex: 1, accentColor: palette.blue }}
        />
        <span style={{ fontSize: 13, minWidth: 36, textAlign: "right" }}>
          {noiseLevel.toFixed(2)}
        </span>
      </div>

      {/* Mode toggles */}
      <div
        style={{
          display: "flex",
          gap: 8,
          margin: "0 0 1rem",
          flexWrap: "wrap",
        }}
      >
        {modes.map((m) => (
          <ModeButton
            key={m.id}
            active={mode === m.id}
            onClick={() => setMode(m.id)}
          >
            {m.label}
          </ModeButton>
        ))}
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 8,
          margin: "1rem 0",
        }}
      >
        <StatCard label="SST (total)" value={data.sst.toFixed(2)} />
        <StatCard
          label="SSE (unexplained)"
          value={data.sse.toFixed(2)}
          accent={COLORS.residual}
        />
        <StatCard
          label="SSR (explained)"
          value={data.ssr.toFixed(2)}
          accent={COLORS.explained}
        />
        <StatCard label="R²" value={data.r2.toFixed(3)} />
      </div>

      {/* Identity */}
      <div
        style={{
          textAlign: "center",
          padding: 12,
          background: COLORS.cardBg,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 8,
          fontSize: 14,
          color: COLORS.textSecondary,
        }}
      >
        <span style={{ color: COLORS.textPrimary, fontWeight: 500 }}>
          SST = SSR + SSE
        </span>
        {" · "}R² = SSR / SST = 1 − SSE / SST
      </div>
    </PageLayout>
  );
}
