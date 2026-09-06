import React, { useState, useMemo, useEffect, useRef } from "react";
import { Play, Pause, ChevronLeft, ChevronRight, RotateCcw, Shuffle, TrendingUp } from "lucide-react";

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
  sand: "#D9CBB3",
  line: "#2C3646",
};

function tileTone(v) {
  if (v > 0) return { fg: COLORS.teal, border: "rgba(79,176,160,0.55)" };
  if (v < 0) return { fg: COLORS.crimson, border: "rgba(214,85,90,0.55)" };
  return { fg: COLORS.sand, border: "rgba(217,203,179,0.55)" };
}

function generateSteps(nums) {
  const steps = [];
  let currentSum = nums[0];
  let maxSum = nums[0];
  let currentStart = 0;
  let bestStart = 0;
  let bestEnd = 0;

  steps.push({
    type: "init",
    i: 0,
    currentSum,
    maxSum,
    currentStart: 0,
    currentEnd: 0,
    bestStart: 0,
    bestEnd: 0,
    message: `Start the streak at index 0 with value ${nums[0]}.`,
  });

  for (let i = 1; i < nums.length; i++) {
    const extend = currentSum + nums[i];
    const restartVal = nums[i];
    const choice = restartVal > extend ? "restart" : "extend";
    if (choice === "restart") {
      currentSum = restartVal;
      currentStart = i;
    } else {
      currentSum = extend;
    }
    const currentEnd = i;
    const improved = currentSum > maxSum;
    if (improved) {
      maxSum = currentSum;
      bestStart = currentStart;
      bestEnd = currentEnd;
    }
    steps.push({
      type: choice,
      i,
      value: nums[i],
      extend,
      restartVal,
      currentSum,
      maxSum,
      currentStart,
      currentEnd,
      bestStart,
      bestEnd,
      improved,
      message:
        choice === "restart"
          ? `Index ${i} (value ${nums[i]}): riding the streak gives ${extend}, starting fresh gives ${nums[i]} \u2014 fresh wins. Restart the streak here.`
          : `Index ${i} (value ${nums[i]}): riding the streak gives ${extend}, starting fresh gives ${nums[i]} \u2014 keep riding.`,
    });
  }

  steps.push({
    type: "done",
    maxSum,
    bestStart,
    bestEnd,
    message: `Finished scanning. Maximum subarray sum: ${maxSum}, from index ${bestStart} to ${bestEnd}.`,
  });

  return steps;
}

const PRESETS = [
  [-2, 1, -3, 4, -1, 2, 1, -5, 4],
  [5, 4, -1, 7, 8],
  [-1, -2, -3, -4],
  [1, 2, 3, -2, 5],
];

