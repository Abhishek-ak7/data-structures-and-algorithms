import React, { useState, useMemo, useEffect, useRef } from "react";
import { Play, Pause, ChevronLeft, ChevronRight, RotateCcw, Shuffle } from "lucide-react";

const COLORS = {
  bg: "#141A22",
  panel: "#1C242F",
  panel2: "#222C38",
  ivory: "#F1EDE4",
  muted: "#7C93A8",
  gold: "#E7B549",
  teal: "#3FB68B",
  crimson: "#D64550",
  violet: "#9C8FD9",
  sand: "#D9CBB3",
  line: "#2E3947",
};

function tileTone(v) {
  if (v > 0) return { fg: COLORS.teal, bg: "rgba(63,182,139,0.12)", border: "rgba(63,182,139,0.45)" };
  if (v < 0) return { fg: COLORS.crimson, bg: "rgba(214,69,80,0.12)", border: "rgba(214,69,80,0.45)" };
  return { fg: COLORS.sand, bg: "rgba(217,203,179,0.12)", border: "rgba(217,203,179,0.45)" };
}

function generateSteps(input) {
  const sorted = [...input].sort((a, b) => a - b);
  const n = sorted.length;
  const steps = [];
  const triplets = [];

  steps.push({
    type: "sorted",
    sorted,
    triplets: [],
    message: "The ledger is sorted — biggest debt on the left, biggest credit on the right.",
  });

  for (let tar = 0; tar < n - 2; tar++) {
    if (tar > 0 && sorted[tar] === sorted[tar - 1]) {
      steps.push({
        type: "skip-anchor",
        tar,
        sorted,
        triplets: [...triplets],
        message: `Anchor ${sorted[tar]} repeats the last anchor — skip it to avoid a duplicate trio.`,
      });
      continue;
    }

    let small = tar + 1;
    let large = n - 1;
    const target = -sorted[tar];

    steps.push({
      type: "new-anchor",
      tar,
      small,
      large,
      target,
      sorted,
      triplets: [...triplets],
      message: `New anchor: ${sorted[tar]}. The two scouts need Low + High to equal ${target}.`,
    });

    while (small < large) {
      const sum = sorted[small] + sorted[large];

      if (sum === target) {
        triplets.push([sorted[tar], sorted[small], sorted[large]]);
        steps.push({
          type: "found",
          tar,
          small,
          large,
          target,
          sum,
          sorted,
          triplets: [...triplets],
          message: `Low (${sorted[small]}) + High (${sorted[large]}) = ${sum}. That balances the anchor — trio recorded!`,
        });
        small++;
        large--;
        while (small < large && sorted[small] === sorted[small - 1]) {
          steps.push({
            type: "skip-dup-small",
            tar,
            small,
            large,
            target,
            sorted,
            triplets: [...triplets],
            message: `Low repeats the value we already used — skip it.`,
          });
          small++;
        }
        while (small < large && sorted[large] === sorted[large + 1]) {
          steps.push({
            type: "skip-dup-large",
            tar,
            small,
            large,
            target,
            sorted,
            triplets: [...triplets],
            message: `High repeats the value we already used — skip it.`,
          });
          large--;
        }
        if (small < large) {
          steps.push({
            type: "compare",
            tar,
            small,
            large,
            target,
            sorted,
            triplets: [...triplets],
            message: "Both scouts step inward. Comparing again.",
          });
        }
      } else if (sum < target) {
        steps.push({
          type: "move-small",
          tar,
          small,
          large,
          target,
          sum,
          sorted,
          triplets: [...triplets],
          message: `Low + High = ${sum}, too small. Move the Low scout right to find a bigger number.`,
        });
        small++;
      } else {
        steps.push({
          type: "move-large",
          tar,
          small,
          large,
          target,
          sum,
          sorted,
          triplets: [...triplets],
          message: `Low + High = ${sum}, too big. Move the High scout left to find a smaller number.`,
        });
        large--;
      }
    }

    steps.push({
      type: "anchor-done",
      tar,
      sorted,
      triplets: [...triplets],
      message: "The two scouts have crossed. Done with this anchor.",
    });
  }

  steps.push({
    type: "complete",
    sorted,
    triplets: [...triplets],
    message: `All anchors checked. Found ${triplets.length} unique trio${triplets.length === 1 ? "" : "s"}.`,
  });

  return steps;
}

