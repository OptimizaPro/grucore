import Link from "next/link";
import { breadcrumbs, JsonLd } from "@/lib/schema";

/* Visible trail + BreadcrumbList schema from the same list, so they never drift. */
export default function Breadcrumbs({ items }: { items: { name: string; path: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="bg-bone border-b border-hairline" data-tone="light">
      <ol className="shell flex flex-wrap gap-x-2 gap-y-1 py-3 font-mono text-[.7rem] tracking-[.1em] uppercase text-muted">
        {items.map((it, i) => (
          <li key={it.path} className="flex gap-2">
            {i < items.length - 1 ? <><Link className="hover:text-ink" href={it.path}>{it.name}</Link><span aria-hidden="true">/</span></> : <span aria-current="page" className="text-ink">{it.name}</span>}
          </li>
        ))}
      </ol>
      <JsonLd data={breadcrumbs(items)} />
    </nav>
  );
}