export default function KadaneVisualizer() {
  const [rawArr, setRawArr] = useState("-2, 1, -3, 4, -1, 2, 1, -5, 4");
  const [appliedArr, setAppliedArr] = useState([-2, 1, -3, 4, -1, 2, 1, -5, 4]);
  const [stepIdx, setStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState("");
  const intervalRef = useRef(null);

  const steps = useMemo(() => generateSteps(appliedArr), [appliedArr]);
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
      }, 950);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, steps.length]);

  function applyInput() {
    const parsed = rawArr
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map(Number);
    if (parsed.some((n) => Number.isNaN(n))) {
      setError("Only numbers, separated by commas, please.");
      return;
    }
    if (parsed.length < 1 || parsed.length > 14) {
      setError("Keep it to 1-14 numbers, so the row stays readable.");
      return;
    }
    setError("");
    setAppliedArr(parsed);
    setStepIdx(0);
    setIsPlaying(false);
  }

  function randomize() {
    const preset = PRESETS[Math.floor(Math.random() * PRESETS.length)];
    setRawArr(preset.join(", "));
    setAppliedArr(preset);
    setStepIdx(0);
    setIsPlaying(false);
    setError("");
  }

  function reset() {
    setStepIdx(0);
    setIsPlaying(false);
  }

  const arr = appliedArr;
  const tileW = arr.length > 10 ? 50 : 60;
  const tileGap = 10;
  const isDone = step.type === "done";
  const currentStart = isDone ? undefined : step.currentStart;
  const currentEnd = isDone ? undefined : step.currentEnd;
  const bestStart = step.bestStart;
  const bestEnd = step.bestEnd;

  return (
    <div
      style={{
        background: COLORS.bg,
        color: COLORS.ivory,
        fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
        padding: "28px 24px 32px",
        borderRadius: 16,
        maxWidth: 780,
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
        .ts-window { transition: left 0.3s cubic-bezier(.2,.8,.3,1), width 0.3s ease; }
        @keyframes ts-pop { 0% { transform: scale(1); } 40% { transform: scale(1.15); } 100% { transform: scale(1); } }
        .ts-pop { animation: ts-pop 0.5s ease; }
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
          Kadane's algorithm
        </div>
        <div className="ts-disp" style={{ fontSize: 26, fontWeight: 600 }}>
          Maximum Subarray — The Winning Streak
        </div>
      </div>

      {/* input */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
        <input
          value={rawArr}
          onChange={(e) => setRawArr(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyInput()}
          placeholder="e.g. -2, 1, -3, 4, -1, 2, 1, -5, 4"
          className="ts-num"
          style={{ ...inputStyle, flex: "1 1 300px" }}
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
          borderLeft: `3px solid ${step.improved ? COLORS.gold : step.type === "restart" ? COLORS.crimson : COLORS.violet}`,
          background: COLORS.panel,
          padding: "12px 14px",
          borderRadius: 6,
          fontSize: 14,
          lineHeight: 1.5,
          margin: "14px 0 30px",
        }}
      >
        {step.message}
      </div>

      {/* tiles */}
      <div className="ts-row" style={{ overflowX: "auto", paddingBottom: 4, marginBottom: 8 }}>
        <div style={{ position: "relative", paddingTop: 34, minWidth: arr.length * (tileW + tileGap) }}>
          {/* best window (record holder) */}
          <div
            className="ts-window"
            style={{
              position: "absolute",
              top: 34,
              left: bestStart * (tileW + tileGap) - 6,
              width: (bestEnd - bestStart + 1) * (tileW + tileGap) - tileGap + 12,
              height: 58,
              border: `2px solid ${COLORS.gold}`,
              borderRadius: 12,
              background: "rgba(231,181,73,0.06)",
              pointerEvents: "none",
            }}
          />
          {/* current streak window */}
          {currentStart !== undefined && (
            <div
              className="ts-window"
              style={{
                position: "absolute",
                top: 34,
                left: currentStart * (tileW + tileGap) - 6,
                width: (currentEnd - currentStart + 1) * (tileW + tileGap) - tileGap + 12,
                height: 58,
                border: `2px dashed ${COLORS.violet}`,
                borderRadius: 12,
                background: "rgba(156,143,217,0.06)",
                pointerEvents: "none",
              }}
            />
          )}

          <div style={{ display: "flex", gap: tileGap }}>
            {arr.map((v, i) => {
              const tone = tileTone(v);
              const inCurrent = currentStart !== undefined && i >= currentStart && i <= currentEnd;
              const inBest = i >= bestStart && i <= bestEnd;
              const isActive = i === step.i;
              return (
                <div
                  key={i}
                  className={isActive && !isDone ? "ts-pop" : ""}
                  style={{
                    width: tileW,
                    height: 58,
                    borderRadius: 10,
                    background: inBest ? "rgba(231,181,73,0.10)" : inCurrent ? "rgba(156,143,217,0.08)" : COLORS.panel2,
                    border: `1.5px solid ${isActive ? COLORS.gold : tone.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span className="ts-num" style={{ fontSize: 16, fontWeight: 600, color: tone.fg }}>
                    {v}
                  </span>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: tileGap, marginTop: 6 }}>
            {arr.map((_, i) => (
              <div
                key={i}
                className="ts-num"
                style={{ width: tileW, textAlign: "center", fontSize: 11, color: COLORS.muted, flexShrink: 0 }}
              >
                {i}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* readouts */}
      <div style={{ display: "flex", gap: 12, margin: "18px 0", flexWrap: "wrap" }}>
        <div className="ts-num" style={readoutStyle}>
          <span style={{ color: COLORS.muted }}>current streak sum: </span>
          <span style={{ color: COLORS.ivory, fontWeight: 700 }}>
            {step.currentSum ?? step.maxSum}
          </span>
        </div>
        <div
          className="ts-num ts-pop"
          key={step.maxSum}
          style={{
            ...readoutStyle,
            border: `1px solid ${step.improved ? COLORS.gold : COLORS.line}`,
          }}
        >
          <TrendingUp size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: 6, color: COLORS.gold }} />
          <span style={{ color: COLORS.muted }}>best streak sum: </span>
          <span style={{ color: COLORS.gold, fontWeight: 700 }}>{step.maxSum}</span>
        </div>
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
                transition: "width 0.25s ease",
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
        <span><span style={{ color: COLORS.violet }}>┄</span> current streak</span>
        <span><span style={{ color: COLORS.gold }}>▭</span> best streak found</span>
        <span><span style={{ color: COLORS.teal }}>●</span> positive</span>
        <span><span style={{ color: COLORS.crimson }}>●</span> negative</span>
      </div>
    </div>
  );
}

const inputStyle = {
  flex: "1 1 260px",
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

const readoutStyle = {
  flex: "1 1 220px",
  background: COLORS.panel,
  borderRadius: 8,
  padding: "10px 14px",
  fontSize: 14,
};
