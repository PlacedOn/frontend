"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X, Check, Loader2 } from "lucide-react";
import { requestDemo } from "@/lib/api";
import type { DemoRequest } from "@/lib/types";

type Audience = DemoRequest["audience"];

type DemoDialogContextValue = {
  open: (audience?: Audience) => void;
  close: () => void;
};

const DemoDialogContext = createContext<DemoDialogContextValue | null>(null);

export function useDemoDialog(): DemoDialogContextValue {
  const ctx = useContext(DemoDialogContext);
  if (!ctx) throw new Error("useDemoDialog must be used within DemoDialogProvider");
  return ctx;
}

type Status = "idle" | "submitting" | "done" | "error";

export function DemoDialogProvider({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const [isOpen, setIsOpen] = useState(false);
  const [audience, setAudience] = useState<Audience>("employer");
  const [status, setStatus] = useState<Status>("idle");
  const firstFieldRef = useRef<HTMLInputElement>(null);

  const open = useCallback((who: Audience = "employer") => {
    setAudience(who);
    setStatus("idle");
    setIsOpen(true);
  }, []);
  const close = useCallback(() => setIsOpen(false), []);

  // Esc to close + body scroll lock while open
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const id = window.setTimeout(() => firstFieldRef.current?.focus(), 60);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      window.clearTimeout(id);
    };
  }, [isOpen, close]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload: DemoRequest = {
      name: String(form.get("name") ?? "").trim(),
      workEmail: String(form.get("workEmail") ?? "").trim(),
      company: String(form.get("company") ?? "").trim(),
      audience,
      message: String(form.get("message") ?? "").trim() || undefined,
    };
    setStatus("submitting");
    try {
      await requestDemo(payload);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  return (
    <DemoDialogContext.Provider value={{ open, close }}>
      {children}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 grid place-items-center p-4"
            style={{ zIndex: 60 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              aria-label="Close dialog"
              onClick={close}
              className="absolute inset-0 cursor-default"
              style={{ background: "rgba(14,16,32,0.42)", backdropFilter: "blur(6px)" }}
              tabIndex={-1}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="demo-title"
              className="glass relative w-full max-w-[440px] rounded-[var(--r-card)] p-7"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.26, ease: [0.22, 0.68, 0.31, 1] }}
            >
              <button
                onClick={close}
                aria-label="Close"
                className="absolute right-4 top-4 grid h-8 w-8 cursor-pointer place-items-center rounded-full text-[var(--ink-3)] transition-colors hover:bg-white/70 hover:text-[var(--ink)]"
              >
                <X size={17} />
              </button>

              {status === "done" ? (
                <div className="py-6 text-center">
                  <span
                    className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full"
                    style={{ background: "var(--iris)", color: "#fff" }}
                  >
                    <Check size={22} strokeWidth={3} />
                  </span>
                  <h2 id="demo-title" className="text-[1.4rem]">You&rsquo;re on the list.</h2>
                  <p className="mt-2 text-[14.5px] text-[var(--ink-2)]">
                    We&rsquo;ll reach out within one business day to set up your PlacedOn walkthrough.
                  </p>
                  <button
                    onClick={close}
                    className="mt-6 cursor-pointer rounded-[var(--r-btn)] px-5 py-2.5 text-[14px] font-semibold text-white"
                    style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))" }}
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  <p className="eyebrow">Book a demo</p>
                  <h2 id="demo-title" className="mt-2 text-[1.5rem]">
                    See PlacedOn on your roles.
                  </h2>

                  <div
                    className="mt-5 grid grid-cols-2 gap-1.5 rounded-full p-1"
                    style={{ background: "var(--mist)" }}
                    role="tablist"
                    aria-label="I am a"
                  >
                    {(["employer", "candidate"] as Audience[]).map((a) => (
                      <button
                        key={a}
                        type="button"
                        role="tab"
                        aria-selected={audience === a}
                        onClick={() => setAudience(a)}
                        className="cursor-pointer rounded-full py-2 text-[13.5px] font-semibold transition-colors"
                        style={
                          audience === a
                            ? { background: "#fff", color: "var(--ink)", boxShadow: "var(--shadow-sm)" }
                            : { color: "var(--ink-2)" }
                        }
                      >
                        {a === "employer" ? "I'm hiring" : "I'm a candidate"}
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3.5">
                    <Field label="Full name" name="name" ref={firstFieldRef} required autoComplete="name" />
                    <Field label="Work email" name="workEmail" type="email" required autoComplete="email" />
                    <Field label="Company" name="company" required autoComplete="organization" />
                    <label className="flex flex-col gap-1.5">
                      <span className="text-[12.5px] font-medium text-[var(--ink-2)]">Anything specific? (optional)</span>
                      <textarea
                        name="message"
                        rows={2}
                        className="resize-none rounded-xl border px-3.5 py-2.5 text-[14px] text-[var(--ink)] outline-none transition-colors focus:border-[var(--iris)]"
                        style={{ borderColor: "var(--glass-line-hi)", background: "rgba(255,255,255,.7)" }}
                      />
                    </label>

                    {status === "error" && (
                      <p className="text-[13px]" style={{ color: "var(--danger)" }}>
                        Something went wrong. Please try again.
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={status === "submitting"}
                      className="mt-1 inline-flex cursor-pointer items-center justify-center gap-2 rounded-[var(--r-btn)] py-3 text-[15px] font-semibold text-white disabled:opacity-60"
                      style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))", boxShadow: "var(--shadow-iris)" }}
                    >
                      {status === "submitting" ? (
                        <>
                          <Loader2 size={16} className="animate-spin" /> Sending&hellip;
                        </>
                      ) : (
                        "Request my walkthrough"
                      )}
                    </button>
                    <p className="text-center text-[12px] text-[var(--ink-3)]">
                      No spam. We only use this to schedule your demo.
                    </p>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DemoDialogContext.Provider>
  );
}

type FieldProps = {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  ref?: React.Ref<HTMLInputElement>;
};

function Field({ label, name, type = "text", required, autoComplete, ref }: FieldProps) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12.5px] font-medium text-[var(--ink-2)]">{label}</span>
      <input
        ref={ref}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        className="rounded-xl border px-3.5 py-2.5 text-[14px] text-[var(--ink)] outline-none transition-colors focus:border-[var(--iris)]"
        style={{ borderColor: "var(--glass-line-hi)", background: "rgba(255,255,255,.7)" }}
      />
    </label>
  );
}
