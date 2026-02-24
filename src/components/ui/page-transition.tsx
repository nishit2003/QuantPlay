"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [currentKey, setCurrentKey] = useState(pathname);

  useEffect(() => {
    setVisible(false);
    const id = requestAnimationFrame(() => {
      setCurrentKey(pathname);
      requestAnimationFrame(() => setVisible(true));
    });
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return (
    <div
      key={currentKey}
      className="transition-all duration-200 ease-out"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(6px)",
      }}
    >
      {children}
    </div>
  );
}
