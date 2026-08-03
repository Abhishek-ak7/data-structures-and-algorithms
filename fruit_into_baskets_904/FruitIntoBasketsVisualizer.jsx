import React, { useState, useMemo, useEffect, useRef } from "react";
import { Play, Pause, ChevronLeft, ChevronRight, RotateCcw, Shuffle, ShoppingBasket } from "lucide-react";

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

function colorForType(type, order) {
  const idx = order.indexOf(type);
  return TYPE_PALETTE[idx % TYPE_PALETTE.length];
}

function generateSteps(fruits, maxTypes) {
  const steps = [];
  let left = 0;
  let maxFruits = 0;
  const map = new Map();
  const order = [];

  for (let right = 0; right < fruits.length; right++) {
    const type = fruits[right];
    if (!order.includes(type)) order.push(type);
    map.set(type, (map.get(type) || 0) + 1);
    steps.push({
      type: "add",
      left,
      right,
      fruitType: type,
      basket: Object.fromEntries(map),
      size: map.size,
      maxFruits,
      message: `Pick fruit type ${type} (tree ${right}) \u2192 ${map.size} basket type${map.size === 1 ? "" : "s"} in use.`,
    });

    while (map.size > maxTypes) {
      const t1 = fruits[left];
      map.set(t1, map.get(t1) - 1);
      let removedType = false;
      if (map.get(t1) === 0) {
        map.delete(t1);
        removedType = true;
      }
      steps.push({
        type: "shrink",
        left,
        right,
        fruitType: t1,
        basket: Object.fromEntries(map),
        size: map.size,
        maxFruits,
        removedType,
        message: `Only ${maxTypes} basket${maxTypes === 1 ? "" : "s"} allowed. Put back one fruit of type ${t1} from tree ${left}${removedType ? " \u2014 basket now empty, free it up" : ""} and shrink from the left.`,
      });
      left++;
    }

    const length = right - left + 1;
    const improved = length > maxFruits;
    if (improved) maxFruits = length;
    steps.push({
      type: "measure",
      left,
      right,
      basket: Object.fromEntries(map),
      size: map.size,
      length,
      maxFruits,
      improved,
      message: `Window [${left}..${right}] has ${length} fruit${length === 1 ? "" : "s"} using ${map.size} basket type${map.size === 1 ? "" : "s"}.${improved ? " New best!" : ""}`,
    });
  }

  steps.push({
    type: "done",
    maxFruits,
    message: `Reached the end of the row. Most fruit you can collect with ${maxTypes} basket type${maxTypes === 1 ? "" : "s"}: ${maxFruits}.`,
  });

  return { steps, order };
}

const PRESETS = [
  { fruits: [1, 2, 1], maxTypes: 2 },
  { fruits: [0, 1, 2, 2], maxTypes: 2 },
  { fruits: [1, 2, 3, 2, 2], maxTypes: 2 },
  { fruits: [3, 3, 3, 1, 2, 1, 1, 2, 3, 3, 4], maxTypes: 2 },
];

