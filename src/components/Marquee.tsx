export default function Marquee({ items, className = "" }: { items: string[]; className?: string }) {
  const track = items.map((x, i) => <span key={i}>{x}</span>);
  return (
    <div className={`marquee border-y border-hairline-d bg-navy-2 text-bone ${className}`} aria-hidden="true">
      <div className="marquee__track">{track}{items.map((x, i) => <span key={`b${i}`}>{x}</span>)}</div>
    </div>
  );
}
