import { useState, useCallback, useRef, useEffect } from "react";

const COLORS = {
  bg: "#0a0e1a",
  card: "#111827",
  cardBorder: "#1e293b",
  accent: "#f59e0b",
  accentDim: "rgba(245,158,11,0.15)",
  accentGlow: "rgba(245,158,11,0.4)",
  blue: "#3b82f6",
  blueDim: "rgba(59,130,246,0.2)",
  blueGlow: "rgba(59,130,246,0.4)",
  text: "#f1f5f9",
  textDim: "#94a3b8",
  textMuted: "#64748b",
  green: "#10b981",
  red: "#ef4444",
};

const FACE_DOTS = {
  1: [[1, 1]],
  2: [[0, 2], [2, 0]],
  3: [[0, 2], [1, 1], [2, 0]],
  4: [[0, 0], [0, 2], [2, 0], [2, 2]],
  5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
  6: [[0, 0], [0, 1], [0, 2], [2, 0], [2, 1], [2, 2]],
};

function DiceFace({ value, size = 48 }) {
  const dots = FACE_DOTS[value] || [];
  const pad = size * 0.2;
  const gap = (size - 2 * pad) / 2;
  const r = size * 0.08;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect x={1} y={1} width={size - 2} height={size - 2} rx={size * 0.15}
        fill={COLORS.card} stroke={COLORS.accent} strokeWidth={1.5} />
      {dots.map(([row, col], i) => (
        <circle key={i} cx={pad + col * gap} cy={pad + row * gap} r={r}
          fill={COLORS.accent} />
      ))}
    </svg>
  );
}

function Bar({ height, maxHeight, value, count, total, color, glow, highlight }) {
  const pct = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
  const barH = maxHeight > 0 ? (count / maxHeight) * 100 : 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, gap: 4 }}>
      <span style={{ fontSize: 11, color: COLORS.textDim, fontFamily: "'JetBrains Mono', monospace" }}>
        {pct}%
      </span>
      <div style={{ width: "100%", height: 180, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
        <div style={{
          width: "70%", minWidth: 8, borderRadius: "4px 4px 0 0",
          height: `${barH}%`, minHeight: count > 0 ? 3 : 0,
          background: `linear-gradient(180deg, ${color}, ${glow})`,
          boxShadow: highlight ? `0 0 12px ${glow}` : "none",
          transition: "height 0.3s ease",
        }} />
      </div>
      <span style={{
        fontSize: 12, fontWeight: 600, color: highlight ? color : COLORS.textDim,
        fontFamily: "'JetBrains Mono', monospace",
      }}>
        {value}
      </span>
    </div>
  );
}

