"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, FileText, Type, Trash2, EyeOff, ArrowRight, LogIn } from "lucide-react";
import { v1, V1Error, isLiveBackend } from "@/lib/v1";
import { markInterviewInProgress } from "@/lib/interview/resume";
import { useAuth } from "@/components/auth/AuthProvider";

/**
 * Pre-interview consent gate. Nothing starts until the candidate explicitly agrees.
 * On accept we create a real interview_session + an append-only interview_consent
 * record (RLS: candidate-owned), then hand off to the interview runtime with the
 * session id. When the backend isn't connected we say so honestly and still let
 * the candidate into the demo interview — we never fake a stored consent.
 */
const TERMS = [
  { icon: FileText, title: "What's recorded", body: "Only your typed (or spoken-then-transcribed) answers. They stay in your account." },
  { icon: Type, title: "Assessed as text — always", body: "If you speak, we transcribe to text and assess the words only. We never score accent, tone, speed, or filler." },
  { icon: EyeOff, title: "Nothing shared by default", body: "Your evidence stays private until you review it and approve what employers can see." },
  { icon: Trash2, title: "Audio is never stored", body: "Voice frames stream to transcription and are dropped. You can switch to text at any moment." },
] as const;

const DEFAULT_ROLE_FAMILY = "junior_backend";

export function ConsentGate({
  roleFamily = DEFAULT_ROLE_FAMILY,
  jobId = null,
}: {
  roleFamily?: string;
  jobId?: string | null;
}) {
  const router = useRouter();
  const live = isLiveBackend();
  const { user, loading: authLoading } = useAuth();
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Where to come back to after signing in — this exact consent screen, with role/job.
  const params = new URLSearchParams();
  if (roleFamily && roleFamily !== DEFAULT_ROLE_FAMILY) params.set("role", roleFamily);
  if (jobId) params.set("job", jobId);
  const returnTo = `/interview/consent${params.toString() ? `?${params}` : ""}`;
  const toLogin = () => router.push(`/login?next=${encodeURIComponent(returnTo)}`);
  const needsAuth = live && !authLoading && !user;

  const begin = async () => {
    if (!agreed) return;
    if (!live) {
      router.push("/interview"); // demo runtime; no consent is stored
      return;
    }
    // Not signed in? Send them to sign in and back here — never a dead-end.
    if (!user) {
      toLogin();
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const session = await v1.createInterview({
        role_family: roleFamily,
        job_id: jobId,
        mode_default: "text",
        consent: { kind: "interview", audio_retention: "none" },
      });
      markInterviewInProgress(session.id, roleFamily); // enable "resume where you left off"
      router.push(`/interview?session=${session.id}`);
    } catch (err) {
      // A stale/expired session lands here too — route to sign in, don't dead-end.
      if (err instanceof V1Error && err.status === 401) {
        toLogin();
        return;
      }
      setError(err instanceof V1Error ? err.message : "Could not start the interview.");
      setBusy(false);
    }
  };

  return (
    <section aria-labelledby="consent-heading" className="glass mx-auto max-w-2xl rounded-[var(--r-card)] p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-full" style={{ background: "var(--iris-ghost)", color: "var(--iris-ink)" }}>
          <ShieldCheck size={20} />
        </span>
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-wide text-[var(--ink-3)]">Your consent, not fine print</p>
          <h1 id="consent-heading" className="text-[22px] font-bold tracking-[-0.01em]">Before we begin</h1>
        </div>
      </div>

      <ul className="mt-6 space-y-4">
        {TERMS.map(({ icon: Icon, title, body }) => (
          <li key={title} className="flex gap-3">
            <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-[10px] border" style={{ borderColor: "var(--glass-line)", color: "var(--iris-ink)" }}>
              <Icon size={16} />
            </span>
            <div>
              <p className="text-[14.5px] font-semibold">{title}</p>
              <p className="text-[13.5px] leading-relaxed text-[var(--ink-2)]">{body}</p>
            </div>
          </li>
        ))}
      </ul>

      {!live && (
        <p className="mt-6 rounded-[var(--r-btn)] px-4 py-3 text-[13px] leading-relaxed" style={{ background: "var(--iris-ghost)", color: "var(--iris-ink)" }}>
          Backend not connected — this runs the demo interview and does not store a consent record. Set <code>NEXT_PUBLIC_API_BASE_URL</code> to record real consent.
        </p>
      )}

      <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-[var(--r-btn)] border p-4" style={{ borderColor: agreed ? "var(--iris)" : "var(--glass-line-hi)" }}>
        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[var(--iris)]" />
        <span className="text-[14px] leading-relaxed">
          I understand what's recorded and how it's assessed, and I consent to this interview under policy <span className="font-semibold">{CONSENT_LABEL}</span>.
        </span>
      </label>

      {needsAuth && (
        <p className="mt-6 flex items-start gap-2 rounded-[var(--r-btn)] px-4 py-3 text-[13px] leading-relaxed" style={{ background: "var(--iris-ghost)", color: "var(--iris-ink)" }}>
          <LogIn size={15} className="mt-0.5 shrink-0" />
          You&rsquo;ll sign in first so your evidence saves to your account — it takes a moment, and we bring you right back here.
        </p>
      )}

      {error && <p className="mt-4 text-[13px] font-semibold text-[#b91c1c]">{error}</p>}

      <button
        type="button"
        onClick={begin}
        disabled={!agreed || busy || authLoading}
        className="mt-6 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-[var(--r-btn)] px-6 py-4 text-[15px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
        style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))", boxShadow: "var(--shadow-iris)" }}
      >
        {busy ? (
          "Starting…"
        ) : needsAuth ? (
          <>
            <LogIn size={16} /> Sign in to start
          </>
        ) : (
          <>
            I agree — start my interview <ArrowRight size={16} />
          </>
        )}
      </button>
    </section>
  );
}

// Human-readable label for the pinned consent policy version.
const CONSENT_LABEL = "2026-07-15.v1";
