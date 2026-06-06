import { useState, useCallback, useMemo } from "react";

const C = {
  bg: "#0a0e1a",
  card: "#111827",
  border: "#1e293b",
  amber: "#f59e0b",
  amberDim: "rgba(245,158,11,0.15)",
  blue: "#3b82f6",
  blueDim: "rgba(59,130,246,0.25)",
  green: "#10b981",
  greenDim: "rgba(16,185,129,0.2)",
  red: "#ef4444",
  text: "#f1f5f9",
  textDim: "#94a3b8",
  textMuted: "#64748b",
  purple: "#a78bfa",
};

function comb(n, k) {
  if (k > n) return 0;
  if (k === 0 || k === n) return 1;
  let result = 1;
  for (let i = 0; i < Math.min(k, n - k); i++) {
    result = result * (n - i) / (i + 1);
  }
  return result;
}

function binomialPMF(n, p, k) {
  return comb(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
}

function gaussianPDF(x, mu, sigma) {
  return (1 / (sigma * Math.sqrt(2 * Math.PI))) *
    Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2));
}

function CoinRow({ n, p, result }) {
  const display = result !== null ? result : null;
  const coins = [];
  if (display !== null && n <= 30) {
    const heads = display;
    const tails = n - display;
    for (let i = 0; i < heads; i++) coins.push(true);
    for (let i = 0; i < tails; i++) coins.push(false);
  }

  if (display === null) return null;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10, justifyContent: "center",
      flexWrap: "wrap", padding: "8px 0",
    }}>
      {n <= 30 ? coins.map((isHead, i) => (
        <div key={i} style={{
          width: 28, height: 28, borderRadius: "50%",
          background: isHead
            ? `linear-gradient(135deg, ${C.amber}, #d97706)`
            : `linear-gradient(135deg, ${C.textMuted}, #475569)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, fontWeight: 700, color: isHead ? "#0a0e1a" : C.text,
          boxShadow: isHead ? `0 0 8px ${C.amberDim}` : "none",
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          {isHead ? "H" : "T"}
        </div>
      )) : (
        <span style={{ fontSize: 13, color: C.textDim, fontFamily: "'JetBrains Mono', monospace" }}>
          n = {n} 太多硬幣，唔逐個顯示
        </span>
      )}
      <span style={{
        fontSize: 14, fontWeight: 700, color: C.amber,
        fontFamily: "'JetBrains Mono', monospace", marginLeft: 8,
      }}>
        正面 = {display}
      </span>
    </div>
  );
}

function BinomialChart({ n, p, empirical, totalFlips }) {
  const mu = n * p;
  const sigma = Math.sqrt(n * p * (1 - p));

  const theoreticalData = useMemo(() => {
    const data = [];
    for (let k = 0; k <= n; k++) {
      data.push({ k, prob: binomialPMF(n, p, k) });
    }
    return data;
  }, [n, p]);

  const maxProb = Math.max(...theoreticalData.map(d => d.prob));
  const maxEmp = totalFlips > 0 ? Math.max(...Object.values(empirical)) / totalFlips : 0;
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
    const pts = [];
    for (let i = 0; i <= 200; i++) {
      const x = (i / 200) * n;
      const pdf = gaussianPDF(x, mu, sigma);
      const px = padL + (x / n) * plotW;
      const py = padT + plotH - (pdf * plotH / maxY);
      pts.push(`${px},${py}`);
    }
    return pts.join(" ");
  }, [n, mu, sigma, maxY, plotW, plotH, padL, padT]);

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(f => f * maxY);

  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`,
      borderRadius: 16, padding: "16px 8px", marginBottom: 16,
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "0 12px", marginBottom: 8,
      }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: C.blue, fontFamily: "'Space Mono', monospace" }}>
          Binomial(n={n}, p={p}) vs Normal 擬合
        </span>
        <span style={{ fontSize: 12, color: C.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>
          μ={mu.toFixed(1)} σ={sigma.toFixed(2)}
        </span>
      </div>

      <svg width="100%" viewBox={`0 0 ${chartW} ${chartH}`} style={{ overflow: "visible" }}>
        {/* Grid lines */}
        {yTicks.map((v, i) => {
          const y = padT + plotH - (v / maxY) * plotH;
          return (
            <g key={i}>
              <line x1={padL} x2={chartW - padR} y1={y} y2={y}
                stroke={C.border} strokeWidth={0.5} />
              <text x={padL - 6} y={y + 4} textAnchor="end"
                fill={C.textMuted} fontSize={10} fontFamily="'JetBrains Mono', monospace">
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
            <rect key={`t-${k}`} x={x} y={padT + plotH - h}
              width={barW} height={h} rx={2}
              fill={C.blueDim} stroke={C.blue} strokeWidth={0.8} opacity={0.7} />
          );
        })}

        {/* Empirical bars */}
        {totalFlips > 0 && theoreticalData.map(({ k }) => {
          const empProb = (empirical[k] || 0) / totalFlips;
          const x = padL + (k / n) * plotW - barW / 2 + barW * 0.15;
          const h = (empProb / maxY) * plotH;
          return (
            <rect key={`e-${k}`} x={x} y={padT + plotH - h}
              width={barW * 0.7} height={Math.max(h, 0)} rx={1.5}
              fill={C.amber} opacity={0.65} />
          );
        })}

        {/* Normal curve */}
        {sigma > 0 && (
          <polyline points={normalPoints} fill="none"
            stroke={C.green} strokeWidth={2.5} strokeDasharray="6 3" opacity={0.9} />
        )}

        {/* X axis labels */}
        {theoreticalData.filter((_, i) => {
          if (n <= 20) return true;
          if (n <= 50) return i % 5 === 0;
          return i % 10 === 0;
        }).map(({ k }) => {
          const x = padL + (k / n) * plotW;
          return (
            <text key={`x-${k}`} x={x} y={chartH - 5} textAnchor="middle"
              fill={C.textMuted} fontSize={n <= 20 ? 11 : 10}
              fontFamily="'JetBrains Mono', monospace">
              {k}
            </text>
          );
        })}

        {/* X axis label */}
        <text x={padL + plotW / 2} y={chartH + 2} textAnchor="middle"
          fill={C.textDim} fontSize={11} fontFamily="'JetBrains Mono', monospace">
          正面次數 (k)
        </text>
      </svg>

      {/* Legend */}
      <div style={{
        display: "flex", gap: 20, justifyContent: "center", marginTop: 8,
        fontSize: 12, fontFamily: "'JetBrains Mono', monospace",
      }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{
            width: 14, height: 14, borderRadius: 3,
            background: C.blueDim, border: `1px solid ${C.blue}`, display: "inline-block",
          }} />
          <span style={{ color: C.blue }}>理論 Binomial</span>
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{
            width: 14, height: 14, borderRadius: 3,
            background: C.amber, opacity: 0.65, display: "inline-block",
          }} />
          <span style={{ color: C.amber }}>實驗結果</span>
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{
            width: 20, height: 0, borderTop: `2.5px dashed ${C.green}`, display: "inline-block",
          }} />
          <span style={{ color: C.green }}>Normal 擬合</span>
        </span>
      </div>
    </div>
  );
}

