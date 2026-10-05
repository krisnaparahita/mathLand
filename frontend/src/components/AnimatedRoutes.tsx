import { Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

interface AnimatedRoutesProps {
  children: React.ReactNode;
}

/**
 * AnimatedRoutes - page transition container
 *
 * Uses mode="popLayout" instead of "wait":
 * - "wait" waits for the exit animation to finish before the enter animation starts (~0.6s total delay)
 * - "popLayout" lets the new page enter immediately while the old page exits (smoother)
 *
 * ⚠️ Important: Navbar/Header/Sidebar must live outside AnimatedRoutes,
 * otherwise they are re-created and animated on every page change.
 */
export function AnimatedRoutes({ children }: AnimatedRoutesProps) {
  const location = useLocation();

  return (
    <AnimatePresence mode="popLayout">
      <Routes location={location} key={location.pathname}>
        {children}
      </Routes>
    </AnimatePresence>
  );
}
