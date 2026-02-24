import Image from "next/image";

type LogoSize = "sm" | "md" | "lg" | "xl";

const sizeMap: Record<LogoSize, { width: number; height: number; wordmarkClass: string }> = {
  sm: { width: 32, height: 32, wordmarkClass: "text-sm" },
  md: { width: 40, height: 40, wordmarkClass: "text-base" },
  lg: { width: 48, height: 48, wordmarkClass: "text-lg" },
  xl: { width: 48, height: 48, wordmarkClass: "text-2xl" },
};

export function Logo({
  size = "md",
  className = "",
  showWordmark = true,
  wordmarkClassName,
}: {
  size?: LogoSize;
  className?: string;
  showWordmark?: boolean;
  wordmarkClassName?: string;
}) {
  const { width, height, wordmarkClass } = sizeMap[size];
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Image
        src="/logo_bull.png"
        alt="QuantPlay"
        width={width}
        height={height}
        className="h-auto w-auto shrink-0 object-contain"
        priority
      />
      {showWordmark && (
        <span className={`font-bold text-zinc-900 dark:text-white tracking-tight ${wordmarkClass} ${wordmarkClassName ?? ""}`}>
          QuantPlay
        </span>
      )}
    </div>
  );
}

/** Logo image only (no wordmark), for flexible sizing via className */
export function LogoIcon({ className = "" }: { className?: string }) {
  return (
    <Image
      src="/logo_bull.png"
      alt="QuantPlay"
      width={40}
      height={40}
      className={`h-auto w-auto shrink-0 object-contain ${className}`}
      priority
    />
  );
}
