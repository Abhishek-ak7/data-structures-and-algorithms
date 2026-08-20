import React, { useState, useMemo, useEffect, useRef } from "react";
import { Play, Pause, ChevronLeft, ChevronRight, RotateCcw, Shuffle, Layers } from "lucide-react";

const COLORS = {
  bg: "#141922",
  panel: "#1C2430",
  panel2: "#222C3A",
  ivory: "#F1EDE4",
  muted: "#7C93A8",
  gold: "#E7B549",
  crimson: "#D6555A",
  teal: "#4FB0A0",
  violet: "#9C8FD9",
  line: "#2C3646",
};

const TYPE_PALETTE = ["#4FB0A0", "#9C8FD9", "#5B9BD5", "#E0A458", "#C77DFF", "#7FB77E", "#E6842A", "#6FCF97", "#F2994A", "#56CCF2"];

function colorForValue(v, order) {
  const idx = order.indexOf(v);
  return TYPE_PALETTE[idx % TYPE_PALETTE.length];
}

function generateSteps(nums, k) {
  const steps = [];
  let left = 0;
  let maxLen = 0;
  const freq = new Map();
  const order = [];

  for (let right = 0; right < nums.length; right++) {
    const v = nums[right];
    if (!order.includes(v)) order.push(v);
    freq.set(v, (freq.get(v) || 0) + 1);
    steps.push({
      type: "add",
      left,
      right,
      v,
      freq: Object.fromEntries(freq),
      maxLen,
      message: `Pick up card ${v} (position ${right}) \u2192 you now hold ${freq.get(v)} of that type.`,
    });

    while (freq.get(v) > k) {
      const v1 = nums[left];
      freq.set(v1, freq.get(v1) - 1);
      steps.push({
        type: "shrink",
        left,
        right,
        v1,
        freq: Object.fromEntries(freq),
        maxLen,
        message: `Too many ${v}s (more than ${k} allowed). Release the card at position ${left} (a ${v1}) and shrink from the left.`,
      });
      left++;
    }

    const length = right - left + 1;
    const improved = length > maxLen;
    if (improved) maxLen = length;
    steps.push({
      type: "measure",
      left,
      right,
      freq: Object.fromEntries(freq),
      length,
      maxLen,
      improved,
      message: `Window [${left}..${right}] has length ${length}, every type appears at most ${k} time(s).${improved ? " New best!" : ""}`,
    });
  }

  steps.push({
    type: "done",
    maxLen,
    message: `Finished scanning. Longest stretch with at most ${k} of any type: ${maxLen}.`,
  });

  return { steps, order };
}

const PRESETS = [
  { nums: [1, 2, 3, 1, 2, 3, 1, 2], k: 2 },
  { nums: [1, 2, 1, 2, 1, 2, 1, 2], k: 1 },
  { nums: [5, 5, 5, 5, 5], k: 4 },
  { nums: [1, 2, 3, 4, 5], k: 1 },
];

