import { useState, useCallback, useMemo } from "react";
import type { CSSProperties } from "react";
import PageLayout from "../components/PageLayout";
import { palette, alpha } from "../style/theme";

// Colours sourced from the centralised theme
const C = {
  bg: palette.bg,
  card: palette.card,
  border: palette.border,
  amber: palette.amber,
  amberDim: alpha.amberDim,
  blue: palette.blue,
  blueDim: alpha.blueDim,
  green: palette.green,
  greenDim: alpha.greenDim,
  red: palette.red,
  text: palette.text,
  textDim: palette.textDim,
  textMuted: palette.textMuted,
  purple: palette.purple,
};

function comb(n: number, k: number): number {
  if (k > n) return 0;
  if (k === 0 || k === n) return 1;
  let result = 1;
  for (let i = 0; i < Math.min(k, n - k); i++) {
    result = (result * (n - i)) / (i + 1);
  }
  return result;
}

function binomialPMF(n: number, p: number, k: number): number {
  return comb(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
}

function gaussianPDF(x: number, mu: number, sigma: number): number {
  return (
    (1 / (sigma * Math.sqrt(2 * Math.PI))) *
    Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2))
  );
}

function CoinRow({ n, result }: { n: number; result: number | null }) {
  const display = result !== null ? result : null;
  const coins: boolean[] = [];
  if (display !== null && n <= 30) {
    const heads = display;
    const tails = n - display;
    for (let i = 0; i < heads; i++) coins.push(true);
    for (let i = 0; i < tails; i++) coins.push(false);
  }

  if (display === null) return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        justifyContent: "center",
        flexWrap: "wrap",
        padding: "8px 0",
      }}
    >
      {n <= 30 ? (
        coins.map((isHead, i) => (
          <div
            key={i}
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: isHead
                ? `linear-gradient(135deg, ${C.amber}, #d97706)`
                : `linear-gradient(135deg, ${C.textMuted}, #475569)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 700,
              color: isHead ? "#0a0e1a" : C.text,
              boxShadow: isHead ? `0 0 8px ${C.amberDim}` : "none",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {isHead ? "H" : "T"}
          </div>
        ))
      ) : (
        <span
          style={{
            fontSize: 13,
            color: C.textDim,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          n = {n}: too many coins to show individually
        </span>
      )}
      <span
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: C.amber,
          fontFamily: "'JetBrains Mono', monospace",
          marginLeft: 8,
        }}
      >
        Heads = {display}
      </span>
    </div>
  );
}

interface BinomialChartProps {
  n: number;
  p: number;
  empirical: Record<number, number>;
  totalFlips: number;
}

function BinomialChart({ n, p, empirical, totalFlips }: BinomialChartProps) {
  const mu = n * p;
  const sigma = Math.sqrt(n * p * (1 - p));

  const theoreticalData = useMemo(() => {
    const data: { k: number; prob: number }[] = [];
    for (let k = 0; k <= n; k++) {
      data.push({ k, prob: binomialPMF(n, p, k) });
    }
    return data;
  }, [n, p]);

  const maxProb = Math.max(...theoreticalData.map((d) => d.prob));
  const maxEmp =
    totalFlips > 0 ? Math.max(...Object.values(empirical)) / totalFlips : 0;
  const maxY = Math.max(maxProb, maxEmp, 0.01);

  const chartW = 700;
  const chartH = 280;
  const padL = 50;
  const padR = 20;
  const padT = 20;
  const padB = 40;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;

  const barW = Math.min(Math.max(plotW / (n + 1) - 2, 2), 30);

  const normalPoints = useMemo(() => {
    if (sigma === 0) return "";
    const pts: string[] = [];
    for (let i = 0; i <= 200; i++) {
      const x = (i / 200) * n;
      const pdf = gaussianPDF(x, mu, sigma);
      const px = padL + (x / n) * plotW;
      const py = padT + plotH - (pdf * plotH) / maxY;
      pts.push(`${px},${py}`);
    }
    return pts.join(" ");
  }, [n, mu, sigma, maxY, plotW, plotH, padL, padT]);

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * maxY);

  return (
    <div
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        padding: "16px 8px",
        marginBottom: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 12px",
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: C.blue,
            fontFamily: "'Space Mono', monospace",
          }}
        >
          Binomial(n={n}, p={p}) vs Normal fit
        </span>
        <span
          style={{
            fontSize: 12,
            color: C.textMuted,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          μ={mu.toFixed(1)} σ={sigma.toFixed(2)}
        </span>
      </div>

      <svg
        width="100%"
        viewBox={`0 0 ${chartW} ${chartH}`}
        style={{ overflow: "visible" }}
      >
        {/* Grid lines */}
        {yTicks.map((v, i) => {
          const y = padT + plotH - (v / maxY) * plotH;
          return (
            <g key={i}>
              <line
                x1={padL}
                x2={chartW - padR}
                y1={y}
                y2={y}
                stroke={C.border}
                strokeWidth={0.5}
              />
              <text
                x={padL - 6}
                y={y + 4}
                textAnchor="end"
                fill={C.textMuted}
                fontSize={10}
                fontFamily="'JetBrains Mono', monospace"
              >
                {(v * 100).toFixed(1)}%
              </text>
            </g>
          );
        })}

        {/* Theoretical bars */}
        {theoreticalData.map(({ k, prob }) => {
          const x = padL + (k / n) * plotW - barW / 2;
          const h = (prob / maxY) * plotH;
          return (
            <rect
              key={`t-${k}`}
              x={x}
              y={padT + plotH - h}
              width={barW}
              height={h}
              rx={2}
              fill={C.blueDim}
              stroke={C.blue}
              strokeWidth={0.8}
              opacity={0.7}
            />
          );
        })}

        {/* Empirical bars */}
        {totalFlips > 0 &&
          theoreticalData.map(({ k }) => {
            const empProb = (empirical[k] || 0) / totalFlips;
            const x = padL + (k / n) * plotW - barW / 2 + barW * 0.15;
            const h = (empProb / maxY) * plotH;
            return (
              <rect
                key={`e-${k}`}
                x={x}
                y={padT + plotH - h}
                width={barW * 0.7}
                height={Math.max(h, 0)}
                rx={1.5}
                fill={C.amber}
                opacity={0.65}
              />
            );
          })}

        {/* Normal curve */}
        {sigma > 0 && (
          <polyline
            points={normalPoints}
            fill="none"
            stroke={C.green}
            strokeWidth={2.5}
            strokeDasharray="6 3"
            opacity={0.9}
          />
        )}

        {/* X axis labels */}
        {theoreticalData
          .filter((_, i) => {
            if (n <= 20) return true;
            if (n <= 50) return i % 5 === 0;
            return i % 10 === 0;
          })
          .map(({ k }) => {
            const x = padL + (k / n) * plotW;
            return (
              <text
                key={`x-${k}`}
                x={x}
                y={chartH - 5}
                textAnchor="middle"
                fill={C.textMuted}
                fontSize={n <= 20 ? 11 : 10}
                fontFamily="'JetBrains Mono', monospace"
              >
                {k}
              </text>
            );
          })}

        {/* X axis label */}
        <text
          x={padL + plotW / 2}
          y={chartH + 2}
          textAnchor="middle"
          fill={C.textDim}
          fontSize={11}
          fontFamily="'JetBrains Mono', monospace"
        >
          Number of heads (k)
        </text>
      </svg>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          gap: 20,
          justifyContent: "center",
          marginTop: 8,
          fontSize: 12,
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              width: 14,
              height: 14,
              borderRadius: 3,
              background: C.blueDim,
              border: `1px solid ${C.blue}`,
              display: "inline-block",
            }}
          />
          <span style={{ color: C.blue }}>Theoretical Binomial</span>
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              width: 14,
              height: 14,
              borderRadius: 3,
              background: C.amber,
              opacity: 0.65,
              display: "inline-block",
            }}
          />
          <span style={{ color: C.amber }}>Experimental result</span>
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              width: 20,
              height: 0,
              borderTop: `2.5px dashed ${C.green}`,
              display: "inline-block",
            }}
          />
          <span style={{ color: C.green }}>Normal fit</span>
        </span>
      </div>
    </div>
  );
}

export default function BinomialNormal() {
  const [n, setN] = useState(10);
  const [p, setP] = useState(0.5);
  const [empirical, setEmpirical] = useState<Record<number, number>>({});
  const [totalFlips, setTotalFlips] = useState(0);
  const [lastResult, setLastResult] = useState<number | null>(null);

  const reset = useCallback(() => {
    setEmpirical({});
    setTotalFlips(0);
    setLastResult(null);
  }, []);

  const doFlip = useCallback(
    (times = 1) => {
      const newEmp = { ...empirical };
      let last: number | null = null;
      for (let t = 0; t < times; t++) {
        let heads = 0;
        for (let i = 0; i < n; i++) {
          if (Math.random() < p) heads++;
        }
        newEmp[heads] = (newEmp[heads] || 0) + 1;
        last = heads;
      }
      setEmpirical(newEmp);
      setTotalFlips((prev) => prev + times);
      setLastResult(last);
    },
    [n, p, empirical]
  );

  const handleNChange = useCallback((newN: number) => {
    setN(newN);
    setEmpirical({});
    setTotalFlips(0);
    setLastResult(null);
  }, []);

  const handlePChange = useCallback((newP: number) => {
    setP(newP);
    setEmpirical({});
    setTotalFlips(0);
    setLastResult(null);
  }, []);

  const mu = n * p;
  const sigma = Math.sqrt(n * p * (1 - p));

  const btnStyle = (active: boolean, clr: string): CSSProperties => ({
    padding: "8px 16px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 13,
    fontFamily: "'Space Mono', monospace",
    background: active ? clr : "transparent",
    color: active ? C.bg : clr,
    border: `2px solid ${clr}`,
    transition: "all 0.2s",
    letterSpacing: 0.5,
  });

  return (
    <PageLayout
      title="🪙 Binomial → Normal"
      subtitle="Flip n coins and watch how the binomial distribution approaches the normal as n grows"
      maxWidth={800}
    >
      {/* Controls */}
      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          padding: 20,
          marginBottom: 20,
        }}
      >
        {/* N selector */}
        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              fontSize: 12,
              color: C.textMuted,
              fontFamily: "'JetBrains Mono', monospace",
              display: "block",
              marginBottom: 8,
            }}
          >
            Coins per trial (n) — larger n looks more Normal
          </label>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[5, 10, 20, 30, 50, 100].map((v) => (
              <button
                key={v}
                onClick={() => handleNChange(v)}
                style={btnStyle(n === v, C.blue)}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* P selector */}
        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              fontSize: 12,
              color: C.textMuted,
              fontFamily: "'JetBrains Mono', monospace",
              display: "block",
              marginBottom: 8,
            }}
          >
            Probability of heads (p) — try p ≠ 0.5: the binomial skews, but
            large n still tends to Normal
          </label>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[0.1, 0.3, 0.5, 0.7, 0.9].map((v) => (
              <button
                key={v}
                onClick={() => handlePChange(v)}
                style={btnStyle(p === v, C.purple)}
              >
                p={v}
              </button>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button onClick={() => doFlip(1)} style={btnStyle(false, C.textDim)}>
            Flip 1
          </button>
          <button onClick={() => doFlip(100)} style={btnStyle(false, C.blue)}>
            +100
          </button>
          <button onClick={() => doFlip(1000)} style={btnStyle(false, C.blue)}>
            +1000
          </button>
          <button onClick={() => doFlip(5000)} style={btnStyle(false, C.amber)}>
            +5000
          </button>
          <button onClick={reset} style={btnStyle(false, C.red)}>
            ↺ Reset
          </button>
        </div>

        {/* Coin display */}
        <CoinRow n={n} result={lastResult} />

        {/* Stats */}
        {totalFlips > 0 && (
          <div
            style={{
              display: "flex",
              gap: 16,
              justifyContent: "center",
              flexWrap: "wrap",
              marginTop: 8,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
            }}
          >
            <span style={{ color: C.textDim }}>
              Trials:{" "}
              <span style={{ color: C.amber, fontWeight: 700 }}>
                {totalFlips.toLocaleString()}
              </span>
            </span>
            <span style={{ color: C.textDim }}>
              Theoretical μ:{" "}
              <span style={{ color: C.blue, fontWeight: 700 }}>
                {mu.toFixed(1)}
              </span>
            </span>
            <span style={{ color: C.textDim }}>
              Theoretical σ:{" "}
              <span style={{ color: C.green, fontWeight: 700 }}>
                {sigma.toFixed(2)}
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Chart */}
      <BinomialChart n={n} p={p} empirical={empirical} totalFlips={totalFlips} />

      {/* Explanation */}
      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          padding: 20,
          fontSize: 14,
          lineHeight: 1.8,
          color: C.textDim,
        }}
      >
        <p style={{ margin: 0 }}>
          <strong style={{ color: C.blue }}>Blue outlined bars</strong> are the
          theoretical binomial probabilities,
          <strong style={{ color: C.amber }}> orange solid bars</strong> are
          your actual flip results, and
          <strong style={{ color: C.green }}> the green dashed line</strong> is
          the Normal(μ=np, σ=√np(1-p)) fitted curve.
        </p>
        <p style={{ margin: "12px 0 0" }}>
          <strong style={{ color: C.amber }}>Try this:</strong>
        </p>
        <p style={{ margin: "8px 0 0" }}>
          ① Pick <strong style={{ color: C.blue }}>n = 5</strong> and hit +5000 —
          binomial and normal differ noticeably
        </p>
        <p style={{ margin: "4px 0 0" }}>
          ② Switch to <strong style={{ color: C.blue }}>n = 50</strong> or{" "}
          <strong style={{ color: C.blue }}>100</strong> and hit +5000 — the blue
          bars and green line almost perfectly overlap!
        </p>
        <p style={{ margin: "4px 0 0" }}>
          ③ Try <strong style={{ color: C.purple }}>p = 0.1</strong> with n = 5
          (very skewed), then raise n to 100 — even skewed p becomes bell-shaped
          when n is large enough
        </p>
        <p
          style={{
            margin: "12px 0 0",
            borderTop: `1px solid ${C.border}`,
            paddingTop: 12,
          }}
        >
          This is exactly what De Moivre discovered in 1733: the binomial tends
          to the normal distribution when n is large enough. Studying this very
          phenomenon is how he derived the formula for the normal distribution!
        </p>
      </div>
    </PageLayout>
  );
}
