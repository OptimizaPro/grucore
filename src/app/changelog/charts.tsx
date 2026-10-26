/* Small SVG chart primitives for the changelog report. Server-rendered, no
   library. Palette validated for the navy surface with the dataviz checks
   (adjacent CVD ΔE ≥ 8.4, contrast ≥ 3:1): blue #3987e5, orange #d95926,
   aqua #199e70, yellow #c98500. Text always wears text tokens, never a series
   color. Every chart ships a table view (see <Table>). */
import type { ReactNode } from "react";

export const C = { s1: "#3987e5", s2: "#d95926", s3: "#199e70", s4: "#c98500", dim: "#3b4658", grid: "#233047", text: "#f4f1ea", muted: "#a9b2c2", surface: "#0f1a2e" };
const fmt = (n: number) => n.toLocaleString("en-US");

export function Card({ title, sub, children, table }: { title: string; sub?: string; children: ReactNode; table?: { head: string[]; rows: (string | number)[][] } }) {
  return (
    <figure className="rounded-card border border-hairline-d bg-bone/[.03] p-5 md:p-6 m-0 min-w-0">
      <figcaption className="mb-4"><h3 className="d text-step-1 leading-none text-bone">{title}</h3>{sub && <p className="mt-2 text-step--1 text-bone/70 max-w-[60ch]">{sub}</p>}</figcaption>
      {children}
      {table && (
        <details className="mt-4 text-step--1">
          <summary className="cursor-pointer font-mono text-[.7rem] tracking-[.12em] uppercase text-bone/60">Table view</summary>
          <div className="overflow-x-auto mt-3"><table className="w-full border-collapse text-left"><thead><tr>{table.head.map((h) => <th key={h} className="py-1.5 pr-4 border-b border-hairline-d font-mono text-[.66rem] tracking-[.1em] uppercase text-bone/60">{h}</th>)}</tr></thead>
          <tbody>{table.rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} className="py-1.5 pr-4 border-b border-hairline-d text-bone/85 tabular-nums">{c}</td>)}</tr>)}</tbody></table></div>
        </details>
      )}
    </figure>
  );
}

export function Legend({ items }: { items: { label: string; color: string }[] }) {
  return <ul className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3 font-mono text-[.68rem] tracking-[.1em] uppercase text-bone/70">{items.map((i) => <li key={i.label} className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: i.color }} />{i.label}</li>)}</ul>;
}

/* Grouped horizontal bars: rows × series. Emphasis form when series[0] is the dim tone. */
export function GroupedBars({ rows, series, max, unit = "", w = 640 }: { rows: { label: string; values: number[] }[]; series: { label: string; color: string }[]; max?: number; unit?: string; w?: number }) {
  const m = max ?? Math.max(...rows.flatMap((r) => r.values)) * 1.08;
  const labelW = 150, barH = 14, gap = 2, rowH = series.length * (barH + gap) + 14, h = rows.length * rowH + 8, plotW = w - labelW - 60;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" role="img" aria-label="Grouped bar chart">
      {[0, 0.25, 0.5, 0.75, 1].map((t) => <line key={t} x1={labelW + t * plotW} x2={labelW + t * plotW} y1={0} y2={h - 8} stroke={C.grid} strokeWidth={1} />)}
      {rows.map((r, i) => (
        <g key={r.label} transform={`translate(0 ${i * rowH})`}>
          <text x={labelW - 10} y={rowH / 2 - 4} textAnchor="end" fill={C.text} fontSize={12} dominantBaseline="middle">{r.label}</text>
          {r.values.map((v, j) => {
            const bw = Math.max(0, (v / m) * plotW), y = j * (barH + gap);
            return <g key={j}><rect x={labelW} y={y} width={bw} height={barH} fill={series[j].color} rx={4} ry={4} style={{ clipPath: "inset(0 0 0 0 round 0 4px 4px 0)" }}><title>{`${r.label} · ${series[j].label}: ${fmt(v)}${unit}`}</title></rect>
              <text x={labelW + bw + 6} y={y + barH / 2} fill={C.muted} fontSize={11} dominantBaseline="middle">{fmt(v)}{unit}</text></g>;
          })}
        </g>
      ))}
    </svg>
  );
}