const PRESETS = [
  [-1, 0, 1, 2, -1, -4],
  [0, 0, 0, 0],
  [3, -2, 1, 0, -1, -1, 2, -2],
  [-2, 0, 1, 1, 2],
];

export default function ThreeSumVisualizer() {
  const [rawInput, setRawInput] = useState("-1, 0, 1, 2, -1, -4");
  const [appliedArray, setAppliedArray] = useState([-1, 0, 1, 2, -1, -4]);
  const [stepIdx, setStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState("");
  const intervalRef = useRef(null);

  const steps = useMemo(() => generateSteps(appliedArray), [appliedArray]);
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
    const parsed = rawInput
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map(Number);
    if (parsed.some((n) => Number.isNaN(n))) {
      setError("Only numbers, separated by commas, please.");
      return;
    }
    if (parsed.length < 3) {
      setError("Need at least 3 numbers.");
      return;
    }
    if (parsed.length > 10) {
      setError("Keep it to 10 numbers or fewer, so the bench stays readable.");
      return;
    }
    setError("");
    setAppliedArray(parsed);
    setStepIdx(0);
    setIsPlaying(false);
  }

  function randomize() {
    const len = 6 + Math.floor(Math.random() * 3);
    const arr = Array.from({ length: len }, () => Math.floor(Math.random() * 11) - 5);
    setRawInput(arr.join(", "));
    setAppliedArray(arr);
    setStepIdx(0);
    setIsPlaying(false);
    setError("");
  }

  function reset() {
    setStepIdx(0);
    setIsPlaying(false);
  }

  const sorted = step.sorted;
  const tar = step.tar;
  const small = step.small;
  const large = step.large;

  const isFound = step.type === "found";
  const sumKnown = step.sum !== undefined;
  const sumMatches = sumKnown && step.sum === step.target;

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
        .ts-tile { transition: transform 0.25s cubic-bezier(.2,.8,.3,1), box-shadow 0.25s ease, border-color 0.25s ease; }
        .ts-pin { transition: left 0.35s cubic-bezier(.2,.8,.3,1); }
        @keyframes ts-pop { 0% { transform: scale(1); } 40% { transform: scale(1.12); } 100% { transform: scale(1); } }
        .ts-pop { animation: ts-pop 0.5s ease; }
        .ts-row::-webkit-scrollbar { height: 6px; }
        .ts-row::-webkit-scrollbar-thumb { background: ${COLORS.line}; border-radius: 3px; }
      `}</style>

      {/* Eyebrow + title */}
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
          Two-pointer technique
        </div>
        <div className="ts-disp" style={{ fontSize: 26, fontWeight: 600, color: COLORS.ivory }}>
          The Ledger Walk — visualising 3Sum
        </div>
      </div>

      {/* Input row */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 10 }}>
        <input
          value={rawInput}
          onChange={(e) => setRawInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyInput()}
          placeholder="e.g. -1, 0, 1, 2, -1, -4"
          className="ts-num"
          style={{
            flex: "1 1 260px",
            background: COLORS.panel2,
            border: `1px solid ${COLORS.line}`,
            borderRadius: 8,
            padding: "9px 12px",
            color: COLORS.ivory,
            fontSize: 14,
            outline: "none",
          }}
        />
        <button
          onClick={applyInput}
          className="ts-btn"
          style={{
            background: COLORS.gold,
            color: "#1B1608",
            border: "none",
            borderRadius: 8,
            padding: "9px 16px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Trace it
        </button>
        <button
          onClick={randomize}
          className="ts-btn"
          title="Random example"
          style={{
            background: "transparent",
            color: COLORS.muted,
            border: `1px solid ${COLORS.line}`,
            borderRadius: 8,
            padding: "9px 10px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Shuffle size={16} />
        </button>
      </div>
      {error && <div style={{ fontSize: 12.5, color: COLORS.crimson, marginBottom: 10 }}>{error}</div>}

      {/* Message banner */}
      <div
        key={stepIdx}
        style={{
          borderLeft: `3px solid ${isFound ? COLORS.gold : COLORS.violet}`,
          background: COLORS.panel,
          padding: "12px 14px",
          borderRadius: 6,
          fontSize: 14,
          lineHeight: 1.5,
          margin: "14px 0 26px",
          color: COLORS.ivory,
        }}
      >
        {step.message}
      </div>

      {/* Tiles + pointers */}
      <div
        className="ts-row"
        style={{ overflowX: "auto", paddingBottom: 4, marginBottom: 8 }}
      >
        <div style={{ position: "relative", paddingTop: 40, minWidth: sorted.length * 68 }}>
          {/* pointer tags */}
          {[
            { idx: tar, label: "ANCHOR", color: COLORS.gold },
            { idx: small, label: "LOW", color: COLORS.teal },
            { idx: large, label: "HIGH", color: COLORS.violet },
          ].map(
            (p) =>
              p.idx !== undefined && (
                <div
                  key={p.label}
                  className="ts-pin"
                  style={{
                    position: "absolute",
                    left: p.idx * 68 + 34,
                    top: 0,
                    transform: "translateX(-50%)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      color: p.color,
                      background: COLORS.panel2,
                      border: `1px solid ${p.color}`,
                      borderRadius: 4,
                      padding: "2px 6px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {p.label}
                  </span>
                  <div style={{ width: 1, height: 12, background: p.color }} />
                </div>
              )
          )}

          {/* tiles */}
          <div style={{ display: "flex", gap: 12 }}>
            {sorted.map((v, i) => {
              const tone = tileTone(v);
              const active = i === tar || i === small || i === large;
              const justFound = isFound && (i === small || i === large || i === tar);
              return (
                <div
                  key={i}
                  className={`ts-tile ${justFound ? "ts-pop" : ""}`}
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 10,
                    background: tone.bg,
                    border: `1.5px solid ${active ? (i === tar ? COLORS.gold : i === small ? COLORS.teal : COLORS.violet) : tone.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: active ? `0 0 0 2px ${COLORS.bg}, 0 0 0 3px ${i === tar ? COLORS.gold : i === small ? COLORS.teal : COLORS.violet}` : "none",
                  }}
                >
                  <span className="ts-num" style={{ fontSize: 17, fontWeight: 600, color: tone.fg }}>
                    {v}
                  </span>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
            {sorted.map((_, i) => (
              <div
                key={i}
                className="ts-num"
                style={{ width: 56, textAlign: "center", fontSize: 11, color: COLORS.muted, flexShrink: 0 }}
              >
                {i}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sum readout */}
      {sumKnown && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: COLORS.panel,
            borderRadius: 8,
            padding: "10px 14px",
            margin: "18px 0",
            fontSize: 14,
          }}
          className="ts-num"
        >
          <span style={{ color: COLORS.teal }}>Low {sorted[small]}</span>
          <span style={{ color: COLORS.muted }}>+</span>
          <span style={{ color: COLORS.violet }}>High {sorted[large]}</span>
          <span style={{ color: COLORS.muted }}>=</span>
          <span style={{ color: sumMatches ? COLORS.gold : COLORS.ivory, fontWeight: 700 }}>{step.sum}</span>
          <span style={{ color: COLORS.muted, marginLeft: "auto" }}>
            need {step.target} {sumMatches ? "✓ match" : step.sum < step.target ? "(too small)" : "(too big)"}
          </span>
        </div>
      )}

      {/* Controls */}
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

      {/* Triplets ledger */}
      <div style={{ marginTop: 30 }}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: COLORS.muted,
            fontWeight: 600,
            marginBottom: 10,
          }}
        >
          Trios recorded ({step.triplets.length})
        </div>
        {step.triplets.length === 0 ? (
          <div style={{ fontSize: 13, color: COLORS.muted, fontStyle: "italic" }}>None yet — keep walking the ledger.</div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {step.triplets.map((t, i) => (
              <div
                key={i}
                className="ts-num"
                style={{
                  background: COLORS.panel2,
                  border: `1px solid ${COLORS.line}`,
                  borderRadius: 8,
                  padding: "6px 12px",
                  fontSize: 13,
                  color: COLORS.gold,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span style={{ color: COLORS.muted, fontSize: 11 }}>#{i + 1}</span>
                [{t.join(", ")}]
              </div>
            ))}
          </div>
        )}
      </div>

      {/* legend */}
      <div style={{ display: "flex", gap: 16, marginTop: 26, fontSize: 11.5, color: COLORS.muted, flexWrap: "wrap" }}>
        <span><span style={{ color: COLORS.gold }}>●</span> anchor</span>
        <span><span style={{ color: COLORS.teal }}>●</span> low scout</span>
        <span><span style={{ color: COLORS.violet }}>●</span> high scout</span>
        <span><span style={{ color: COLORS.crimson }}>●</span> debt (negative)</span>
        <span><span style={{ color: COLORS.teal }}>●</span> credit (positive)</span>
      </div>
    </div>
  );
}

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
