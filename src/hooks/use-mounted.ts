"use client";

import { useEffect, useState } from "react";

/**
 * A strict SSR hydration fallback hook.
 * Returns true only AFTER the component has successfully mounted on the client,
 * explicitly averting hydration mismatches on randomized or live-calculating DOM elements.
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
