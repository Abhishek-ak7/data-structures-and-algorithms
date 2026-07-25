import React, { useState, useMemo, useEffect, useRef } from "react";
import { Play, Pause, ChevronLeft, ChevronRight, RotateCcw, Shuffle } from "lucide-react";

const COLORS = {
  bg: "#141922",
  panel: "#1C2430",
  panel2: "#222C3A",
  ivory: "#F1EDE4",
  muted: "#7C93A8",
  gold: "#E7B549",
  teal: "#4FB0A0",
  crimson: "#D6555A",
  violet: "#9C8FD9",
  line: "#2C3646",
};

function generateSteps(nums, target) {
  const steps = [];
  let left = 0;
  let sum = 0;
  let minLen = Infinity;
  let found = false;

  for (let right = 0; right < nums.length; right++) {
    sum += nums[right];
    steps.push({
      type: "expand",
      left,
      right,
      sum,
      minLen: found ? minLen : null,
      message: `Add ${nums[right]} (index ${right}) to the window \u2192 sum = ${sum}.`,
    });

    while (sum >= target) {
      found = true;
      const droppedSum = sum - nums[left];
      const count = right - left + 1;
      const improved = count < minLen;
      if (improved) minLen = count;
      steps.push({
        type: "shrink",
        left,
        right,
        sum,
        droppedValue: nums[left],
        count,
        minLen,
        improved,
        message: `Window [${left}..${right}] has sum ${sum} \u2265 ${target}, length ${count}${improved ? " \u2014 new best!" : ""}. Drop ${nums[left]} and shrink from the left.`,
      });
      sum = droppedSum;
      left++;
    }
  }

  steps.push({
    type: "done",
    minLen: found ? minLen : 0,
    found,
    message: found
      ? `No more numbers left. Smallest window with sum \u2265 ${target}: length ${minLen}.`
      : `No window ever reached a sum of ${target} or more. Answer: 0.`,
  });

  return steps;
}

const PRESETS = [
  { arr: [12, 28, 83, 4, 25, 26, 25, 2, 25, 25, 25, 12], target: 213 },
  { arr: [2, 3, 1, 2, 4, 3], target: 7 },
  { arr: [1, 4, 4], target: 4 },
  { arr: [1, 1, 1, 1, 1, 1, 1, 1], target: 11 },
];

