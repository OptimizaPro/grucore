import Link from "next/link";
export default function NotFound() {
  return (
    <section className="sec min-h-[70svh] flex items-end bg-navy-2 text-bone" data-tone="dark">
      <div className="shell pt-[calc(var(--barh)+5rem)]">
        <span className="eyebrow text-amber mb-4">404</span>
        <h1 className="d d-lg max-w-[16ch]">Page not found · Página no encontrada</h1>
        <div className="flex flex-wrap gap-3 mt-8"><Link className="btn btn--solid" href="/">Home</Link><Link className="btn btn--ghost" href="/es">Inicio</Link><Link className="btn btn--ghost" href="/questions">Questions</Link><Link className="btn btn--ghost" href="/es/preguntas-frecuentes">Preguntas</Link></div>
      </div>
    </section>
  );
}
