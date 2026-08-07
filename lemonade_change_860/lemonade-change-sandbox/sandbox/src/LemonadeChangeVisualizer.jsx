import React, { useState, useMemo, useEffect, useRef } from "react";
import { Play, Pause, ChevronLeft, ChevronRight, RotateCcw, Shuffle, Wallet, Check, X } from "lucide-react";

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

function billColor(bill) {
  if (bill === 5) return COLORS.teal;
  if (bill === 10) return COLORS.violet;
  return COLORS.gold;
}

function generateSteps(bills) {
  const steps = [];
  let count5 = 0;
  let count10 = 0;
  let success = true;

  for (let i = 0; i < bills.length; i++) {
    const bill = bills[i];

    if (bill === 5) {
      count5++;
      steps.push({
        type: "accept5",
        i,
        bill,
        count5,
        count10,
        message: `Customer ${i + 1} pays with $5 \u2014 no change needed. Add it to the register.`,
      });
    } else if (bill === 10) {
      if (count5 === 0) {
        steps.push({
          type: "fail",
          i,
          bill,
          count5,
          count10,
          message: `Customer ${i + 1} pays with $10, but there's no $5 note to give back. Can't make change.`,
        });
        success = false;
        break;
      }
      count5--;
      count10++;
      steps.push({
        type: "accept10",
        i,
        bill,
        count5,
        count10,
        change: [5],
        message: `Customer ${i + 1} pays with $10 \u2014 give back one $5 note.`,
      });
    } else {
      if (count10 > 0 && count5 > 0) {
        count10--;
        count5--;
        steps.push({
          type: "accept20a",
          i,
          bill,
          count5,
          count10,
          change: [10, 5],
          message: `Customer ${i + 1} pays with $20 \u2014 give back one $10 + one $5 (keeps $5 notes in reserve).`,
        });
      } else if (count5 >= 3) {
        count5 -= 3;
        steps.push({
          type: "accept20b",
          i,
          bill,
          count5,
          count10,
          change: [5, 5, 5],
          message: `Customer ${i + 1} pays with $20 \u2014 no $10 available, give back three $5 notes instead.`,
        });
      } else {
        steps.push({
          type: "fail",
          i,
          bill,
          count5,
          count10,
          message: `Customer ${i + 1} pays with $20, but there's no way to make $15 change. Can't make change.`,
        });
        success = false;
        break;
      }
    }
  }

  steps.push({
    type: "done",
    success,
    count5,
    count10,
    message: success
      ? "All customers served successfully! Result: true."
      : "Ran out of correct change to give. Result: false.",
  });

  return steps;
}

const PRESETS = [
  [5, 5, 10, 10, 20],
  [5, 5, 5, 10, 20],
  [5, 5, 10, 20, 5, 5, 5, 20, 20],
  [10, 10],
];

