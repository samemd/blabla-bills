import { animate, useMotionValue, useMotionValueEvent } from "framer-motion";
import { useEffect, useState } from "react";

export function useAnimatedNumber(value: number, duration = 0.8) {
  const mv = useMotionValue(value);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const controls = animate(mv, value, {
      duration,
      ease: "easeOut",
    });
    return () => controls.stop();
  }, [value, duration, mv]);

  useMotionValueEvent(mv, "change", (v) => {
    setDisplay(v);
  });

  return display;
}
