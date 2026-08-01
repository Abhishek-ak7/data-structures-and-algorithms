import React, { useState, useMemo, useEffect, useRef } from "react";
import { Play, Pause, ChevronLeft, ChevronRight, RotateCcw, Shuffle, Plus, Minus } from "lucide-react";

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

function generateSteps(arr, k) {
  const steps = [];
  let windowSum = 0;
  for (let i = 0; i < k; i++) windowSum += arr[i];
  let maxSum = windowSum;

  steps.push({
    type: "init",
    start: 0,
    end: k - 1,
    windowSum,
    maxSum,
    isNewMax: true,
    message: `First window: sum of the first ${k} numbers = ${windowSum}.`,
  });

  let prevSum = windowSum;
  for (let i = k; i < arr.length; i++) {
    const entering = arr[i];
    const leaving = arr[i - k];
    const newSum = prevSum + entering - leaving;
    const start = i - k + 1;
    const end = i;
    const isNewMax = newSum > maxSum;
    if (isNewMax) maxSum = newSum;
    steps.push({
      type: "slide",
      start,
      end,
      entering,
      leaving,
      enterIdx: i,
      leaveIdx: i - k,
      prevSum,
      windowSum: newSum,
      maxSum,
      isNewMax,
      message: `Slide right \u2014 add ${entering} (enters), drop ${leaving} (leaves): ${prevSum} + ${entering} - ${leaving} = ${newSum}.${isNewMax ? " New max!" : ""}`,
    });
    prevSum = newSum;
  }

  steps.push({
    type: "done",
    maxSum,
    message: `Window has reached the end. Maximum window sum = ${maxSum}.`,
  });

  return steps;
}

const PRESETS = [
  { arr: [100, 200, 300, 400], k: 2 },
  { arr: [2, 1, 5, 1, 3, 2], k: 3 },
  { arr: [4, 2, 1, 7, 8, 1, 2, 8, 1, 0], k: 4 },
];

export default function SlidingWindowVisualizer() {
  const [rawArr, setRawArr] = useState("100, 200, 300, 400");
  const [rawK, setRawK] = useState("2");
  const [appliedArr, setAppliedArr] = useState([100, 200, 300, 400]);
  const [appliedK, setAppliedK] = useState(2);
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
      }, 1100);
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
    if (parsedArr.some((n) => Number.isNaN(n)) || Number.isNaN(parsedK)) {
      setError("Only numbers, please \u2014 array values separated by commas, k as a single number.");
      return;
    }
    if (parsedArr.length < 2) {
      setError("Give at least 2 numbers in the array.");
      return;
    }
    if (parsedArr.length > 12) {
      setError("Keep it to 12 numbers or fewer, so the row stays readable.");
      return;
    }
    if (parsedK < 1 || parsedK > parsedArr.length) {
      setError(`k must be between 1 and ${parsedArr.length}.`);
      return;
    }
    setError("");
    setAppliedArr(parsedArr);
    setAppliedK(parsedK);
    setStepIdx(0);
    setIsPlaying(false);
  }

  function randomize() {
    const preset = PRESETS[Math.floor(Math.random() * PRESETS.length)];
    setRawArr(preset.arr.join(", "));
    setRawK(String(preset.k));
    setAppliedArr(preset.arr);
    setAppliedK(preset.k);
    setStepIdx(0);
    setIsPlaying(false);
    setError("");
  }

  function reset() {
    setStepIdx(0);
    setIsPlaying(false);
  }

  const arr = appliedArr;
  const tileW = 58;
  const tileGap = 12;
  const isDone = step.type === "done";
  const start = isDone ? undefined : step.start;
  const end = isDone ? undefined : step.end;

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
        .ts-window { transition: left 0.35s cubic-bezier(.2,.8,.3,1), width 0.35s ease; }
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
          Sliding window technique
        </div>
        <div className="ts-disp" style={{ fontSize: 26, fontWeight: 600 }}>
          Max Sum Subarray of Size K
        </div>
      </div>

      {/* inputs */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
        <input
          value={rawArr}
          onChange={(e) => setRawArr(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyInput()}
          placeholder="array, e.g. 100, 200, 300, 400"
          className="ts-num"
          style={{ ...inputStyle, flex: "1 1 260px" }}
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
          borderLeft: `3px solid ${step.isNewMax ? COLORS.gold : COLORS.violet}`,
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

      {/* window frame + tiles */}
      <div className="ts-row" style={{ overflowX: "auto", paddingBottom: 4, marginBottom: 8 }}>
        <div style={{ position: "relative", paddingTop: 34, minWidth: arr.length * (tileW + tileGap) }}>
          {/* sliding window highlight */}
          {start !== undefined && (
            <div
              className="ts-window"
              style={{
                position: "absolute",
                top: 34,
                left: start * (tileW + tileGap) - 6,
                width: (end - start + 1) * (tileW + tileGap) - tileGap + 12,
                height: 58,
                border: `2px solid ${COLORS.gold}`,
                borderRadius: 12,
                background: "rgba(231,181,73,0.07)",
                pointerEvents: "none",
              }}
            />
          )}

          {/* enter/leave markers */}
          {step.type === "slide" && (
            <>
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: step.enterIdx * (tileW + tileGap) + tileW / 2,
                  transform: "translateX(-50%)",
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  color: COLORS.teal,
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                <Plus size={12} /> enters
              </div>
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: step.leaveIdx * (tileW + tileGap) + tileW / 2,
                  transform: "translateX(-50%)",
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  color: COLORS.crimson,
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                <Minus size={12} /> leaves
              </div>
            </>
          )}

          {/* tiles */}
          <div style={{ display: "flex", gap: tileGap }}>
            {arr.map((v, i) => {
              const inWindow = start !== undefined && i >= start && i <= end;
              const isEnter = step.type === "slide" && i === step.enterIdx;
              const isLeave = step.type === "slide" && i === step.leaveIdx;
              return (
                <div
                  key={i}
                  className={isEnter ? "ts-pop" : ""}
                  style={{
                    width: tileW,
                    height: 58,
                    borderRadius: 10,
                    background: inWindow ? "rgba(231,181,73,0.10)" : COLORS.panel2,
                    border: `1.5px solid ${isLeave ? COLORS.crimson : isEnter ? COLORS.teal : inWindow ? COLORS.gold : COLORS.line}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span className="ts-num" style={{ fontSize: 15, fontWeight: 600, color: COLORS.ivory }}>
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

      {/* sum readouts */}
      <div style={{ display: "flex", gap: 12, margin: "18px 0", flexWrap: "wrap" }}>
        <div
          className="ts-num"
          style={{
            flex: "1 1 220px",
            background: COLORS.panel,
            borderRadius: 8,
            padding: "10px 14px",
            fontSize: 14,
          }}
        >
          <span style={{ color: COLORS.muted }}>current window sum: </span>
          <span style={{ color: COLORS.ivory, fontWeight: 700 }}>{step.windowSum ?? step.maxSum}</span>
        </div>
        <div
          className="ts-num ts-pop"
          key={step.maxSum}
          style={{
            flex: "1 1 180px",
            background: COLORS.panel,
            borderRadius: 8,
            padding: "10px 14px",
            fontSize: 14,
            border: `1px solid ${step.isNewMax ? COLORS.gold : COLORS.line}`,
          }}
        >
          <span style={{ color: COLORS.muted }}>max so far: </span>
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
        <span><span style={{ color: COLORS.gold }}>▭</span> current window</span>
        <span><span style={{ color: COLORS.teal }}>●</span> entering value</span>
        <span><span style={{ color: COLORS.crimson }}>●</span> leaving value</span>
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
