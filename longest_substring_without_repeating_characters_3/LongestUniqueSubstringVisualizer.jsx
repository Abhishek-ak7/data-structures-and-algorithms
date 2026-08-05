import React, { useState, useMemo, useEffect, useRef } from "react";
import { Play, Pause, ChevronLeft, ChevronRight, RotateCcw, Shuffle, Users } from "lucide-react";

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

function colorForChar(ch, order) {
  const idx = order.indexOf(ch);
  return TYPE_PALETTE[idx % TYPE_PALETTE.length];
}

function generateSteps(s) {
  const steps = [];
  let left = 0;
  let maxLength = -1;
  const map = new Map();
  const order = [];

  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    if (!order.includes(ch)) order.push(ch);
    map.set(ch, (map.get(ch) || 0) + 1);
    steps.push({
      type: "add",
      left,
      right,
      ch,
      window: s.slice(left, right + 1),
      maxLength,
      message: `Add '${ch}' (index ${right}) to the guest list.`,
    });

    while (map.get(ch) > 1) {
      const ch1 = s[left];
      map.set(ch1, map.get(ch1) - 1);
      steps.push({
        type: "shrink",
        left,
        right,
        ch1,
        maxLength,
        message: `'${ch}' is already on the list! Remove the guest at index ${left} ('${ch1}') and move the start forward.`,
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
      window: s.slice(left, right + 1),
      length,
      maxLength,
      improved,
      message: `Window [${left}..${right}] = "${s.slice(left, right + 1)}", length ${length}.${improved ? " New best!" : ""}`,
    });
  }

  steps.push({
    type: "done",
    maxLength,
    message: `Finished scanning. Longest substring without repeats: ${maxLength}.`,
  });

  return { steps, order };
}

const PRESETS = ["pwwkew", "abcabcbb", "bbbbb", "dvdf", "abcdefg"];

export default function LongestUniqueSubstringVisualizer() {
  const [rawS, setRawS] = useState("pwwkew");
  const [appliedS, setAppliedS] = useState("pwwkew");
  const [stepIdx, setStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState("");
  const intervalRef = useRef(null);

  const { steps, order } = useMemo(() => generateSteps(appliedS), [appliedS]);
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
      }, 750);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, steps.length]);

  function applyInput() {
    const valid = /^[a-zA-Z0-9]+$/;
    if (!valid.test(rawS)) {
      setError("Use letters and/or numbers only, no spaces.");
      return;
    }
    if (rawS.length > 20) {
      setError("Keep the string to 20 characters or fewer.");
      return;
    }
    setError("");
    setAppliedS(rawS);
    setStepIdx(0);
    setIsPlaying(false);
  }

  function randomize() {
    const preset = PRESETS[Math.floor(Math.random() * PRESETS.length)];
    setRawS(preset);
    setAppliedS(preset);
    setStepIdx(0);
    setIsPlaying(false);
    setError("");
  }

  function reset() {
    setStepIdx(0);
    setIsPlaying(false);
  }

  const s = appliedS;
  const tileW = s.length > 14 ? 38 : 46;
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
          Longest Substring Without Repeating Characters
        </div>
      </div>

      {/* input */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
        <input
          value={rawS}
          onChange={(e) => setRawS(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyInput()}
          placeholder="string, e.g. pwwkew"
          className="ts-num"
          style={{ ...inputStyle, flex: "1 1 260px" }}
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
        <div style={{ position: "relative", paddingTop: 34, minWidth: s.length * (tileW + tileGap) }}>
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
            {s.split("").map((ch, i) => {
              const inWindow = left !== undefined && i >= left && i <= right;
              const isDuplicateTrigger = step.type === "shrink" && i === right;
              const color = colorForChar(ch, order);
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
                    {ch}
                  </span>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: tileGap, marginTop: 6 }}>
            {s.split("").map((_, i) => (
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

      {/* guest list panel */}
      <div style={{ background: COLORS.panel, borderRadius: 8, padding: "10px 14px", margin: "18px 0 10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <Users size={14} color={COLORS.muted} />
          <span style={{ fontSize: 11.5, color: COLORS.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            current guest list
          </span>
        </div>
        <div className="ts-num" style={{ fontSize: 15, color: COLORS.ivory }}>
          {step.window ? `"${step.window}"` : "\u2014"}
        </div>
      </div>

      {/* max length readout */}
      <div
        className="ts-num ts-pop"
        key={step.maxLength}
        style={{
          background: COLORS.panel,
          borderRadius: 8,
          padding: "10px 14px",
          fontSize: 14,
          border: `1px solid ${step.improved ? COLORS.gold : COLORS.line}`,
          marginBottom: 8,
        }}
      >
        <span style={{ color: COLORS.muted }}>longest unique stretch so far: </span>
        <span style={{ color: COLORS.gold, fontWeight: 700 }}>{step.maxLength === -1 ? "none yet" : step.maxLength}</span>
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
        <span>tile color = character</span>
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
