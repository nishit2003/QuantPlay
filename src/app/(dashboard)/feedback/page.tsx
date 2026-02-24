"use client";

import { useState, useRef } from "react";

const CATEGORIES = [
  { value: "bug", label: "🐛 Bug Report", color: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800" },
  { value: "feature", label: "💡 Feature", color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800" },
  { value: "general", label: "💬 General", color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800" },
];

export default function FeedbackPage() {
  const [category, setCategory] = useState("general");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState<{ name: string; base64: string; preview: string } | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorText, setErrorText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File | undefined) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrorText("File must be under 5 MB.");
      setStatus("error");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setErrorText("Only image files are supported.");
      setStatus("error");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      setAttachment({ name: file.name, base64, preview: reader.result as string });
      setStatus("idle");
      setErrorText("");
    };
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    handleFile(e.dataTransfer.files[0]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() || message.trim().length < 10) {
      setStatus("error");
      setErrorText("Please enter at least 10 characters.");
      return;
    }
    setStatus("sending");
    setErrorText("");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          subject: subject.trim() || "Suggestion",
          message: message.trim(),
          attachment: attachment ? { name: attachment.name, base64: attachment.base64 } : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setErrorText(data.error || "Something went wrong.");
        return;
      }
      setStatus("success");
      setSubject("");
      setMessage("");
      setAttachment(null);
      setCategory("general");
    } catch {
      setStatus("error");
      setErrorText("Failed to send. Check your connection.");
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Feedback & Suggestions</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          QuantPlay is in development. Your ideas and bug reports are sent directly to the team.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 space-y-5">
        {/* Category picker - segmented pills */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Category</label>
          <div className="flex gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={`flex-1 rounded-xl border px-3 py-2 text-xs font-semibold transition touch-manipulation ${
                  category === cat.value
                    ? cat.color
                    : "border-zinc-200 text-zinc-500 hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            Subject (optional)
          </label>
          <input
            id="subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Add dark mode to charts"
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            Message *
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe your suggestion, bug, or feedback..."
            rows={5}
            required
            minLength={10}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white resize-y"
          />
          <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">At least 10 characters. If you&apos;re logged in, your account email may be included so we can follow up.</p>
        </div>

        {/* Attachment upload */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            Screenshot (optional)
          </label>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />

          {attachment ? (
            <div className="relative rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800/50">
              <div className="flex items-center gap-3">
                <img src={attachment.preview} alt="Preview" className="h-16 w-16 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-700 dark:text-zinc-300">{attachment.name}</p>
                  <p className="text-xs text-zinc-400">Click × to remove</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachment(null)}
                  className="shrink-0 rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 transition touch-manipulation"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 px-6 py-8 text-center transition hover:border-emerald-300 hover:bg-emerald-50/30 dark:border-zinc-700 dark:bg-zinc-800/30 dark:hover:border-emerald-700 dark:hover:bg-emerald-900/10 touch-manipulation"
            >
              <svg className="mb-2 h-8 w-8 text-zinc-300 dark:text-zinc-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
              </svg>
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Tap to upload or drag & drop
              </p>
              <p className="mt-0.5 text-[10px] text-zinc-400 dark:text-zinc-500">
                PNG, JPG up to 5 MB
              </p>
            </div>
          )}
        </div>

        {status === "error" && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
            {errorText}
          </div>
        )}

        {status === "success" && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400">
            Thanks! Your feedback was sent. We&apos;ll read it soon. 🎉
          </div>
        )}

        <button
          type="submit"
          disabled={status === "sending"}
          className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === "sending" ? "Sending…" : "Send feedback"}
        </button>
      </form>
    </div>
  );
}