export default function LongestAtMostKFreqVisualizer() {
  const [rawNums, setRawNums] = useState("1, 2, 3, 1, 2, 3, 1, 2");
  const [rawK, setRawK] = useState("2");
  const [appliedNums, setAppliedNums] = useState([1, 2, 3, 1, 2, 3, 1, 2]);
  const [appliedK, setAppliedK] = useState(2);
  const [stepIdx, setStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState("");
  const intervalRef = useRef(null);

  const { steps, order } = useMemo(() => generateSteps(appliedNums, appliedK), [appliedNums, appliedK]);
  const step = steps[Math.min(stepIdx, steps.length - 1)];

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setStepIdx((i) => {
          if (i >= steps.length - 1) {
            setIsPlaying(false);
            return i;
          }
          return i + 1;
        });
      }, 700);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, steps.length]);

  function applyInput() {
    const parsedNums = rawNums
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map(Number);
    const parsedK = Number(rawK);
    if (parsedNums.some((n) => Number.isNaN(n)) || Number.isNaN(parsedK)) {
      setError("Only numbers, please.");
      return;
    }
    if (parsedNums.length < 1 || parsedNums.length > 18) {
      setError("Keep the array between 1 and 18 numbers.");
      return;
    }
    if (parsedK < 1) {
      setError("k must be 1 or more.");
      return;
    }
    setError("");
    setAppliedNums(parsedNums);
    setAppliedK(parsedK);
    setStepIdx(0);
    setIsPlaying(false);
  }

  function randomize() {
    const preset = PRESETS[Math.floor(Math.random() * PRESETS.length)];
    setRawNums(preset.nums.join(", "));
    setRawK(String(preset.k));
    setAppliedNums(preset.nums);
    setAppliedK(preset.k);
    setStepIdx(0);
    setIsPlaying(false);
    setError("");
  }

  function reset() {
    setStepIdx(0);
    setIsPlaying(false);
  }

  const nums = appliedNums;
  const tileW = nums.length > 14 ? 40 : 48;
  const tileGap = 8;
  const isDone = step.type === "done";
  const left = isDone ? undefined : step.left;
  const right = isDone ? undefined : step.right;
  const freq = step.freq || {};
  const freqEntries = Object.entries(freq).filter(([, c]) => c > 0);

  return (
    <div
      style={{
        background: COLORS.bg,
        color: COLORS.ivory,
        fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
        padding: "28px 24px 32px",
        borderRadius: 16,
        maxWidth: 800,
        margin: "0 auto",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,500;0,600;1,500&family=JetBrains+Mono:wght@400;600&display=swap');
        .ts-num { font-family: 'JetBrains Mono', ui-monospace, monospace; }
        .ts-disp { font-family: 'Fraunces', Georgia, serif; }
        .ts-btn { transition: transform 0.12s ease, background 0.15s ease, border-color 0.15s ease; }
        .ts-btn:hover:not(:disabled) { border-color: ${COLORS.gold}; }
        .ts-btn:active:not(:disabled) { transform: scale(0.96); }
        .ts-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .ts-window { transition: left 0.28s cubic-bezier(.2,.8,.3,1), width 0.28s ease; }
        @keyframes ts-pop { 0% { transform: scale(1); } 40% { transform: scale(1.15); } 100% { transform: scale(1); } }
        .ts-pop { animation: ts-pop 0.45s ease; }
        .ts-row::-webkit-scrollbar { height: 6px; }
        .ts-row::-webkit-scrollbar-thumb { background: ${COLORS.line}; border-radius: 3px; }
      `}</style>

      <div style={{ marginBottom: 18 }}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: COLORS.gold,
            fontWeight: 600,
            marginBottom: 6,
          }}
        >
          Variable sliding window
        </div>
        <div className="ts-disp" style={{ fontSize: 26, fontWeight: 600 }}>
          Longest Subarray with At Most K Frequency
        </div>
      </div>

      {/* inputs */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
        <input
          value={rawNums}
          onChange={(e) => setRawNums(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyInput()}
          placeholder="array, e.g. 1, 2, 3, 1, 2, 3, 1, 2"
          className="ts-num"
          style={{ ...inputStyle, flex: "1 1 300px" }}
        />
        <input
          value={rawK}
          onChange={(e) => setRawK(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyInput()}
          placeholder="k"
          className="ts-num"
          style={{ ...inputStyle, flex: "0 1 70px", textAlign: "center" }}
        />
        <button onClick={applyInput} className="ts-btn" style={primaryBtnStyle}>
          Trace it
        </button>
        <button onClick={randomize} className="ts-btn" title="Random example" style={iconBtnStyle}>
          <Shuffle size={16} />
        </button>
      </div>
      {error && <div style={{ fontSize: 12.5, color: COLORS.crimson, marginBottom: 10 }}>{error}</div>}

      {/* message banner */}
      <div
        key={stepIdx}
        style={{
          borderLeft: `3px solid ${step.improved ? COLORS.gold : step.type === "shrink" ? COLORS.crimson : COLORS.violet}`,
          background: COLORS.panel,
          padding: "12px 14px",
          borderRadius: 6,
          fontSize: 14,
          lineHeight: 1.5,
          margin: "14px 0 28px",
        }}
      >
        {step.message}
      </div>

      {/* window + tiles */}
      <div className="ts-row" style={{ overflowX: "auto", paddingBottom: 4, marginBottom: 8 }}>
        <div style={{ position: "relative", paddingTop: 34, minWidth: nums.length * (tileW + tileGap) }}>
          {left !== undefined && (
            <div
              className="ts-window"
              style={{
                position: "absolute",
                top: 34,
                left: left * (tileW + tileGap) - 4,
                width: (right - left + 1) * (tileW + tileGap) - tileGap + 8,
                height: tileW,
                border: `2px solid ${COLORS.gold}`,
                borderRadius: 9,
                background: "rgba(231,181,73,0.07)",
                pointerEvents: "none",
              }}
            />
          )}
          {left !== undefined && (
            <div style={{ ...pinStyle, left: left * (tileW + tileGap) + tileW / 2, color: COLORS.teal, borderColor: COLORS.teal }}>
              L
            </div>
          )}
          {right !== undefined && (
            <div style={{ ...pinStyle, left: right * (tileW + tileGap) + tileW / 2, color: COLORS.violet, borderColor: COLORS.violet }}>
              R
            </div>
          )}

          <div style={{ display: "flex", gap: tileGap }}>
            {nums.map((v, i) => {
              const inWindow = left !== undefined && i >= left && i <= right;
              const color = colorForValue(v, order);
              return (
                <div
                  key={i}
                  className={right === i && step.type === "add" ? "ts-pop" : ""}
                  style={{
                    width: tileW,
                    height: tileW,
                    borderRadius: 8,
                    background: `${color}22`,
                    border: `1.5px solid ${inWindow ? COLORS.gold : color}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span className="ts-num" style={{ fontSize: 14, fontWeight: 700, color: COLORS.ivory }}>
                    {v}
                  </span>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: tileGap, marginTop: 6 }}>
            {nums.map((_, i) => (
              <div
                key={i}
                className="ts-num"
                style={{ width: tileW, textAlign: "center", fontSize: 10, color: COLORS.muted, flexShrink: 0 }}
              >
                {i}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* frequency panel */}
      <div style={{ background: COLORS.panel, borderRadius: 8, padding: "10px 14px", margin: "18px 0 10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: freqEntries.length ? 8 : 0 }}>
          <Layers size={14} color={COLORS.muted} />
          <span style={{ fontSize: 11.5, color: COLORS.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            copies held in window (limit {appliedK} each)
          </span>
        </div>
        {freqEntries.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {freqEntries.map(([v, cnt]) => (
              <div
                key={v}
                className="ts-num"
                style={{
                  background: `${colorForValue(Number(v), order)}22`,
                  border: `1px solid ${colorForValue(Number(v), order)}`,
                  borderRadius: 6,
                  padding: "3px 9px",
                  fontSize: 12.5,
                  color: COLORS.ivory,
                }}
              >
                {v} {"\u00d7"} {cnt}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* max length readout */}
      <div
        className="ts-num ts-pop"
        key={step.maxLen}
        style={{
          background: COLORS.panel,
          borderRadius: 8,
          padding: "10px 14px",
          fontSize: 14,
          border: `1px solid ${step.improved ? COLORS.gold : COLORS.line}`,
          marginBottom: 8,
        }}
      >
        <span style={{ color: COLORS.muted }}>longest valid stretch so far: </span>
        <span style={{ color: COLORS.gold, fontWeight: 700 }}>{step.maxLen}</span>
      </div>

      {/* controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 22 }}>
        <button
          onClick={() => {
            setIsPlaying(false);
            setStepIdx((i) => Math.max(0, i - 1));
          }}
          disabled={stepIdx === 0}
          className="ts-btn"
          style={ctrlBtnStyle}
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={() => setIsPlaying((p) => !p)}
          disabled={stepIdx >= steps.length - 1 && !isPlaying}
          className="ts-btn"
          style={{ ...ctrlBtnStyle, background: COLORS.gold, borderColor: COLORS.gold, color: "#1B1608" }}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <button
          onClick={() => {
            setIsPlaying(false);
            setStepIdx((i) => Math.min(steps.length - 1, i + 1));
          }}
          disabled={stepIdx >= steps.length - 1}
          className="ts-btn"
          style={ctrlBtnStyle}
        >
          <ChevronRight size={16} />
        </button>
        <button onClick={reset} className="ts-btn" style={{ ...ctrlBtnStyle, marginLeft: 4 }} title="Restart">
          <RotateCcw size={15} />
        </button>

        <div style={{ flex: 1, margin: "0 12px" }}>
          <div style={{ height: 4, background: COLORS.line, borderRadius: 2, overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${(stepIdx / (steps.length - 1)) * 100}%`,
                background: COLORS.gold,
                transition: "width 0.2s ease",
              }}
            />
          </div>
        </div>

        <span className="ts-num" style={{ fontSize: 12, color: COLORS.muted, whiteSpace: "nowrap" }}>
          {stepIdx + 1} / {steps.length}
        </span>
      </div>

      {/* legend */}
      <div style={{ display: "flex", gap: 16, marginTop: 26, fontSize: 11.5, color: COLORS.muted, flexWrap: "wrap" }}>
        <span><span style={{ color: COLORS.teal }}>●</span> left pointer</span>
        <span><span style={{ color: COLORS.violet }}>●</span> right pointer</span>
        <span><span style={{ color: COLORS.gold }}>▭</span> current window</span>
        <span>tile color = value</span>
      </div>
    </div>
  );
}

const pinStyle = {
  position: "absolute",
  top: 0,
  transform: "translateX(-50%)",
  fontSize: 9,
  fontWeight: 700,
  background: COLORS.panel2,
  border: "1px solid",
  borderRadius: 4,
  padding: "1px 5px",
  whiteSpace: "nowrap",
};

const inputStyle = {
  background: COLORS.panel2,
  border: `1px solid ${COLORS.line}`,
  borderRadius: 8,
  padding: "9px 12px",
  color: COLORS.ivory,
  fontSize: 14,
  outline: "none",
};

const primaryBtnStyle = {
  background: COLORS.gold,
  color: "#1B1608",
  border: "none",
  borderRadius: 8,
  padding: "9px 16px",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};

const iconBtnStyle = {
  background: "transparent",
  color: COLORS.muted,
  border: `1px solid ${COLORS.line}`,
  borderRadius: 8,
  padding: "9px 10px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
};

const ctrlBtnStyle = {
  background: "transparent",
  border: `1px solid ${COLORS.line}`,
  borderRadius: 8,
  width: 36,
  height: 36,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: COLORS.ivory,
  cursor: "pointer",
};
