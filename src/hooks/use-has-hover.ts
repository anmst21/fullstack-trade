"use client";

import { useState, useEffect } from "react";

export function useHasHover() {
  const [hasHover, setHasHover] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(hover: hover)");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset on coin change
    setHasHover(mql.matches);
    const handler = (e: MediaQueryListEvent) => setHasHover(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return hasHover;
}