export default function BinomialDemo() {
  const [n, setN] = useState(10);
  const [p, setP] = useState(0.5);
  const [empirical, setEmpirical] = useState({});
  const [totalFlips, setTotalFlips] = useState(0);
  const [lastResult, setLastResult] = useState(null);

  const reset = useCallback(() => {
    setEmpirical({});
    setTotalFlips(0);
    setLastResult(null);
  }, []);

  const doFlip = useCallback((times = 1) => {
    const newEmp = { ...empirical };
    let last = null;
    for (let t = 0; t < times; t++) {
      let heads = 0;
      for (let i = 0; i < n; i++) {
        if (Math.random() < p) heads++;
      }
      newEmp[heads] = (newEmp[heads] || 0) + 1;
      last = heads;
    }
    setEmpirical(newEmp);
    setTotalFlips(prev => prev + times);
    setLastResult(last);
  }, [n, p, empirical]);

  const handleNChange = useCallback((newN) => {
    setN(newN);
    setEmpirical({});
    setTotalFlips(0);
    setLastResult(null);
  }, []);

  const handlePChange = useCallback((newP) => {
    setP(newP);
    setEmpirical({});
    setTotalFlips(0);
    setLastResult(null);
  }, []);

  const mu = n * p;
  const sigma = Math.sqrt(n * p * (1 - p));

  const btnStyle = (active, clr) => ({
    padding: "8px 16px", borderRadius: 10, cursor: "pointer",
    fontWeight: 700, fontSize: 13, fontFamily: "'Space Mono', monospace",
    background: active ? clr : "transparent",
    color: active ? C.bg : clr,
    border: `2px solid ${clr}`,
    transition: "all 0.2s",
    letterSpacing: 0.5,
  });

  return (
    <div style={{
      background: C.bg, minHeight: "100vh", padding: "24px 16px",
      fontFamily: "'Nunito Sans', 'Noto Sans TC', sans-serif", color: C.text,
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=JetBrains+Mono:wght@400;700&family=Nunito+Sans:wght@400;600;700;800&family=Noto+Sans+TC:wght@400;700&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <h1 style={{
            fontSize: 26, fontWeight: 800, fontFamily: "'Space Mono', monospace",
            background: `linear-gradient(135deg, ${C.amber}, ${C.blue}, ${C.green})`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            margin: 0,
          }}>
            🪙 Binomial → Normal Demo
          </h1>
          <p style={{ color: C.textMuted, fontSize: 14, marginTop: 8 }}>
            掟硬幣 n 次，睇 binomial distribution 點樣隨住 n 變大趨向 normal
          </p>
        </div>

        {/* Controls */}
        <div style={{
          background: C.card, border: `1px solid ${C.border}`,
          borderRadius: 16, padding: 20, marginBottom: 20,
        }}>
          {/* N selector */}
          <div style={{ marginBottom: 16 }}>
            <label style={{
              fontSize: 12, color: C.textMuted,
              fontFamily: "'JetBrains Mono', monospace", display: "block", marginBottom: 8,
            }}>
              每次掟幾多次硬幣 (n) — n 越大越似 Normal
            </label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {[5, 10, 20, 30, 50, 100].map(v => (
                <button key={v} onClick={() => handleNChange(v)}
                  style={btnStyle(n === v, C.blue)}>
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* P selector */}
          <div style={{ marginBottom: 16 }}>
            <label style={{
              fontSize: 12, color: C.textMuted,
              fontFamily: "'JetBrains Mono', monospace", display: "block", marginBottom: 8,
            }}>
              每次出正面嘅機率 (p) — 試下 p ≠ 0.5，binomial 會偏，但 n 大仍然趨向 Normal
            </label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {[0.1, 0.3, 0.5, 0.7, 0.9].map(v => (
                <button key={v} onClick={() => handlePChange(v)}
                  style={btnStyle(p === v, C.purple)}>
                  p={v}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => doFlip(1)} style={btnStyle(false, C.textDim)}>
              掟 1 次
            </button>
            <button onClick={() => doFlip(100)} style={btnStyle(false, C.blue)}>
              +100 次
            </button>
            <button onClick={() => doFlip(1000)} style={btnStyle(false, C.blue)}>
              +1000 次
            </button>
            <button onClick={() => doFlip(5000)} style={btnStyle(false, C.amber)}>
              +5000 次
            </button>
            <button onClick={reset} style={btnStyle(false, C.red)}>
              ↺ 重置
            </button>
          </div>

          {/* Coin display */}
          <CoinRow n={n} p={p} result={lastResult} />

          {/* Stats */}
          {totalFlips > 0 && (
            <div style={{
              display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap",
              marginTop: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
            }}>
              <span style={{ color: C.textDim }}>
                實驗次數: <span style={{ color: C.amber, fontWeight: 700 }}>{totalFlips.toLocaleString()}</span>
              </span>
              <span style={{ color: C.textDim }}>
                理論 μ: <span style={{ color: C.blue, fontWeight: 700 }}>{mu.toFixed(1)}</span>
              </span>
              <span style={{ color: C.textDim }}>
                理論 σ: <span style={{ color: C.green, fontWeight: 700 }}>{sigma.toFixed(2)}</span>
              </span>
            </div>
          )}
        </div>

        {/* Chart */}
        <BinomialChart n={n} p={p} empirical={empirical} totalFlips={totalFlips} />

        {/* Explanation */}
        <div style={{
          background: C.card, border: `1px solid ${C.border}`,
          borderRadius: 16, padding: 20, fontSize: 14, lineHeight: 1.8, color: C.textDim,
        }}>
          <p style={{ margin: 0 }}>
            <strong style={{ color: C.blue }}>藍色空心 bar</strong> 係 Binomial 嘅理論機率，
            <strong style={{ color: C.amber }}> 橙色實心 bar</strong> 係你實際掟嘅結果，
            <strong style={{ color: C.green }}> 綠色虛線</strong> 係 Normal(μ=np, σ=√np(1-p)) 嘅擬合曲線。
          </p>
          <p style={{ margin: "12px 0 0" }}>
            <strong style={{ color: C.amber }}>試下咁玩：</strong>
          </p>
          <p style={{ margin: "8px 0 0" }}>
            ① 揀 <strong style={{ color: C.blue }}>n = 5</strong>，撳 +5000 — binomial 同 normal 有明顯差距
          </p>
          <p style={{ margin: "4px 0 0" }}>
            ② 改做 <strong style={{ color: C.blue }}>n = 50</strong> 或 <strong style={{ color: C.blue }}>100</strong>，再撳 +5000 — 藍 bar 同綠線幾乎完全重疊！
          </p>
          <p style={{ margin: "4px 0 0" }}>
            ③ 試下 <strong style={{ color: C.purple }}>p = 0.1</strong> + n = 5（好偏），然後加大 n 到 100 — 就算 p 偏，n 夠大一樣變鐘形
          </p>
          <p style={{ margin: "12px 0 0", borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
            呢個就係 De Moivre 喺 1733 年發現嘅嘢：Binomial 喺 n 夠大嘅時候趨向 Normal Distribution。
            佢就係因為研究呢個現象，先至推導出 Normal Distribution 條公式！
          </p>
        </div>
      </div>
    </div>
  );
}