function Histogram({ data, label, color, glow, binLabels, theoretical }) {
  const maxCount = Math.max(...Object.values(data), 1);
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  const keys = Object.keys(data).sort((a, b) => parseFloat(a) - parseFloat(b));

  return (
    <div style={{
      background: COLORS.card, border: `1px solid ${COLORS.cardBorder}`,
      borderRadius: 16, padding: "20px 16px 12px", flex: 1, minWidth: 280,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color, fontFamily: "'Space Mono', monospace", letterSpacing: 1 }}>
          {label}
        </span>
        <span style={{ fontSize: 12, color: COLORS.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>
          n = {total.toLocaleString()}
        </span>
      </div>
      {theoretical && (
        <div style={{
          fontSize: 11, color: COLORS.textMuted, marginBottom: 8,
          borderLeft: `2px solid ${COLORS.textMuted}`, paddingLeft: 8,
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          理論值: 每個面 = {(100 / 6).toFixed(1)}%（均勻分佈）
        </div>
      )}
      <div style={{ display: "flex", gap: 2, alignItems: "flex-end" }}>
        {keys.map((k) => (
          <Bar key={k} value={binLabels?.[k] ?? k} count={data[k]}
            maxHeight={maxCount} total={total} color={color} glow={glow}
            highlight={data[k] === maxCount && total > 0} />
        ))}
      </div>
    </div>
  );
}

function gaussianPDF(x, mean, std) {
  return (1 / (std * Math.sqrt(2 * Math.PI))) *
    Math.exp(-0.5 * Math.pow((x - mean) / std, 2));
}

function NormalCurveOverlay({ data, color }) {
  const keys = Object.keys(data).sort((a, b) => parseFloat(a) - parseFloat(b));
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  if (total < 30) return null;

  const vals = [];
  for (const k of keys) {
    for (let i = 0; i < data[k]; i++) vals.push(parseFloat(k));
  }
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  const std = Math.sqrt(vals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / vals.length);
  if (std === 0) return null;

  const minX = parseFloat(keys[0]);
  const maxX = parseFloat(keys[keys.length - 1]);
  const binWidth = keys.length > 1 ? parseFloat(keys[1]) - parseFloat(keys[0]) : 1;

  const maxCount = Math.max(...Object.values(data));
  const maxPDF = gaussianPDF(mean, mean, std);
  const scale = maxCount / (maxPDF * total * binWidth);

  const w = 400;
  const h = 180;
  const points = [];
  for (let i = 0; i <= 80; i++) {
    const x = minX + (maxX - minX) * (i / 80);
    const pdf = gaussianPDF(x, mean, std);
    const barH = (pdf * total * binWidth * scale / maxCount) * h;
    const px = ((x - minX) / (maxX - minX)) * w;
    points.push(`${px},${h - barH}`);
  }

  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`}
      style={{ position: "absolute", bottom: 32, left: 0, right: 0, pointerEvents: "none", padding: "0 16px" }}>
      <polyline points={points.join(" ")} fill="none" stroke={color}
        strokeWidth={2.5} strokeLinecap="round" opacity={0.8} strokeDasharray="6 3" />
    </svg>
  );
}

function StatsRow({ data, color }) {
  const vals = [];
  for (const [k, v] of Object.entries(data)) {
    for (let i = 0; i < v; i++) vals.push(parseFloat(k));
  }
  if (vals.length === 0) return null;
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  const variance = vals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / vals.length;
  const std = Math.sqrt(variance);

  return (
    <div style={{
      display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap",
      padding: "8px 0", fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
    }}>
      {[
        ["平均值 μ", mean.toFixed(3)],
        ["標準差 σ", std.toFixed(3)],
        ["方差 σ²", variance.toFixed(3)],
      ].map(([label, val]) => (
        <span key={label} style={{ color: COLORS.textDim }}>
          {label}: <span style={{ color, fontWeight: 700 }}>{val}</span>
        </span>
      ))}
    </div>
  );
}

export default function CLTDiceDemo() {
  const [numDice, setNumDice] = useState(2);
  const [speed, setSpeed] = useState(50);
  const [singleDist, setSingleDist] = useState({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 });
  const [avgDist, setAvgDist] = useState({});
  const [rolling, setRolling] = useState(false);
  const [lastRoll, setLastRoll] = useState([]);
  const [totalRolls, setTotalRolls] = useState(0);
  const intervalRef = useRef(null);

  const buildBins = useCallback((n) => {
    const bins = {};
    const step = n <= 4 ? 0.5 : 0.25;
    for (let v = 1; v <= 6; v = +(v + step).toFixed(2)) {
      bins[v.toFixed(2)] = 0;
    }
    return bins;
  }, []);

  useEffect(() => {
    setAvgDist(buildBins(numDice));
    setSingleDist({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 });
    setTotalRolls(0);
    setLastRoll([]);
    if (intervalRef.current) { clearInterval(intervalRef.current); setRolling(false); }
  }, [numDice, buildBins]);

  const doOneRoll = useCallback(() => {
    const dice = [];
    for (let i = 0; i < numDice; i++) {
      dice.push(Math.floor(Math.random() * 6) + 1);
    }
    const avg = dice.reduce((a, b) => a + b, 0) / numDice;

    setSingleDist(prev => {
      const next = { ...prev };
      dice.forEach(d => { next[d] = (next[d] || 0) + 1; });
      return next;
    });

    setAvgDist(prev => {
      const next = { ...prev };
      const keys = Object.keys(next).map(Number).sort((a, b) => a - b);
      let closest = keys[0];
      let minDiff = Math.abs(avg - keys[0]);
      for (const k of keys) {
        if (Math.abs(avg - k) < minDiff) { closest = k; minDiff = Math.abs(avg - k); }
      }
      next[closest.toFixed(2)] = (next[closest.toFixed(2)] || 0) + 1;
      return next;
    });

    setLastRoll(dice);
    setTotalRolls(prev => prev + 1);
  }, [numDice]);

  const toggleRoll = useCallback(() => {
    if (rolling) {
      clearInterval(intervalRef.current);
      setRolling(false);
    } else {
      intervalRef.current = setInterval(doOneRoll, Math.max(10, 200 - speed * 2));
      setRolling(true);
    }
  }, [rolling, doOneRoll, speed]);

  const rollBatch = useCallback((count) => {
    for (let i = 0; i < count; i++) doOneRoll();
  }, [doOneRoll]);

  const reset = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); setRolling(false); }
    setSingleDist({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 });
    setAvgDist(buildBins(numDice));
    setTotalRolls(0);
    setLastRoll([]);
  }, [numDice, buildBins]);

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const btnStyle = (active, clr) => ({
    padding: "10px 20px", borderRadius: 10, border: "none", cursor: "pointer",
    fontWeight: 700, fontSize: 14, fontFamily: "'Space Mono', monospace",
    letterSpacing: 0.5,
    background: active ? clr : "transparent",
    color: active ? COLORS.bg : clr,
    border: `2px solid ${clr}`,
    transition: "all 0.2s",
  });

  return (
    <div style={{
      background: COLORS.bg, minHeight: "100vh", padding: "24px 16px",
      fontFamily: "'Nunito Sans', 'Noto Sans TC', sans-serif", color: COLORS.text,
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=JetBrains+Mono:wght@400;700&family=Nunito+Sans:wght@400;600;700;800&family=Noto+Sans+TC:wght@400;700&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{
            fontSize: 28, fontWeight: 800, fontFamily: "'Space Mono', monospace",
            background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.blue})`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            margin: 0, letterSpacing: -0.5,
          }}>
            🎲 Central Limit Theorem Demo
          </h1>
          <p style={{ color: COLORS.textMuted, fontSize: 14, marginTop: 8 }}>
            擲骰仔睇 CLT — 平均值點樣由均勻分佈變成鐘形曲線
          </p>
        </div>

        {/* Controls */}
        <div style={{
          background: COLORS.card, border: `1px solid ${COLORS.cardBorder}`,
          borderRadius: 16, padding: 20, marginBottom: 20,
        }}>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center", justifyContent: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, color: COLORS.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>
                每次擲幾多粒骰 (n)
              </label>
              <div style={{ display: "flex", gap: 6 }}>
                {[1, 2, 5, 10, 30].map(n => (
                  <button key={n} onClick={() => setNumDice(n)}
                    style={{
                      ...btnStyle(numDice === n, COLORS.accent),
                      padding: "8px 14px", fontSize: 13,
                    }}>
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, color: COLORS.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>
                速度
              </label>
              <input type="range" min={1} max={100} value={speed}
                onChange={e => {
                  setSpeed(+e.target.value);
                  if (rolling) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = setInterval(doOneRoll, Math.max(10, 200 - +e.target.value * 2));
                  }
                }}
                style={{ width: 120, accentColor: COLORS.accent }} />
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 16, flexWrap: "wrap" }}>
            <button onClick={() => doOneRoll()} style={btnStyle(false, COLORS.textDim)}>
              擲 1 次
            </button>
            <button onClick={() => rollBatch(100)} style={btnStyle(false, COLORS.blue)}>
              +100 次
            </button>
            <button onClick={() => rollBatch(1000)} style={btnStyle(false, COLORS.blue)}>
              +1000 次
            </button>
            <button onClick={toggleRoll} style={btnStyle(rolling, COLORS.green)}>
              {rolling ? "⏸ 暫停" : "▶ 連續擲"}
            </button>
            <button onClick={reset} style={btnStyle(false, COLORS.red)}>
              ↺ 重置
            </button>
          </div>

          {/* Last Roll Display */}
          {lastRoll.length > 0 && (
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 16, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: COLORS.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>
                第 {totalRolls} 次:
              </span>
              {lastRoll.slice(0, 10).map((d, i) => (
                <DiceFace key={i} value={d} size={36} />
              ))}
              {lastRoll.length > 10 && (
                <span style={{ fontSize: 12, color: COLORS.textMuted }}>
                  ...共 {lastRoll.length} 粒
                </span>
              )}
              <span style={{
                fontSize: 14, fontWeight: 700, color: COLORS.accent,
                fontFamily: "'JetBrains Mono', monospace",
                marginLeft: 8,
              }}>
                平均 = {(lastRoll.reduce((a, b) => a + b, 0) / lastRoll.length).toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Charts */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <Histogram data={singleDist} label="每粒骰嘅結果（原始分佈）"
              color={COLORS.accent} glow={COLORS.accentGlow} theoretical />
            <StatsRow data={singleDist} color={COLORS.accent} />
          </div>
          <div style={{ flex: 1, minWidth: 280, position: "relative" }}>
            <Histogram data={avgDist}
              label={`${numDice} 粒骰平均值嘅分佈`}
              color={COLORS.blue} glow={COLORS.blueGlow} />
            {totalRolls >= 30 && <NormalCurveOverlay data={avgDist} color={COLORS.green} />}
            <StatsRow data={avgDist} color={COLORS.blue} />
            {totalRolls >= 30 && (
              <div style={{
                textAlign: "center", fontSize: 11, color: COLORS.green,
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                - - - 綠色虛線 = 正態分佈擬合曲線
              </div>
            )}
          </div>
        </div>

        {/* Explanation */}
        <div style={{
          background: COLORS.card, border: `1px solid ${COLORS.cardBorder}`,
          borderRadius: 16, padding: 20, marginTop: 20,
          fontSize: 14, lineHeight: 1.8, color: COLORS.textDim,
        }}>
          <p style={{ margin: 0 }}>
            <strong style={{ color: COLORS.accent }}>點樣玩：</strong> 左邊係每粒骰嘅原始結果，永遠都係均勻分佈（每面 ≈ 16.7%）。
            右邊係每次擲 n 粒骰之後計嘅<strong style={{ color: COLORS.blue }}>平均值</strong>嘅分佈。
          </p>
          <p style={{ margin: "12px 0 0" }}>
            試下將 n 由 1 調到 30，然後撳「+1000 次」。你會見到 n 越大，右邊嘅分佈越似鐘形曲線 — 呢個就係 <strong style={{ color: COLORS.green }}>Central Limit Theorem</strong>！
          </p>
        </div>
      </div>
    </div>
  );
}
