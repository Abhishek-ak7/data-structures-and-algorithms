import React, { useState, useMemo, useEffect, useRef } from "react";
import { Play, Pause, ChevronLeft, ChevronRight, RotateCcw, Shuffle, Wrench } from "lucide-react";

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

function generateSteps(nums, k) {
  const steps = [];
  let left = 0;
  let count = 0;
  let maxLength = 0;

  for (let right = 0; right < nums.length; right++) {
    if (nums[right] === 0) count++;
    steps.push({
      type: "expand",
      left,
      right,
      count,
      maxLength,
      value: nums[right],
      message:
        nums[right] === 0
          ? `Index ${right} is broken (0) \u2192 broken count = ${count}.`
          : `Index ${right} is already working (1) \u2192 broken count stays ${count}.`,
    });

    while (count > k) {
      const removed = nums[left];
      if (removed === 0) count--;
      steps.push({
        type: "shrink",
        left,
        right,
        count,
        maxLength,
        removedZero: removed === 0,
        message: `Too many broken lights for ${k} repairs. Drop index ${left} (${removed === 0 ? "broken \u2014 count drops" : "working \u2014 count unchanged"}) and shrink from the left.`,
      });
      left++;
    }

    const length = right - left + 1;
    const improved = length > maxLength;
    if (improved) maxLength = length;
    steps.push({
      type: "measure",
      left,
      right,
      count,
      length,
      maxLength,
      improved,
      message: `Window [${left}..${right}] has length ${length}, using ${count} of ${k} repairs.${improved ? " New best!" : ""}`,
    });
  }

  steps.push({
    type: "done",
    maxLength,
    message: `Finished scanning. Longest run achievable with at most ${k} repairs: ${maxLength}.`,
  });

  return steps;
}

const PRESETS = [
  { arr: [0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1], k: 3 },
  { arr: [1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0], k: 2 },
  { arr: [0, 0, 0, 1], k: 4 },
  { arr: [1, 0, 1, 0, 1, 0, 1], k: 1 },
];

function makeRandom() {
  const len = 10 + Math.floor(Math.random() * 8);
  const arr = Array.from({ length: len }, () => (Math.random() < 0.4 ? 0 : 1));
  const zeros = arr.filter((v) => v === 0).length;
  const k = Math.max(1, Math.min(zeros, 1 + Math.floor(Math.random() * 3)));
  return { arr, k };
}

