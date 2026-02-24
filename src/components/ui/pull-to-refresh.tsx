"use client";

import { useRef, useState, useCallback, useEffect } from "react";

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void> | void;
}

export function PullToRefresh({ children, onRefresh }: PullToRefreshProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const [pulling, setPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const threshold = 80;

  const handleTouchStart = useCallback((e: TouchEvent) => {
    // Only pull-to-refresh when scrolled to top
    const scrollContainer = document.getElementById("main-scroll");
    const scrollTop = scrollContainer ? scrollContainer.scrollTop : window.scrollY;
    
    if (scrollTop > 5) return;
    startY.current = e.touches[0].clientY;
    setPulling(true);
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!pulling || refreshing) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy > 0) {
      // Apply rubber-band effect (diminishing returns)
      setPullDistance(Math.min(dy * 0.4, 120));
    }
  }, [pulling, refreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (!pulling) return;
    setPulling(false);

    if (pullDistance >= threshold && !refreshing) {
      setRefreshing(true);
      setPullDistance(threshold * 0.5);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  }, [pulling, pullDistance, threshold, refreshing, onRefresh]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: true });
    el.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const progress = Math.min(pullDistance / threshold, 1);

  return (
    <div ref={containerRef}>
      {/* Pull indicator */}
      <div
        className="flex items-center justify-center overflow-hidden transition-all duration-200 ease-out"
        style={{ height: pullDistance > 0 ? pullDistance : 0 }}
      >
        <div
          className="h-8 w-8 rounded-full border-2 border-emerald-500 border-t-transparent transition-transform"
          style={{
            transform: `rotate(${progress * 360}deg)`,
            opacity: progress,
            animation: refreshing ? "spin 0.8s linear infinite" : "none",
          }}
        />
      </div>
      {children}
    </div>
  );
}