export default function FruitIntoBasketsVisualizer() {
  const [rawFruits, setRawFruits] = useState("1, 2, 1");
  const [rawK, setRawK] = useState("2");
  const [appliedFruits, setAppliedFruits] = useState([1, 2, 1]);
  const [appliedK, setAppliedK] = useState(2);
  const [stepIdx, setStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState("");
  const intervalRef = useRef(null);

  const { steps, order } = useMemo(() => generateSteps(appliedFruits, appliedK), [appliedFruits, appliedK]);
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
    const parsedFruits = rawFruits
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map(Number);
    const parsedK = Number(rawK);
    if (parsedFruits.some((n) => Number.isNaN(n)) || Number.isNaN(parsedK)) {
      setError("Only numbers, please.");
      return;
    }
    if (parsedFruits.length < 1 || parsedFruits.length > 18) {
      setError("Keep the row between 1 and 18 trees.");
      return;
    }
    if (parsedK < 1) {
      setError("Basket types must be 1 or more.");
      return;
    }
    setError("");
    setAppliedFruits(parsedFruits);
    setAppliedK(parsedK);
    setStepIdx(0);
    setIsPlaying(false);
  }

  function randomize() {
    const preset = PRESETS[Math.floor(Math.random() * PRESETS.length)];
    setRawFruits(preset.fruits.join(", "));
    setRawK(String(preset.maxTypes));
    setAppliedFruits(preset.fruits);
    setAppliedK(preset.maxTypes);
    setStepIdx(0);
    setIsPlaying(false);
    setError("");
  }

  function reset() {
    setStepIdx(0);
    setIsPlaying(false);
  }

  const fruits = appliedFruits;
  const tileW = fruits.length > 14 ? 40 : 48;
  const tileGap = 8;
  const isDone = step.type === "done";
  const left = isDone ? undefined : step.left;
  const right = isDone ? undefined : step.right;
  const basket = step.basket || {};
  const basketEntries = Object.entries(basket);

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
          Fruit Into Baskets
        </div>
      </div>

      {/* inputs */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
        <input
          value={rawFruits}
          onChange={(e) => setRawFruits(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyInput()}
          placeholder="fruit types, e.g. 1, 2, 1, 3, 3"
          className="ts-num"
          style={{ ...inputStyle, flex: "1 1 280px" }}
        />
        <input
          value={rawK}
          onChange={(e) => setRawK(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyInput()}
          placeholder="baskets"
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
      <div style={{ fontSize: 11.5, color: COLORS.muted, marginBottom: 10 }}>
        The classic problem fixes baskets at 2 \u2014 try changing it to see how the "at-most-k-types" window generalises.
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
        <div style={{ position: "relative", paddingTop: 34, minWidth: fruits.length * (tileW + tileGap) }}>
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
            {fruits.map((f, i) => {
              const inWindow = left !== undefined && i >= left && i <= right;
              const color = colorForType(f, order);
              return (
                <div
                  key={i}
                  className={right === i && step.type === "add" ? "ts-pop" : ""}
                  style={{
                    width: tileW,
                    height: tileW,
                    borderRadius: "50% 50% 46% 46% / 55% 55% 45% 45%",
                    background: `${color}22`,
                    border: `1.5px solid ${inWindow ? COLORS.gold : color}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span className="ts-num" style={{ fontSize: 14, fontWeight: 700, color: COLORS.ivory }}>
                    {f}
                  </span>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: tileGap, marginTop: 6 }}>
            {fruits.map((_, i) => (
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

      {/* basket panel */}
      <div style={{ background: COLORS.panel, borderRadius: 8, padding: "10px 14px", margin: "18px 0 10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: basketEntries.length ? 8 : 0 }}>
          <ShoppingBasket size={14} color={COLORS.muted} />
          <span style={{ fontSize: 11.5, color: COLORS.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            baskets in use ({step.size ?? 0} / {appliedK})
          </span>
        </div>
        {basketEntries.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {basketEntries.map(([t, cnt]) => (
              <div
                key={t}
                className="ts-num"
                style={{
                  background: `${colorForType(Number(t), order)}22`,
                  border: `1px solid ${colorForType(Number(t), order)}`,
                  borderRadius: 6,
                  padding: "3px 9px",
                  fontSize: 12.5,
                  color: COLORS.ivory,
                }}
              >
                type {t} {"\u00d7"} {cnt}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* max readout */}
      <div
        className="ts-num ts-pop"
        key={step.maxFruits}
        style={{
          background: COLORS.panel,
          borderRadius: 8,
          padding: "10px 14px",
          fontSize: 14,
          border: `1px solid ${step.improved ? COLORS.gold : COLORS.line}`,
          marginBottom: 8,
        }}
      >
        <span style={{ color: COLORS.muted }}>most fruit collected so far: </span>
        <span style={{ color: COLORS.gold, fontWeight: 700 }}>{step.maxFruits}</span>
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
        <span>tile color = fruit type</span>
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
