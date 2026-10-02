import { useState, useEffect, useMemo } from "react";

// Mirrors Solution.maxProduct step by step.
function buildSteps(nums) {
  if (!nums.length) return [];
  const steps = [{ i: 0, x: nums[0], cands: null, mx: nums[0], mn: nums[0], best: nums[0] }];
  let mx = nums[0], mn = nums[0], best = nums[0];
  for (let i = 1; i < nums.length; i++) {
    const x = nums[i];
    const cands = [x, mx * x, mn * x];
    const nmx = Math.max(...cands);
    const nmn = Math.min(...cands);
    best = Math.max(best, nmx, nmn);
    steps.push({ i, x, cands, prevMx: mx, prevMn: mn, mx: nmx, mn: nmn, best });
    mx = nmx;
    mn = nmn;
  }
  return steps;
}

function parse(text) {
  const parts = text.split(/[\s,]+/).filter(Boolean).map(Number);
  return parts.length && parts.every(Number.isFinite) ? parts : null;
}

const C = { bg: "#0f1420", panel: "#1a2234", line: "#34405c", tx: "#e2e8f4", dim: "#7c88a2",
  max: "#2dd4a7", min: "#a78bfa", best: "#f5c542", neg: "#ff6b6b" };

const css = `
.mp{background:${C.bg};color:${C.tx};min-height:100vh;padding:28px 20px;font-family:"Segoe UI",system-ui,sans-serif}
.mp *{box-sizing:border-box}
.mp-wrap{max-width:820px;margin:0 auto}
.mp h1{font-size:24px;margin:0 0 4px}
.mp p.sub{color:${C.dim};margin:0 0 20px;font-size:14px}
.mp-row{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:18px}
.mp input{background:${C.panel};border:2px solid ${C.line};color:${C.tx};border-radius:8px;padding:9px 12px;font:16px ui-monospace,Consolas,monospace;flex:1;min-width:200px}
.mp input:focus-visible,.mp button:focus-visible{outline:3px solid ${C.best};outline-offset:2px}
.mp input.bad{border-color:${C.neg}}
.mp button{background:${C.panel};color:${C.tx};border:2px solid ${C.line};border-radius:8px;padding:9px 14px;font-size:15px;cursor:pointer}
.mp button:hover:not(:disabled){border-color:${C.dim}}
.mp button:disabled{opacity:.4;cursor:default}
.mp button.go{border-color:${C.best};color:${C.best}}
.mp-arr{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:6px}
.cell{width:64px;text-align:center}
.cell b{display:block;background:${C.panel};border:2px solid ${C.line};border-radius:10px;padding:14px 0;font:700 20px ui-monospace,Consolas,monospace}
.cell.cur b{border-color:${C.best};border-width:3px;background:#2c2818}
.cell.done b{opacity:.65}
.cell small{color:${C.dim};font-size:12px}
.note{margin:14px 0;min-height:24px}
.cands{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:18px}
.card{background:${C.panel};border:2px solid ${C.line};border-radius:10px;padding:12px;text-align:center}
.card span{display:block;color:${C.dim};font-size:13px;margin-bottom:8px}
.card em{font:700 24px ui-monospace,Consolas,monospace;font-style:normal}
.card.win{border-color:${C.max};border-width:3px}
.card.lose{border-color:${C.min};border-width:3px}
.trk{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:22px}
.trk .card em{font-size:36px}
table{width:100%;border-collapse:collapse;font:14px ui-monospace,Consolas,monospace}
th,td{padding:7px 8px;text-align:right;border-bottom:1px solid ${C.line}}
th{color:${C.dim};font-weight:600}
tr.on td{background:#2c2818}
.verdict{margin-top:18px;padding:14px;border:2px solid ${C.best};border-radius:10px;color:${C.best};font-size:18px}
@media(max-width:560px){.cands,.trk{grid-template-columns:1fr}}
@media(prefers-reduced-motion:no-preference){.card{transition:border-color .2s}}
`;