export default function MinSubArrayLenVisualizer() {
  const [rawArr, setRawArr] = useState("12, 28, 83, 4, 25, 26, 25, 2, 25, 25, 25, 12");
  const [rawTarget, setRawTarget] = useState("213");
  const [appliedArr, setAppliedArr] = useState([12, 28, 83, 4, 25, 26, 25, 2, 25, 25, 25, 12]);
  const [appliedTarget, setAppliedTarget] = useState(213);
  const [stepIdx, setStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState("");
  const intervalRef = useRef(null);

  const steps = useMemo(() => generateSteps(appliedArr, appliedTarget), [appliedArr, appliedTarget]);
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
      }, 900);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, steps.length]);

  function applyInput() {
    const parsedArr = rawArr
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map(Number);
    const parsedTarget = Number(rawTarget);
    if (parsedArr.some((n) => Number.isNaN(n)) || Number.isNaN(parsedTarget)) {
      setError("Only numbers, please.");
      return;
    }
    if (parsedArr.length < 1 || parsedArr.length > 14) {
      setError("Keep the array between 1 and 14 numbers.");
      return;
    }
    setError("");
    setAppliedArr(parsedArr);
    setAppliedTarget(parsedTarget);
    setStepIdx(0);
    setIsPlaying(false);
  }

  function randomize() {
    const preset = PRESETS[Math.floor(Math.random() * PRESETS.length)];
    setRawArr(preset.arr.join(", "));
    setRawTarget(String(preset.target));
    setAppliedArr(preset.arr);
    setAppliedTarget(preset.target);
    setStepIdx(0);
    setIsPlaying(false);
    setError("");
  }

  function reset() {
    setStepIdx(0);
    setIsPlaying(false);
  }

  const arr = appliedArr;
  const tileW = 50;
  const tileGap = 10;
  const isDone = step.type === "done";
  const left = isDone ? undefined : step.left;
  const right = isDone ? undefined : step.right;

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
          Variable sliding window
        </div>
        <div className="ts-disp" style={{ fontSize: 26, fontWeight: 600 }}>
          Minimum Size Subarray Sum
        </div>
      </div>

      {/* inputs */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
        <input
          value={rawArr}
          onChange={(e) => setRawArr(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyInput()}
          placeholder="array, e.g. 2, 3, 1, 2, 4, 3"
          className="ts-num"
          style={{ ...inputStyle, flex: "1 1 300px" }}
        />
        <input
          value={rawTarget}
          onChange={(e) => setRawTarget(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyInput()}
          placeholder="target"
          className="ts-num"
          style={{ ...inputStyle, flex: "0 1 90px", textAlign: "center" }}
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
          borderLeft: `3px solid ${step.improved ? COLORS.gold : COLORS.violet}`,
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

      {/* window + tiles */}
      <div className="ts-row" style={{ overflowX: "auto", paddingBottom: 4, marginBottom: 8 }}>
        <div style={{ position: "relative", paddingTop: 40, minWidth: arr.length * (tileW + tileGap) }}>
          {left !== undefined && (
            <div
              className="ts-window"
              style={{
                position: "absolute",
                top: 40,
                left: left * (tileW + tileGap) - 5,
                width: (right - left + 1) * (tileW + tileGap) - tileGap + 10,
                height: 52,
                border: `2px solid ${COLORS.gold}`,
                borderRadius: 10,
                background: "rgba(231,181,73,0.07)",
                pointerEvents: "none",
              }}
            />
          )}

          {/* L/R pointer tags */}
          {left !== undefined && (
            <div
              className="ts-pin"
              style={{
                position: "absolute",
                left: left * (tileW + tileGap) + tileW / 2,
                top: 0,
                transform: "translateX(-50%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <span style={pinLabelStyle(COLORS.teal)}>LEFT</span>
              <div style={{ width: 1, height: 10, background: COLORS.teal }} />
            </div>
          )}
          {right !== undefined && (
            <div
              style={{
                position: "absolute",
                left: right * (tileW + tileGap) + tileW / 2,
                top: 0,
                transform: "translateX(-50%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <span style={pinLabelStyle(COLORS.violet)}>RIGHT</span>
              <div style={{ width: 1, height: 10, background: COLORS.violet }} />
            </div>
          )}

          {/* tiles */}
          <div style={{ display: "flex", gap: tileGap }}>
            {arr.map((v, i) => {
              const inWindow = left !== undefined && i >= left && i <= right;
              const isLeft = i === left;
              const isRight = i === right;
              return (
                <div
                  key={i}
                  className={isRight && step.type === "expand" ? "ts-pop" : ""}
                  style={{
                    width: tileW,
                    height: 52,
                    borderRadius: 9,
                    background: inWindow ? "rgba(231,181,73,0.10)" : COLORS.panel2,
                    border: `1.5px solid ${isLeft ? COLORS.teal : isRight ? COLORS.violet : inWindow ? COLORS.gold : COLORS.line}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span className="ts-num" style={{ fontSize: 13.5, fontWeight: 600, color: COLORS.ivory }}>
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
                style={{ width: tileW, textAlign: "center", fontSize: 10.5, color: COLORS.muted, flexShrink: 0 }}
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
          <span style={{ color: COLORS.muted }}>window sum: </span>
          <span style={{ color: COLORS.ivory, fontWeight: 700 }}>{step.sum ?? "\u2014"}</span>
          <span style={{ color: COLORS.muted }}> / target {appliedTarget}</span>
        </div>
        <div
          className="ts-num ts-pop"
          key={step.minLen}
          style={{
            ...readoutStyle,
            border: `1px solid ${step.improved ? COLORS.gold : COLORS.line}`,
          }}
        >
          <span style={{ color: COLORS.muted }}>shortest so far: </span>
          <span style={{ color: COLORS.gold, fontWeight: 700 }}>
            {step.minLen ? step.minLen : "\u2014"}
          </span>
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
        <span><span style={{ color: COLORS.teal }}>●</span> left pointer</span>
        <span><span style={{ color: COLORS.violet }}>●</span> right pointer</span>
        <span><span style={{ color: COLORS.gold }}>▭</span> current window</span>
      </div>
    </div>
  );
}

function pinLabelStyle(color) {
  return {
    fontSize: 9.5,
    fontWeight: 700,
    letterSpacing: "0.07em",
    color,
    background: COLORS.panel2,
    border: `1px solid ${color}`,
    borderRadius: 4,
    padding: "2px 5px",
    whiteSpace: "nowrap",
  };
}

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

const readoutStyle = {
  flex: "1 1 220px",
  background: COLORS.panel,
  borderRadius: 8,
  padding: "10px 14px",
  fontSize: 14,
};
