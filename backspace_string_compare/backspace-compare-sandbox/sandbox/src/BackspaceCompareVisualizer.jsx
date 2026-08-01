import React, { useState, useMemo, useEffect, useRef } from "react";
import { Play, Pause, ChevronLeft, ChevronRight, RotateCcw, Shuffle, Check, X } from "lucide-react";

const COLORS = {
  bg: "#14181F",
  panel: "#1C222B",
  panel2: "#222933",
  ivory: "#F1EDE4",
  muted: "#7C93A8",
  gold: "#E7B549",
  teal: "#4FB0A0",
  crimson: "#D6555A",
  violet: "#9C8FD9",
  line: "#2C3542",
};

function generateSteps(s, t) {
  const steps = [];

  function processString(str, label) {
    const stack = [];
    steps.push({
      phase: label,
      type: "start",
      str,
      stack: [...stack],
      message: `Start typing "${str || "(empty)"}".`,
    });
    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      if (ch === "#") {
        if (stack.length > 0) {
          const popped = stack[stack.length - 1];
          stack.pop();
          steps.push({
            phase: label,
            type: "pop",
            str,
            index: i,
            char: ch,
            popped,
            stack: [...stack],
            message: `Backspace \u2014 remove the last letter "${popped}".`,
          });
        } else {
          steps.push({
            phase: label,
            type: "pop-empty",
            str,
            index: i,
            char: ch,
            stack: [...stack],
            message: `Backspace pressed, but there's nothing left to remove.`,
          });
        }
      } else {
        stack.push(ch);
        steps.push({
          phase: label,
          type: "push",
          str,
          index: i,
          char: ch,
          stack: [...stack],
          message: `Type "${ch}".`,
        });
      }
    }
    steps.push({
      phase: label,
      type: "done",
      str,
      stack: [...stack],
      message: `Finished "${str || "(empty)"}" \u2192 result: "${stack.join("") || "(empty)"}"`,
    });
    return stack.join("");
  }

  const resultS = processString(s, "S");
  const resultT = processString(t, "T");
  const equal = resultS === resultT;

  steps.push({
    phase: "compare",
    type: "compare",
    resultS,
    resultT,
    equal,
    message: `Compare final results: "${resultS || "(empty)"}" vs "${resultT || "(empty)"}" \u2192 ${equal ? "Equal \u2713" : "Different \u2717"}`,
  });

  return steps;
}

function CharChip({ ch, active, done }) {
  const isHash = ch === "#";
  return (
    <div
      className="ts-num"
      style={{
        width: 34,
        height: 34,
        borderRadius: 7,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 14,
        fontWeight: 600,
        background: active ? "rgba(231,181,73,0.16)" : "transparent",
        border: `1.5px solid ${active ? COLORS.gold : COLORS.line}`,
        color: isHash ? COLORS.crimson : done ? COLORS.muted : COLORS.ivory,
        flexShrink: 0,
      }}
    >
      {isHash ? "\u232B" : ch}
    </div>
  );
}