export default function MaxConsecutiveOnesVisualizer() {
  const [rawArr, setRawArr] = useState("0,0,1,1,0,0,1,1,1,0,1,1,0,0,0,1,1,1,1");
  const [rawK, setRawK] = useState("3");
  const [appliedArr, setAppliedArr] = useState([0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1]);
  const [appliedK, setAppliedK] = useState(3);
  const [stepIdx, setStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState("");
  const intervalRef = useRef(null);

  const steps = useMemo(() => generateSteps(appliedArr, appliedK), [appliedArr, appliedK]);
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
      }, 550);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, steps.length]);

  function applyInput() {
    const parsedArr = rawArr
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map(Number);
    const parsedK = Number(rawK);
    if (parsedArr.some((n) => Number.isNaN(n) || (n !== 0 && n !== 1)) || Number.isNaN(parsedK)) {
      setError("Array must contain only 0s and 1s, and k must be a number.");
      return;
    }
    if (parsedArr.length < 1 || parsedArr.length > 22) {
      setError("Keep the array between 1 and 22 numbers.");
      return;
    }
    if (parsedK < 0) {
      setError("k can't be negative.");
      return;
    }
    setError("");
    setAppliedArr(parsedArr);
    setAppliedK(parsedK);
    setStepIdx(0);
    setIsPlaying(false);
  }

  function randomize() {
    const useMade = Math.random() < 0.5 ? PRESETS[Math.floor(Math.random() * PRESETS.length)] : makeRandom();
    setRawArr(useMade.arr.join(","));
    setRawK(String(useMade.k));
    setAppliedArr(useMade.arr);
    setAppliedK(useMade.k);
    setStepIdx(0);
    setIsPlaying(false);
    setError("");
  }

  function reset() {
    setStepIdx(0);
    setIsPlaying(false);
  }

  const arr = appliedArr;
  const tileW = arr.length > 16 ? 34 : 44;
  const tileGap = 8;
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
        maxWidth: 820,
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
          Max Consecutive Ones III — The Streetlight Repair
        </div>
      </div>

      {/* inputs */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
        <input
          value={rawArr}
          onChange={(e) => setRawArr(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyInput()}
          placeholder="0/1 array, e.g. 1,1,0,0,1,1,1,0"
          className="ts-num"
          style={{ ...inputStyle, flex: "1 1 320px" }}
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
        <div style={{ position: "relative", paddingTop: 34, minWidth: arr.length * (tileW + tileGap) }}>
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
            <div
              style={{
                position: "absolute",
                left: left * (tileW + tileGap) + tileW / 2,
                top: 0,
                transform: "translateX(-50%)",
                fontSize: 9,
                fontWeight: 700,
                color: COLORS.teal,
                background: COLORS.panel2,
                border: `1px solid ${COLORS.teal}`,
                borderRadius: 4,
                padding: "1px 4px",
                whiteSpace: "nowrap",
              }}
            >
              L
            </div>
          )}
          {right !== undefined && (
            <div
              style={{
                position: "absolute",
                left: right * (tileW + tileGap) + tileW / 2,
                top: 0,
                transform: "translateX(-50%)",
                fontSize: 9,
                fontWeight: 700,
                color: COLORS.violet,
                background: COLORS.panel2,
                border: `1px solid ${COLORS.violet}`,
                borderRadius: 4,
                padding: "1px 4px",
                whiteSpace: "nowrap",
              }}
            >
              R
            </div>
          )}

          {/* tiles */}
          <div style={{ display: "flex", gap: tileGap }}>
            {arr.map((v, i) => {
              const inWindow = left !== undefined && i >= left && i <= right;
              const isBroken = v === 0;
              return (
                <div
                  key={i}
                  className={right === i && step.type === "expand" ? "ts-pop" : ""}
                  style={{
                    width: tileW,
                    height: tileW,
                    borderRadius: 8,
                    background: isBroken ? "rgba(214,85,90,0.14)" : "rgba(79,176,160,0.14)",
                    border: `1.5px solid ${inWindow ? COLORS.gold : isBroken ? COLORS.crimson : COLORS.teal}`,
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
            {arr.map((_, i) => (
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

      {/* readouts */}
      <div style={{ display: "flex", gap: 12, margin: "18px 0", flexWrap: "wrap" }}>
        <div className="ts-num" style={readoutStyle}>
          <Wrench size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: 6, color: COLORS.crimson }} />
          <span style={{ color: COLORS.muted }}>repairs used: </span>
          <span style={{ color: COLORS.ivory, fontWeight: 700 }}>{step.count ?? 0}</span>
          <span style={{ color: COLORS.muted }}> / {appliedK}</span>
        </div>
        <div
          className="ts-num ts-pop"
          key={step.maxLength}
          style={{
            ...readoutStyle,
            border: `1px solid ${step.improved ? COLORS.gold : COLORS.line}`,
          }}
        >
          <span style={{ color: COLORS.muted }}>longest run so far: </span>
          <span style={{ color: COLORS.gold, fontWeight: 700 }}>{step.maxLength}</span>
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
        <span><span style={{ color: COLORS.teal }}>●</span> working (1)</span>
        <span><span style={{ color: COLORS.crimson }}>●</span> broken (0)</span>
        <span><span style={{ color: COLORS.gold }}>▭</span> current window</span>
      </div>
    </div>
  );
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
