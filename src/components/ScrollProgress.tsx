"use client";
import { motion, useScroll, useSpring } from "framer-motion";
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 240, damping: 40 });
  return <motion.div aria-hidden="true" className="fixed top-0 left-0 h-[2px] w-full origin-left bg-amber z-[1500] pointer-events-none" style={{ scaleX }} />;
}