function StackColumn({ label, str, stack, activeIndex, color, dim }) {
  return (
    <div style={{ flex: 1, minWidth: 0, opacity: dim ? 0.4 : 1, transition: "opacity 0.25s ease" }}>
      <div
        style={{
          fontSize: 11,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color,
          fontWeight: 700,
          marginBottom: 8,
        }}
      >
        String {label}
      </div>

      {/* raw characters */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        {str.split("").map((ch, i) => (
          <CharChip key={i} ch={ch} active={i === activeIndex} done={activeIndex !== undefined && i < activeIndex} />
        ))}
        {str.length === 0 && (
          <span style={{ fontSize: 12, color: COLORS.muted, fontStyle: "italic" }}>empty string</span>
        )}
      </div>

      {/* stack pile, grows upward */}
      <div
        style={{
          background: COLORS.panel,
          borderRadius: 8,
          border: `1px solid ${COLORS.line}`,
          minHeight: 132,
          display: "flex",
          flexDirection: "column-reverse",
          alignItems: "center",
          padding: "8px 0",
          gap: 5,
        }}
      >
        {stack.length === 0 && (
          <span style={{ fontSize: 11.5, color: COLORS.muted, fontStyle: "italic", margin: "auto" }}>
            stack empty
          </span>
        )}
        {stack.map((ch, i) => (
          <div
            key={i}
            className="ts-num ts-tile-pop"
            style={{
              width: 44,
              height: 30,
              borderRadius: 6,
              background: "rgba(79,176,160,0.14)",
              border: `1.5px solid ${color}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 700,
              color: COLORS.ivory,
            }}
          >
            {ch}
          </div>
        ))}
      </div>
      <div className="ts-num" style={{ marginTop: 8, fontSize: 12.5, color: COLORS.muted }}>
        typed so far: <span style={{ color: COLORS.ivory, fontWeight: 600 }}>"{stack.join("")}"</span>
      </div>
    </div>
  );
}

export default function BackspaceCompareVisualizer() {
  const [rawS, setRawS] = useState("ab#c");
  const [rawT, setRawT] = useState("ad#c");
  const [appliedS, setAppliedS] = useState("ab#c");
  const [appliedT, setAppliedT] = useState("ad#c");
  const [stepIdx, setStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState("");
  const intervalRef = useRef(null);

  const steps = useMemo(() => generateSteps(appliedS, appliedT), [appliedS, appliedT]);
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
      }, 850);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, steps.length]);

  function applyInput() {
    const valid = /^[a-zA-Z#]*$/;
    if (!valid.test(rawS) || !valid.test(rawT)) {
      setError("Use only lowercase letters and # (backspace).");
      return;
    }
    if (rawS.length > 14 || rawT.length > 14) {
      setError("Keep each string to 14 characters or fewer.");
      return;
    }
    setError("");
    setAppliedS(rawS);
    setAppliedT(rawT);
    setStepIdx(0);
    setIsPlaying(false);
  }

  function randomize() {
    const pool = "abc";
    const make = () => {
      let out = "";
      const len = 4 + Math.floor(Math.random() * 4);
      for (let i = 0; i < len; i++) {
        out += Math.random() < 0.25 ? "#" : pool[Math.floor(Math.random() * pool.length)];
      }
      return out;
    };
    const a = make();
    const b = Math.random() < 0.5 ? a : make();
    setRawS(a);
    setRawT(b);
    setAppliedS(a);
    setAppliedT(b);
    setStepIdx(0);
    setIsPlaying(false);
    setError("");
  }

  function reset() {
    setStepIdx(0);
    setIsPlaying(false);
  }

  const isCompare = step.type === "compare";
  const sActive = step.phase === "S";
  const tActive = step.phase === "T";

  return (
    <div
      style={{
        background: COLORS.bg,
        color: COLORS.ivory,
        fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
        padding: "28px 24px 32px",
        borderRadius: 16,
        maxWidth: 760,
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
        @keyframes ts-pop { 0% { transform: scale(0.6) translateY(6px); opacity: 0; } 100% { transform: scale(1) translateY(0); opacity: 1; } }
        .ts-tile-pop { animation: ts-pop 0.28s cubic-bezier(.2,.8,.3,1); }
        input.ts-input { font-family: 'JetBrains Mono', ui-monospace, monospace; }
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
          Stack simulation
        </div>
        <div className="ts-disp" style={{ fontSize: 26, fontWeight: 600 }}>
          Backspace String Compare — The Typing Stack
        </div>
      </div>

      {/* inputs */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
        <input
          value={rawS}
          onChange={(e) => setRawS(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyInput()}
          placeholder="string S, e.g. ab#c"
          className="ts-input"
          style={inputStyle}
        />
        <input
          value={rawT}
          onChange={(e) => setRawT(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyInput()}
          placeholder="string T, e.g. ad#c"
          className="ts-input"
          style={inputStyle}
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
          borderLeft: `3px solid ${isCompare ? (step.equal ? COLORS.teal : COLORS.crimson) : COLORS.violet}`,
          background: COLORS.panel,
          padding: "12px 14px",
          borderRadius: 6,
          fontSize: 14,
          lineHeight: 1.5,
          margin: "14px 0 24px",
        }}
      >
        {step.message}
      </div>

      {/* two stack columns */}
      <div style={{ display: "flex", gap: 24, marginBottom: 22 }}>
        <StackColumn
          label="S"
          str={appliedS}
          stack={isCompare ? step.resultS.split("") : step.phase === "S" ? step.stack : step.phase === "T" ? appliedS.split("").reduce((acc, ch) => (ch === "#" ? acc.slice(0, -1) : [...acc, ch]), []) : []}
          activeIndex={step.phase === "S" ? step.index : undefined}
          color={COLORS.teal}
          dim={!sActive && !isCompare && step.phase === "T"}
        />
        <StackColumn
          label="T"
          str={appliedT}
          stack={isCompare ? step.resultT.split("") : step.phase === "T" ? step.stack : []}
          activeIndex={step.phase === "T" ? step.index : undefined}
          color={COLORS.violet}
          dim={step.phase === "S"}
        />
      </div>

      {/* compare readout */}
      {isCompare && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
            background: COLORS.panel,
            borderRadius: 10,
            padding: "16px 18px",
            marginBottom: 22,
          }}
        >
          <span className="ts-num" style={{ fontSize: 16, color: COLORS.teal, fontWeight: 700 }}>
            "{step.resultS || "\u2205"}"
          </span>
          {step.equal ? (
            <Check size={22} color={COLORS.gold} />
          ) : (
            <X size={22} color={COLORS.crimson} />
          )}
          <span className="ts-num" style={{ fontSize: 16, color: COLORS.violet, fontWeight: 700 }}>
            "{step.resultT || "\u2205"}"
          </span>
          <span
            style={{
              marginLeft: 10,
              fontSize: 12.5,
              fontWeight: 700,
              color: step.equal ? COLORS.gold : COLORS.crimson,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            {step.equal ? "Equal" : "Different"}
          </span>
        </div>
      )}

      {/* controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
      <div style={{ display: "flex", gap: 16, marginTop: 22, fontSize: 11.5, color: COLORS.muted, flexWrap: "wrap" }}>
        <span><span style={{ color: COLORS.teal }}>●</span> string S stack</span>
        <span><span style={{ color: COLORS.violet }}>●</span> string T stack</span>
        <span><span style={{ color: COLORS.gold }}>●</span> active character</span>
        <span><span style={{ color: COLORS.crimson }}>⌫</span> backspace</span>
      </div>
    </div>
  );
}

const inputStyle = {
  flex: "1 1 160px",
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
