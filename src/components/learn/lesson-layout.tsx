"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface LessonLayoutProps {
  slug: string;
  title: string;
  subtitle: string;
  readTime: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  accentColor: string; // e.g. "emerald", "blue", "violet"
  prevLesson?: { slug: string; title: string };
  nextLesson?: { slug: string; title: string };
  children: React.ReactNode;
}

const ACCENT_MAP: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-500/30", badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  blue: { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", border: "border-blue-500/30", badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  violet: { bg: "bg-violet-500/10", text: "text-violet-600 dark:text-violet-400", border: "border-violet-500/30", badge: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400" },
  amber: { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", border: "border-amber-500/30", badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  rose: { bg: "bg-rose-500/10", text: "text-rose-600 dark:text-rose-400", border: "border-rose-500/30", badge: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" },
  cyan: { bg: "bg-cyan-500/10", text: "text-cyan-600 dark:text-cyan-400", border: "border-cyan-500/30", badge: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400" },
};

const DIFFICULTY_STYLES = {
  Beginner: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Intermediate: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Advanced: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

export function LessonLayout({ slug, title, subtitle, readTime, difficulty, accentColor, prevLesson, nextLesson, children }: LessonLayoutProps) {
  const [completed, setCompleted] = useState(false);
  const accent = ACCENT_MAP[accentColor] ?? ACCENT_MAP.emerald;

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("qp_learn_completed") || "[]") as string[];
      setCompleted(saved.includes(slug));
    } catch { /* ignore */ }
  }, [slug]);

  const toggleComplete = useCallback(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("qp_learn_completed") || "[]") as string[];
      let updated: string[];
      if (saved.includes(slug)) {
        updated = saved.filter((s: string) => s !== slug);
      } else {
        updated = [...saved, slug];
      }
      localStorage.setItem("qp_learn_completed", JSON.stringify(updated));
      setCompleted(!completed);
    } catch { /* ignore */ }
  }, [slug, completed]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Back + breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/learn" className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Learn
        </Link>
        <span className="text-zinc-300 dark:text-zinc-600">/</span>
        <span className="font-medium text-zinc-700 dark:text-zinc-300">{title}</span>
      </div>

      {/* Header */}
      <div className={`rounded-2xl border ${accent.border} ${accent.bg} p-6`}>
        <div className="flex items-center gap-2 mb-2">
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${DIFFICULTY_STYLES[difficulty]}`}>{difficulty}</span>
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500">{readTime} read</span>
        </div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">{title}</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{subtitle}</p>
      </div>

      {/* Content */}
      <div className="lesson-content space-y-6">
        {children}
      </div>

      {/* Mark complete */}
      <div className="flex items-center justify-center pt-4 pb-2">
        <button
          type="button"
          onClick={toggleComplete}
          className={`flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all ${
            completed
              ? "bg-emerald-600 text-white hover:bg-emerald-700"
              : "border-2 border-dashed border-zinc-300 text-zinc-500 hover:border-emerald-400 hover:text-emerald-600 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-emerald-600 dark:hover:text-emerald-400"
          }`}
        >
          {completed ? (
            <>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
              </svg>
              Completed!
            </>
          ) : (
            <>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              Mark as Complete
            </>
          )}
        </button>
      </div>

      {/* Prev / Next navigation */}
      <div className="flex items-center justify-between border-t border-zinc-200 pt-5 dark:border-zinc-800">
        {prevLesson ? (
          <Link href={`/learn/${prevLesson.slug}`} className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
            {prevLesson.title}
          </Link>
        ) : <div />}
        {nextLesson ? (
          <Link href={`/learn/${nextLesson.slug}`} className="flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition">
            {nextLesson.title}
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        ) : (
          <Link href="/learn" className="flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 transition">
            Back to Academy
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        )}
      </div>
    </div>
  );
}

/* Reusable building blocks for lesson content */

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-3">{title}</h2>
      {children}
    </section>
  );
}

export function InfoCard({ type = "tip", title, children }: { type?: "tip" | "warning" | "info" | "key"; title?: string; children: React.ReactNode }) {
  const styles = {
    tip: { border: "border-l-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/20", icon: "💡", label: "Pro Tip" },
    warning: { border: "border-l-amber-500", bg: "bg-amber-50 dark:bg-amber-950/20", icon: "⚠️", label: "Watch Out" },
    info: { border: "border-l-blue-500", bg: "bg-blue-50 dark:bg-blue-950/20", icon: "ℹ️", label: "Did You Know?" },
    key: { border: "border-l-violet-500", bg: "bg-violet-50 dark:bg-violet-950/20", icon: "🔑", label: "Key Concept" },
  };
  const s = styles[type];

  return (
    <div className={`rounded-xl border-l-4 ${s.border} ${s.bg} p-4`}>
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-sm">{s.icon}</span>
        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{title ?? s.label}</span>
      </div>
      <div className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{children}</div>
    </div>
  );
}

export function Term({ word, children }: { word: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-200/60 bg-white p-4 dark:border-zinc-800/60 dark:bg-zinc-900">
      <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-1">{word}</h3>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{children}</p>
    </div>
  );
}

export function Paragraph({ children }: { children: React.ReactNode }) {
  return <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{children}</p>;
}

export function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5 text-sm text-zinc-600 dark:text-zinc-400">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2">
          <svg className="mt-1 h-3 w-3 shrink-0 text-emerald-500" viewBox="0 0 12 12" fill="currentColor">
            <circle cx="6" cy="6" r="3" />
          </svg>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function ComparisonTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200/60 dark:border-zinc-800/60">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-zinc-50 dark:bg-zinc-900">
            {headers.map((h, i) => (
              <th key={i} className="whitespace-nowrap px-4 py-2.5 text-left font-semibold text-zinc-700 dark:text-zinc-300">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {rows.map((row, ri) => (
            <tr key={ri} className="bg-white dark:bg-zinc-950">
              {row.map((cell, ci) => (
                <td key={ci} className="whitespace-nowrap px-4 py-2.5 text-zinc-600 dark:text-zinc-400">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CTAButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95"
    >
      {children}
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
      </svg>
    </Link>
  );
}