/* Dumbbell: before → after per row, one hue two shades. */
export function Dumbbell({ rows, max, unit = "", w = 640 }: { rows: { label: string; a: number; b: number }[]; max?: number; unit?: string; w?: number }) {
  const m = max ?? Math.max(...rows.flatMap((r) => [r.a, r.b])) * 1.1;
  const labelW = 150, rowH = 34, h = rows.length * rowH + 24, plotW = w - labelW - 70;
  const x = (v: number) => labelW + (v / m) * plotW;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" role="img" aria-label="Before and after chart">
      {[0, 0.25, 0.5, 0.75, 1].map((t) => <g key={t}><line x1={labelW + t * plotW} x2={labelW + t * plotW} y1={0} y2={h - 24} stroke={C.grid} /><text x={labelW + t * plotW} y={h - 6} textAnchor="middle" fill={C.muted} fontSize={10}>{(t * m).toFixed(m < 10 ? 1 : 0)}{unit}</text></g>)}
      {rows.map((r, i) => {
        const y = i * rowH + rowH / 2 - 6;
        return <g key={r.label}>
          <text x={labelW - 10} y={y} textAnchor="end" fill={C.text} fontSize={12} dominantBaseline="middle">{r.label}</text>
          <line x1={x(r.a)} x2={x(r.b)} y1={y} y2={y} stroke={C.s1} strokeOpacity={0.45} strokeWidth={2} />
          <circle cx={x(r.a)} cy={y} r={6} fill={C.dim} stroke={C.surface} strokeWidth={2}><title>{`${r.label} before: ${r.a}${unit}`}</title></circle>
          <circle cx={x(r.b)} cy={y} r={6} fill={C.s1} stroke={C.surface} strokeWidth={2}><title>{`${r.label} after: ${r.b}${unit}`}</title></circle>
          <text x={Math.max(x(r.a), x(r.b)) + 10} y={y} fill={C.muted} fontSize={11} dominantBaseline="middle">{r.a}{unit} → {r.b}{unit}</text>
        </g>;
      })}
    </svg>
  );
}

/* Strip plot: one row of dots per group on a shared axis, with an optional allowed band. */
export function Strip({ groups, min, max, band, unit = "", w = 640 }: { groups: { label: string; values: number[]; color: string }[]; min: number; max: number; band?: [number, number]; unit?: string; w?: number }) {
  const labelW = 90, rowH = 44, h = groups.length * rowH + 26, plotW = w - labelW - 20;
  const x = (v: number) => labelW + ((v - min) / (max - min)) * plotW;
  const ticks = 5;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" role="img" aria-label="Distribution chart">
      {band && <rect x={x(band[0])} y={0} width={x(band[1]) - x(band[0])} height={h - 26} fill={C.s3} fillOpacity={0.12} />}
      {band && <text x={(x(band[0]) + x(band[1])) / 2} y={h - 8} textAnchor="middle" fill={C.s3} fontSize={10}>target {band[0]}–{band[1]}{unit}</text>}
      {Array.from({ length: ticks + 1 }, (_, i) => min + (i * (max - min)) / ticks).map((v) => <g key={v}><line x1={x(v)} x2={x(v)} y1={0} y2={h - 26} stroke={C.grid} /><text x={x(v)} y={h - 8} textAnchor={v === min ? "start" : "middle"} fill={C.muted} fontSize={10}>{Math.round(v)}</text></g>)}
      {groups.map((g, i) => {
        const y = i * rowH + rowH / 2;
        return <g key={g.label}>
          <text x={labelW - 10} y={y} textAnchor="end" fill={C.text} fontSize={12} dominantBaseline="middle">{g.label}</text>
          {g.values.map((v, j) => <circle key={j} cx={x(v)} cy={y + ((j % 5) - 2) * 3.2} r={4.5} fill={g.color} fillOpacity={0.9} stroke={C.surface} strokeWidth={2}><title>{`${g.label}: ${v}${unit}`}</title></circle>)}
        </g>;
      })}
    </svg>
  );
}

