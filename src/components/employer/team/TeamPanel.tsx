"use client";

/**
 * Team side — the org's people and pending invites. Owners can invite teammates
 * (recruiter / hiring_manager) and revoke; everyone on the team can see the
 * roster. Authorization is enforced by RLS on the backend (migration 0009); the
 * UI just hides owner-only controls. Live backend only — no fake team data.
 */

import { useCallback, useEffect, useState } from "react";
import { UserPlus, ShieldCheck, Copy, Check, X, Loader2 } from "lucide-react";
import {
  v1,
  V1Error,
  isLiveBackend,
  type OrgSummary,
  type OrgMember,
  type OrgInvite,
  type InviteRole,
} from "@/lib/v1";

const ROLE_LABEL: Record<string, string> = {
  owner: "Owner",
  recruiter: "Recruiter",
  hiring_manager: "Hiring manager",
};

function inviteLink(token: string): string {
  const base = typeof window !== "undefined" ? window.location.origin : "";
  return `${base}/employer/join?token=${token}`;
}

export function TeamPanel() {
  const live = isLiveBackend();
  const [org, setOrg] = useState<OrgSummary | null | undefined>(undefined);
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [invites, setInvites] = useState<OrgInvite[]>([]);
  const [error, setError] = useState<{ message: string; status: number } | null>(null);

  const load = useCallback(async () => {
    try {
      const summary = await v1.getOrg();
      setOrg(summary);
      if (summary) {
        const [m, inv] = await Promise.all([v1.listMembers(), v1.listInvites()]);
        setMembers(m);
        setInvites(inv);
      }
    } catch (e) {
      if (e instanceof V1Error) setError({ message: e.message, status: e.status });
      else setError({ message: "Could not load your team.", status: 0 });
      setOrg(null);
    }
  }, []);

  useEffect(() => {
    if (live) void load();
    else setOrg(null);
  }, [live, load]);

  if (!live) {
    return (
      <div className="glass max-w-xl rounded-[var(--r-card)] p-6">
        <p className="text-[14.5px] font-semibold text-[var(--ink)]">Backend not connected</p>
        <p className="mt-1.5 text-[13.5px] text-[var(--ink-2)]">
          Set <code>NEXT_PUBLIC_API_BASE_URL</code> to the live API to manage your team.
        </p>
      </div>
    );
  }

  if (error?.status === 401) {
    return (
      <div className="glass max-w-xl rounded-[var(--r-card)] p-6">
        <p className="text-[14.5px] font-semibold text-[var(--ink)]">Sign in to manage your team.</p>
      </div>
    );
  }

  if (org === undefined) {
    return <div className="glass h-40 max-w-xl animate-pulse rounded-[var(--r-card)]" style={{ opacity: 0.5 }} />;
  }

  if (org === null) return <CreateOrg onCreated={load} />;

  const isOwner = org.my_role === "owner";
  const pending = invites.filter((i) => i.status === "pending");

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Your team</p>
          <h2 className="mt-1 text-[22px] font-bold text-[var(--ink)]">{org.name}</h2>
          <p className="mt-1 text-[13.5px] text-[var(--ink-3)]">
            You&rsquo;re {ROLE_LABEL[org.my_role]} · {org.member_count} {org.member_count === 1 ? "member" : "members"}
          </p>
        </div>
      </header>

      {isOwner && <InviteForm onInvited={(inv) => setInvites((prev) => [inv, ...prev])} />}

      {/* Members */}
      <section>
        <h3 className="text-[13px] font-bold uppercase tracking-wider text-[var(--ink-3)]" style={{ fontFamily: "var(--font-mono)" }}>
          Members
        </h3>
        <ul className="mt-3 flex flex-col gap-2">
          {members.map((m) => (
            <li key={m.profile_id} className="glass flex items-center justify-between rounded-[var(--r-card)] px-4 py-3">
              <span className="font-mono text-[12.5px] text-[var(--ink-2)]">{m.profile_id.slice(0, 8)}…</span>
              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold" style={{ background: "var(--iris-ghost)", color: "var(--iris-ink)" }}>
                {m.role === "owner" && <ShieldCheck size={12} />} {ROLE_LABEL[m.role]}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Pending invites */}
      {pending.length > 0 && (
        <section>
          <h3 className="text-[13px] font-bold uppercase tracking-wider text-[var(--ink-3)]" style={{ fontFamily: "var(--font-mono)" }}>
            Pending invites
          </h3>
          <ul className="mt-3 flex flex-col gap-2">
            {pending.map((inv) => (
              <InviteRow
                key={inv.id}
                inv={inv}
                canRevoke={isOwner}
                onRevoke={async () => {
                  await v1.revokeInvite(inv.id);
                  setInvites((prev) => prev.map((i) => (i.id === inv.id ? { ...i, status: "revoked" } : i)));
                }}
              />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function CreateOrg({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      await v1.createOrg(name.trim() || "My company");
      onCreated();
    } catch (e) {
      setErr(e instanceof V1Error ? e.message : "Could not create your company.");
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="glass max-w-xl rounded-[var(--r-card)] p-6 sm:p-8">
      <h2 className="text-[19px] font-bold text-[var(--ink)]">Create your company</h2>
      <p className="mt-1.5 text-[13.5px] leading-relaxed text-[var(--ink-2)]">
        This creates your workspace and makes you its owner. You can invite teammates next.
      </p>
      <label className="mt-5 block">
        <span className="text-[13px] font-semibold text-[var(--ink-2)]">Company name</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Acme Systems"
          className="mt-1.5 w-full rounded-[var(--r-btn)] border px-4 py-3 text-[15px] outline-none transition-colors focus:border-[var(--iris)]"
          style={{ borderColor: "var(--glass-line-hi)", background: "var(--glass)" }}
        />
      </label>
      {err && <p className="mt-4 text-[13px] font-semibold text-[var(--bad)]">{err}</p>}
      <button
        type="submit"
        disabled={busy}
        className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-[var(--r-btn)] px-6 py-3.5 text-[15px] font-bold text-white disabled:opacity-50"
        style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))", boxShadow: "var(--shadow-iris)" }}
      >
        {busy && <Loader2 size={16} className="animate-spin" />} Create company
      </button>
    </form>
  );
}

function InviteForm({ onInvited }: { onInvited: (inv: OrgInvite) => void }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<InviteRole>("recruiter");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    setErr(null);
    try {
      const inv = await v1.createInvite({ email: email.trim(), role });
      onInvited(inv);
      setEmail("");
    } catch (e) {
      setErr(e instanceof V1Error ? e.message : "Could not send the invite.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="glass rounded-[var(--r-card)] p-5">
      <p className="text-[14px] font-bold text-[var(--ink)]">Invite a teammate</p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="teammate@company.com"
          className="flex-1 rounded-[var(--r-btn)] border px-4 py-2.5 text-[14px] outline-none transition-colors focus:border-[var(--iris)]"
          style={{ borderColor: "var(--glass-line-hi)", background: "var(--glass)" }}
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as InviteRole)}
          className="rounded-[var(--r-btn)] border px-3 py-2.5 text-[14px] outline-none focus:border-[var(--iris)]"
          style={{ borderColor: "var(--glass-line-hi)", background: "var(--glass)" }}
        >
          <option value="recruiter">Recruiter</option>
          <option value="hiring_manager">Hiring manager</option>
        </select>
        <button
          type="submit"
          disabled={busy || !email.trim()}
          className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-[var(--r-btn)] px-4 py-2.5 text-[14px] font-bold text-white disabled:opacity-50"
          style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))", boxShadow: "var(--shadow-iris)" }}
        >
          <UserPlus size={15} /> Invite
        </button>
      </div>
      {err && <p className="mt-2 text-[13px] font-semibold text-[var(--bad)]">{err}</p>}
    </form>
  );
}

function InviteRow({ inv, canRevoke, onRevoke }: { inv: OrgInvite; canRevoke: boolean; onRevoke: () => Promise<void> }) {
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink(inv.token));
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked — no-op */
    }
  };

  return (
    <li className="glass flex flex-wrap items-center justify-between gap-2 rounded-[var(--r-card)] px-4 py-3">
      <div>
        <p className="text-[14px] font-semibold text-[var(--ink)]">{inv.email}</p>
        <p className="text-[12px] text-[var(--ink-3)]">{ROLE_LABEL[inv.role]} · pending</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={copy}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-[var(--r-btn)] border px-3 py-1.5 text-[12.5px] font-semibold text-[var(--ink-2)] transition-colors hover:text-[var(--ink)]"
          style={{ borderColor: "var(--glass-line-hi)", background: "var(--glass-hi)" }}
        >
          {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? "Copied" : "Copy invite link"}
        </button>
        {canRevoke && (
          <button
            type="button"
            onClick={async () => {
              setBusy(true);
              await onRevoke();
              setBusy(false);
            }}
            disabled={busy}
            aria-label="Revoke invite"
            className="grid h-8 w-8 cursor-pointer place-items-center rounded-[var(--r-btn)] border text-[var(--ink-3)] transition-colors hover:text-[var(--bad)] disabled:opacity-50"
            style={{ borderColor: "var(--glass-line-hi)", background: "var(--glass-hi)" }}
          >
            <X size={14} />
          </button>
        )}
      </div>
    </li>
  );
}
