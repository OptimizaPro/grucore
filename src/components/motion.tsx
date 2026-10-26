"use client";
/* Framer Motion primitives. One easing, one reveal, used everywhere so the
   whole site moves as a single system. Transform + opacity only. */
import { motion, useInView, useReducedMotion, animate, useMotionValue, useSpring, type Variants } from "framer-motion";
import { Fragment, useEffect, useRef, useState, type ReactNode, type ComponentProps } from "react";

export const EASE = [0.22, 1, 0.36, 1] as const;
export const fadeUp: Variants = { hidden: { opacity: 0, y: 26 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } } };
const VIEWPORT = { once: true, margin: "0px 0px -12% 0px" } as const;

type Div = ComponentProps<typeof motion.div>;

export function Reveal({ children, delay = 0, className, ...rest }: Div & { delay?: number }) {
  return (
    <motion.div initial="hidden" whileInView="show" viewport={VIEWPORT} variants={fadeUp} transition={{ delay }} className={className} {...rest}>
      {children}
    </motion.div>
  );
}

/** Parent that staggers its <Item> children into view. */
export function Stagger({ children, className, stagger = 0.07, delay = 0, ...rest }: Div & { stagger?: number; delay?: number }) {
  return (
    <motion.div initial="hidden" whileInView="show" viewport={VIEWPORT} variants={{ show: { transition: { staggerChildren: stagger, delayChildren: delay } } }} className={className} {...rest}>
      {children}
    </motion.div>
  );
}
export function Item({ children, className, ...rest }: Div) {
  return <motion.div variants={fadeUp} className={className} {...rest}>{children}</motion.div>;
}

/** Word-mask reveal for headlines. Pure CSS keyframes (see globals.css) so the
    headline is visible and animating before any JavaScript has hydrated. */
export function SplitWords({ text, className, delay = 0, as: Tag = "span" }: { text: string; className?: string; delay?: number; as?: "span" | "h1" | "h2" }) {
  /* Each word is a masked slot; the words themselves stay real text, so no
     ARIA is needed for screen readers to read the line normally. */
  const words = text.split(/\s+/);
  return (
    <Tag className={className}>
      {words.map((w, i) => (
        <Fragment key={i}>
          <span className="inline-block align-top overflow-hidden pb-[.16em] -mb-[.16em]">
            <span className="inline-block word-in" style={{ animationDelay: `${delay + i * 0.045}s` }}>{w}</span>
          </span>
          {/* the space lives between the inline blocks, not inside one, so it is neither trimmed nor unbreakable */}
          {i < words.length - 1 ? " " : ""}
        </Fragment>
      ))}
    </Tag>
  );
}

/** Counts up when scrolled into view. Ease-out cubic, 1.6s. */
export function Counter({ value, suffix = "", decimals = 0, duration = 1.6, className }: { value: number; suffix?: string; decimals?: number; duration?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduced = useReducedMotion();
  /* The server HTML carries the real number (crawlers, AI assistants and
     no-JS readers used to see "0.0 Star rating"). On the client, a counter
     that is still below the fold is zeroed so it can count up when it
     scrolls in; one already on screen just stays put. */
  const [n, setN] = useState(value);
  const armed = useRef(false);
  useEffect(() => {
    if (reduced || !ref.current || ref.current.getBoundingClientRect().top < window.innerHeight) return;
    armed.current = true;
    setN(0);
  }, [reduced]);
  useEffect(() => {
    if (!inView || !armed.current) return;
    const c = animate(0, value, { duration, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setN(v), onComplete: () => { armed.current = false; } });
    return () => c.stop();
  }, [inView, value, duration]);
  const text = decimals ? n.toFixed(decimals) : Math.round(n).toLocaleString("en-US");
  return <span ref={ref} className={className}>{text}{suffix}</span>;
}

/** Magnetic wrapper, reserved for the single primary CTA per page. */
export function Magnetic({ children, strength = 0.24 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const x = useSpring(useMotionValue(0), { stiffness: 260, damping: 20, mass: 0.35 });
  const y = useSpring(useMotionValue(0), { stiffness: 260, damping: 20, mass: 0.35 });
  const onMove = (e: React.PointerEvent) => {
    if (reduced || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => { x.set(0); y.set(0); };
  return <motion.div ref={ref} className="inline-block magnetic" style={{ x, y }} onPointerMove={onMove} onPointerLeave={reset}>{children}</motion.div>;
}