export default function LemonadeChangeVisualizer() {
  const [rawBills, setRawBills] = useState("5, 5, 10, 10, 20");
  const [appliedBills, setAppliedBills] = useState([5, 5, 10, 10, 20]);
  const [stepIdx, setStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState("");
  const intervalRef = useRef(null);

  const steps = useMemo(() => generateSteps(appliedBills), [appliedBills]);
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
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, steps.length]);

  function applyInput() {
    const parsed = rawBills
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map(Number);
    if (parsed.some((n) => Number.isNaN(n) || ![5, 10, 20].includes(n))) {
      setError("Only 5, 10, or 20 allowed, comma-separated.");
      return;
    }
    if (parsed.length < 1 || parsed.length > 16) {
      setError("Keep it between 1 and 16 customers.");
      return;
    }
    setError("");
    setAppliedBills(parsed);
    setStepIdx(0);
    setIsPlaying(false);
  }

  function randomize() {
    const preset = PRESETS[Math.floor(Math.random() * PRESETS.length)];
    setRawBills(preset.join(", "));
    setAppliedBills(preset);
    setStepIdx(0);
    setIsPlaying(false);
    setError("");
  }

  function reset() {
    setStepIdx(0);
    setIsPlaying(false);
  }

  const bills = appliedBills;
  const tileW = bills.length > 10 ? 50 : 60;
  const tileGap = 10;
  const isDone = step.type === "done";
  const isFail = step.type === "fail";
  const current = isDone ? undefined : step.i;

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
        @keyframes ts-pop { 0% { transform: scale(1); } 40% { transform: scale(1.15); } 100% { transform: scale(1); } }
        .ts-pop { animation: ts-pop 0.5s ease; }
        @keyframes ts-give { 0% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(-14px); opacity: 0; } }
        .ts-give { animation: ts-give 0.6s ease forwards; }
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
          Greedy algorithm
        </div>
        <div className="ts-disp" style={{ fontSize: 26, fontWeight: 600 }}>
          Lemonade Change — The Cash Register
        </div>
      </div>

      {/* input */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
        <input
          value={rawBills}
          onChange={(e) => setRawBills(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyInput()}
          placeholder="bills, e.g. 5, 5, 10, 10, 20"
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
      <div style={{ fontSize: 11.5, color: COLORS.muted, marginBottom: 10 }}>
        Only $5, $10, and $20 bills are valid — each drink costs $5.
      </div>
      {error && <div style={{ fontSize: 12.5, color: COLORS.crimson, marginBottom: 10 }}>{error}</div>}

      {/* message banner */}
      <div
        key={stepIdx}
        style={{
          borderLeft: `3px solid ${isFail ? COLORS.crimson : isDone && step.success ? COLORS.gold : COLORS.violet}`,
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

      {/* customer queue */}
      <div className="ts-row" style={{ overflowX: "auto", paddingBottom: 4, marginBottom: 8 }}>
        <div style={{ position: "relative", paddingTop: 26, minWidth: bills.length * (tileW + tileGap) }}>
          <div style={{ display: "flex", gap: tileGap }}>
            {bills.map((b, i) => {
              const isCurrent = i === current;
              const isPast = current !== undefined ? i < current : !isFail;
              const color = billColor(b);
              return (
                <div key={i} style={{ position: "relative" }}>
                  {isCurrent && (
                    <div
                      style={{
                        position: "absolute",
                        top: -24,
                        left: "50%",
                        transform: "translateX(-50%)",
                        fontSize: 9,
                        fontWeight: 700,
                        color: COLORS.gold,
                        background: COLORS.panel2,
                        border: `1px solid ${COLORS.gold}`,
                        borderRadius: 4,
                        padding: "1px 5px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      NOW
                    </div>
                  )}
                  <div
                    className={isCurrent ? "ts-pop" : ""}
                    style={{
                      width: tileW,
                      height: tileW * 0.62,
                      borderRadius: 8,
                      background: `${color}22`,
                      border: `1.5px solid ${color}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: isPast || isCurrent ? 1 : 0.45,
                      flexShrink: 0,
                    }}
                  >
                    <span className="ts-num" style={{ fontSize: 15, fontWeight: 700, color: COLORS.ivory }}>
                      ${b}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: tileGap, marginTop: 6 }}>
            {bills.map((_, i) => (
              <div
                key={i}
                className="ts-num"
                style={{ width: tileW, textAlign: "center", fontSize: 10, color: COLORS.muted, flexShrink: 0 }}
              >
                customer {i + 1}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* change given */}
      {step.change && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "10px 0" }}>
          <span style={{ fontSize: 12, color: COLORS.muted }}>change given:</span>
          {step.change.map((c, idx) => (
            <div
              key={idx}
              className="ts-num"
              style={{
                background: `${billColor(c)}22`,
                border: `1px solid ${billColor(c)}`,
                borderRadius: 6,
                padding: "3px 9px",
                fontSize: 12.5,
                color: COLORS.ivory,
              }}
            >
              ${c}
            </div>
          ))}
        </div>
      )}

      {/* register panel */}
      <div style={{ background: COLORS.panel, borderRadius: 8, padding: "12px 14px", margin: "18px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
          <Wallet size={14} color={COLORS.muted} />
          <span style={{ fontSize: 11.5, color: COLORS.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            cash register
          </span>
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          <div className="ts-num">
            <span style={{ color: COLORS.teal, fontWeight: 700, fontSize: 18 }}>{step.count5 ?? 0}</span>
            <span style={{ color: COLORS.muted, fontSize: 13 }}> {"\u00d7"} $5 notes</span>
          </div>
          <div className="ts-num">
            <span style={{ color: COLORS.violet, fontWeight: 700, fontSize: 18 }}>{step.count10 ?? 0}</span>
            <span style={{ color: COLORS.muted, fontSize: 13 }}> {"\u00d7"} $10 notes</span>
          </div>
        </div>
      </div>

      {/* result banner */}
      {isDone && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            background: COLORS.panel,
            borderRadius: 10,
            padding: "14px 18px",
            marginBottom: 20,
            border: `1px solid ${step.success ? COLORS.gold : COLORS.crimson}`,
          }}
        >
          {step.success ? <Check size={20} color={COLORS.gold} /> : <X size={20} color={COLORS.crimson} />}
          <span
            className="ts-num"
            style={{ fontSize: 15, fontWeight: 700, color: step.success ? COLORS.gold : COLORS.crimson }}
          >
            {step.success ? "true" : "false"}
          </span>
        </div>
      )}

      {/* controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
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
        <span><span style={{ color: COLORS.teal }}>●</span> $5 note</span>
        <span><span style={{ color: COLORS.violet }}>●</span> $10 note</span>
        <span><span style={{ color: COLORS.gold }}>●</span> $20 note</span>
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