export default function MaxProductVisualizer() {
  const [text, setText] = useState("2, 3, -2, 4, -1");
  const [nums, setNums] = useState([2, 3, -2, 4, -1]);
  const [k, setK] = useState(0);
  const [play, setPlay] = useState(false);

  const steps = useMemo(() => buildSteps(nums), [nums]);
  const last = steps.length - 1;
  const s = steps[Math.min(k, last)];
  const bad = parse(text) === null;

  useEffect(() => {
    if (!play) return;
    if (k >= last) { setPlay(false); return; }
    const t = setTimeout(() => setK((v) => v + 1), 1200);
    return () => clearTimeout(t);
  }, [play, k, last]);

  const load = () => {
    const p = parse(text);
    if (p) { setNums(p); setK(0); setPlay(false); }
  };

  if (!s) return null;
  const done = k === last;

  return (
    <div className="mp">
      <style>{css}</style>
      <div className="mp-wrap">
        <h1>Maximum Product Subarray</h1>
        <p className="sub">Track the biggest and smallest product ending at each index. A negative number swaps them.</p>

        <div className="mp-row">
          <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()}
            className={bad ? "bad" : ""} aria-label="Numbers, separated by commas" />
          <button className="go" onClick={load} disabled={bad}>Load array</button>
        </div>

        <div className="mp-arr">
          {nums.map((v, i) => (
            <div key={i} className={"cell " + (i === s.i ? "cur" : i < s.i ? "done" : "")}>
              <b style={{ color: v < 0 ? C.neg : C.tx }}>{v}</b>
              <small>i={i}</small>
            </div>
          ))}
        </div>

        <div className="note">
          {k === 0
            ? <>Start: curMax = curMin = best = <b>{nums[0]}</b></>
            : <>nums[{s.i}] = <b>{s.x}</b>{s.x < 0 && <span style={{ color: C.neg }}> — negative, so min and max swap roles</span>}</>}
        </div>

        <div className="cands">
          {["nums[i] alone", "prevMax × nums[i]", "prevMin × nums[i]"].map((label, j) => {
            const v = s.cands ? s.cands[j] : null;
            const cls = v === null ? "" : v === s.mx ? "win" : v === s.mn ? "lose" : "";
            return (
              <div key={j} className={"card " + cls}>
                <span>{label}</span>
                <em>{v === null ? "—" : v}</em>
              </div>
            );
          })}
        </div>

        <div className="trk">
          <div className="card" style={{ borderColor: C.max }}><span style={{ color: C.max }}>curMax</span><em>{s.mx}</em></div>
          <div className="card" style={{ borderColor: C.min }}><span style={{ color: C.min }}>curMin</span><em>{s.mn}</em></div>
          <div className="card" style={{ borderColor: C.best }}><span style={{ color: C.best }}>best so far</span><em>{s.best}</em></div>
        </div>

        <div className="mp-row">
          <button onClick={() => { setPlay(false); setK(Math.max(0, k - 1)); }} disabled={k === 0}>Back</button>
          <button className="go" onClick={() => { setPlay(false); setK(Math.min(last, k + 1)); }} disabled={done}>Next step</button>
          <button onClick={() => { if (done) setK(0); setPlay(!play); }}>{play ? "Pause" : done ? "Replay" : "Auto-play"}</button>
          <button onClick={() => { setPlay(false); setK(0); }} disabled={k === 0}>Reset</button>
        </div>

        <table>
          <thead><tr><th>i</th><th>nums[i]</th><th>curMax</th><th>curMin</th><th>best</th></tr></thead>
          <tbody>
            {steps.slice(0, k + 1).map((r) => (
              <tr key={r.i} className={r.i === k ? "on" : ""}>
                <td>{r.i}</td><td>{r.x}</td><td>{r.mx}</td><td>{r.mn}</td><td>{r.best}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {done && <div className="verdict">Maximum product = <b>{s.best}</b></div>}
      </div>
    </div>
  );
}
