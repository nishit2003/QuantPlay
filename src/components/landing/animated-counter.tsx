"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useMounted } from "@/hooks/use-mounted";

interface CounterProps {
  target: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}

export function AnimatedCounter({ target, suffix = "", prefix = "", duration = 1500 }: CounterProps) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  
  // Strict SSR Safety
  const mounted = useMounted();

  useEffect(() => {
    if (!mounted) return; // Do not observe until explicitly hydrated

    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect(); // Fire once
      const start = performance.now();
      
      let reqId: number;
      const step = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        // easeOutCubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(target * eased));
        if (progress < 1) {
          reqId = requestAnimationFrame(step);
        }
      };
      reqId = requestAnimationFrame(step);
      
      // Strict cleanup
      return () => cancelAnimationFrame(reqId);
    }, { threshold: 0.5 });
    
    if (ref.current) obs.observe(ref.current);
    
    return () => obs.disconnect(); // Explicit global cleanup
  }, [target, duration, mounted]);

  const displayValue = useMemo(() => {
    // If not mounted, output a safe 0 state to avoid mismatch
    if (!mounted) return "0"; 

    if (target >= 1_000_000) return (value / 1_000_000).toFixed(1);
    if (target >= 1_000) return (value / 1_000).toFixed(0);
    return value.toString();
  }, [value, target, mounted]);

  return <span ref={ref}>{prefix}{displayValue}{suffix}</span>;
}