/* Horizontal bars, single series (sequential: one hue). Optional emphasis index. */
export function Bars({ rows, unit = "", max, emphasis, color = C.s1, w = 640, labelW = 190 }: { rows: { label: string; value: number }[]; unit?: string; max?: number; emphasis?: number; color?: string; w?: number; labelW?: number }) {
  const m = max ?? Math.max(...rows.map((r) => r.value)) * 1.1;
  const barH = 14, rowH = 24, h = rows.length * rowH + 4, plotW = w - labelW - 70;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" role="img" aria-label="Bar chart">
      {[0.25, 0.5, 0.75, 1].map((t) => <line key={t} x1={labelW + t * plotW} x2={labelW + t * plotW} y1={0} y2={h - 4} stroke={C.grid} />)}
      {rows.map((r, i) => {
        const bw = (r.value / m) * plotW, y = i * rowH + (rowH - barH) / 2, fill = emphasis === undefined ? color : i === emphasis ? color : C.dim;
        return <g key={r.label}>
          <text x={labelW - 10} y={y + barH / 2} textAnchor="end" fill={C.text} fontSize={11.5} dominantBaseline="middle">{r.label}</text>
          <rect x={labelW} y={y} width={bw} height={barH} fill={fill} rx={4} style={{ clipPath: "inset(0 0 0 0 round 0 4px 4px 0)" }}><title>{`${r.label}: ${fmt(r.value)}${unit}`}</title></rect>
          <text x={labelW + bw + 6} y={y + barH / 2} fill={C.muted} fontSize={11} dominantBaseline="middle">{fmt(r.value)}{unit}</text>
        </g>;
      })}
    </svg>
  );
}

/* Line chart, single series with markers. */
export function Line({ points, unit = "", xLabel, w = 640 }: { points: { x: number; y: number; label?: string }[]; unit?: string; xLabel?: string; w?: number }) {
  const h = 220, padL = 44, padB = 34, padT = 14, padR = 20;
  const xs = points.map((p) => p.x), ys = points.map((p) => p.y);
  const xmin = Math.min(...xs), xmax = Math.max(...xs), ymax = Math.max(...ys) * 1.15;
  const X = (v: number) => padL + ((v - xmin) / (xmax - xmin)) * (w - padL - padR), Y = (v: number) => padT + (1 - v / ymax) * (h - padT - padB);
  const d = points.map((p, i) => `${i ? "L" : "M"}${X(p.x)} ${Y(p.y)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" role="img" aria-label="Line chart">
      {[0, 0.5, 1].map((t) => <g key={t}><line x1={padL} x2={w - padR} y1={Y(t * ymax)} y2={Y(t * ymax)} stroke={C.grid} /><text x={padL - 8} y={Y(t * ymax)} textAnchor="end" fill={C.muted} fontSize={10} dominantBaseline="middle">{Math.round(t * ymax)}{unit}</text></g>)}
      <path d={d} fill="none" stroke={C.s2} strokeWidth={2} strokeLinejoin="round" />
      {points.map((p) => <g key={p.x}><circle cx={X(p.x)} cy={Y(p.y)} r={5} fill={C.s2} stroke={C.surface} strokeWidth={2}><title>{`${p.label ?? p.x}: ${p.y}${unit}`}</title></circle><text x={X(p.x)} y={h - padB + 16} textAnchor="middle" fill={C.muted} fontSize={10}>{p.label ?? p.x}</text></g>)}
      {xLabel && <text x={(padL + w - padR) / 2} y={h - 4} textAnchor="middle" fill={C.muted} fontSize={10}>{xLabel}</text>}
    </svg>
  );
}

export function Stat({ label, value, delta, note }: { label: string; value: string; delta?: string; note?: string }) {
  return (
    <div className="rounded-card border border-hairline-d bg-bone/[.03] p-5">
      <span className="block font-mono text-[.68rem] tracking-[.14em] uppercase text-bone/60">{label}</span>
      <span className="block mt-2 font-body font-semibold text-[2.6rem] leading-none text-bone">{value}</span>
      {delta && <span className="block mt-2 text-step--1 text-[#5fd0a2]">{delta}</span>}
      {note && <span className="block mt-1 text-[.8rem] text-bone/60">{note}</span>}
    </div>
  );
}
