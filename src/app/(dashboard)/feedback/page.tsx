"use client";

import { useState } from "react";

export default function FeedbackPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorText, setErrorText] = useState("");

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
        body: JSON.stringify({ subject: subject.trim() || "Suggestion", message: message.trim() }),
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
          <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">At least 10 characters. If you’re logged in, your account email may be included so we can follow up.</p>
        </div>

        {status === "error" && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
            {errorText}
          </div>
        )}

        {status === "success" && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400">
            Thanks! Your feedback was sent. We’ll read it soon.
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
