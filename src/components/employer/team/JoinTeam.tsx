"use client";

/**
 * Accept a teammate invite. The token comes from the invite link
 * (/employer/join?token=…). The backend accept_invite RPC verifies the
 * signed-in user's email matches the invite before seating them — the token
 * alone is not enough, so a forwarded link can't be redeemed by the wrong person.
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, CircleCheck, Loader2 } from "lucide-react";
import { v1, V1Error, isLiveBackend, type OrgSummary } from "@/lib/v1";

type State =
  | { kind: "idle" }
  | { kind: "working" }
  | { kind: "done"; org: OrgSummary }
  | { kind: "error"; message: string; status: number };

export function JoinTeam() {
  const token = useSearchParams().get("token") ?? "";
  const [state, setState] = useState<State>({ kind: "idle" });

  const accept = useCallback(async () => {
    setState({ kind: "working" });
    try {
      const org = await v1.acceptInvite(token);
      setState({ kind: "done", org });
    } catch (e) {
      if (e instanceof V1Error) setState({ kind: "error", message: e.message, status: e.status });
      else setState({ kind: "error", message: "Could not accept the invite.", status: 0 });
    }
  }, [token]);

  // Auto-attempt once when signed in and a token is present.
  useEffect(() => {
    if (isLiveBackend() && token) void accept();
  }, [token, accept]);

  if (!token) {
    return (
      <div className="glass max-w-xl rounded-[var(--r-card)] p-6">
        <p className="text-[14.5px] font-semibold text-[var(--ink)]">This invite link is missing its token.</p>
        <p className="mt-1.5 text-[13.5px] text-[var(--ink-2)]">Ask whoever invited you to resend the link.</p>
      </div>
    );
  }

  if (!isLiveBackend()) {
    return (
      <div className="glass max-w-xl rounded-[var(--r-card)] p-6">
        <p className="text-[14.5px] font-semibold text-[var(--ink)]">Backend not connected</p>
        <p className="mt-1.5 text-[13.5px] text-[var(--ink-2)]">
          Set <code>NEXT_PUBLIC_API_BASE_URL</code> to the live API to accept invites.
        </p>
      </div>
    );
  }

  if (state.kind === "done") {
    return (
      <div className="glass max-w-xl rounded-[var(--r-card)] p-6">
        <p className="inline-flex items-center gap-2 text-[15px] font-bold text-[var(--ink)]">
          <CircleCheck size={18} className="text-[#047857]" /> You&rsquo;ve joined {state.org.name}.
        </p>
        <p className="mt-1.5 text-[13.5px] text-[var(--ink-2)]">You&rsquo;re now a {state.org.my_role.replace("_", " ")}.</p>
        <Link
          href="/employer"
          className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-[var(--r-btn)] px-5 py-2.5 text-[14px] font-bold text-white"
          style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))", boxShadow: "var(--shadow-iris)" }}
        >
          Go to the dashboard <ArrowRight size={15} />
        </Link>
      </div>
    );
  }

  if (state.kind === "error") {
    return (
      <div className="glass max-w-xl rounded-[var(--r-card)] p-6">
        <p className="text-[14.5px] font-semibold text-[var(--ink)]">
          {state.status === 401 ? "Sign in to accept this invite." : "Couldn't accept this invite."}
        </p>
        <p className="mt-1.5 text-[13.5px] text-[var(--ink-2)]">{state.message}</p>
        {state.status === 401 ? (
          <Link
            href="/login"
            className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-[var(--r-btn)] px-5 py-2.5 text-[14px] font-bold text-white"
            style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))", boxShadow: "var(--shadow-iris)" }}
          >
            Sign in <ArrowRight size={15} />
          </Link>
        ) : (
          <button
            type="button"
            onClick={accept}
            className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-[var(--r-btn)] border px-5 py-2.5 text-[14px] font-bold text-[var(--ink)]"
            style={{ borderColor: "var(--glass-line-hi)", background: "var(--glass-hi)" }}
          >
            Try again
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="glass inline-flex max-w-xl items-center gap-2 rounded-[var(--r-card)] p-6">
      <Loader2 size={18} className="animate-spin text-[var(--iris-ink)]" />
      <span className="text-[14.5px] font-semibold text-[var(--ink)]">Accepting your invite…</span>
    </div>
  );
}
