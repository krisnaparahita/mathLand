import { motion } from "./MotionPrimitives";

const variants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  "slide-up": {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
  },
  "slide-fade": {
    initial: { opacity: 0, x: 12 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -12 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98 },
  },
};

type TransitionMode = keyof typeof variants;

interface PageTransitionProps {
  children: React.ReactNode;
  transition?: TransitionMode;
}

/**
 * PageTransition - wrapper for page enter/exit animations
 *
 * Tuning notes:
 * - Animation duration shortened to 0.2s (from 0.3s) to feel smoother with popLayout mode
 * - Smaller offset (y: 16 instead of 24) to avoid large jumps
 * - The layout prop keeps layout changes smooth as well
 *
 * ⚠️ Important: this component only wraps the page content area.
 * Navbar/Header/Sidebar must stay outside AnimatedRoutes, not inside PageTransition.
 */
export function PageTransition({ children, transition = "fade" }: PageTransitionProps) {
  const v = variants[transition];

  return (
    <motion.div
      layout
      initial={v.initial}
      animate={v.animate}
      exit={v.exit}
      transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}
