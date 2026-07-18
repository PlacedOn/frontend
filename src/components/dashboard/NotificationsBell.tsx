"use client";

/**
 * Notifications bell for the dashboard shell — a small activity feed of the
 * interactions that matter (intro requests/responses, evidence ready to review).
 * Unread is tracked client-side against a last-seen timestamp; opening the feed
 * marks it seen. Live backend only; nothing here is a score.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, MessageSquare, FileCheck2, Dot } from "lucide-react";
import { v1, isLiveBackend, type Notification } from "@/lib/v1";

const SEEN_KEY = "placedon:notifications:seen";
const ICON = { intro: MessageSquare, evidence: FileCheck2, system: Dot } as const;

function timeAgo(iso: string): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "";
  const s = Math.max(0, (Date.now() - t) / 1000);
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

export function NotificationsBell() {
  const [items, setItems] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [seenAt, setSeenAt] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setSeenAt(Number(localStorage.getItem(SEEN_KEY) || 0));
    if (!isLiveBackend()) return;
    let active = true;
    v1.notifications().then((n) => active && setItems(n)).catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const unread = items.filter((n) => Date.parse(n.created_at) > seenAt).length;

  const toggle = () => {
    if (!open) {
      const now = Date.now();
      localStorage.setItem(SEEN_KEY, String(now));
      setSeenAt(now);
    }
    setOpen((v) => !v);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-label="Notifications"
        className="relative grid h-9 w-9 place-items-center rounded-[var(--r-btn)] border text-[var(--ink-3)] transition-colors hover:text-[var(--ink)]"
        style={{ borderColor: "var(--glass-line)", background: "var(--glass-hi)" }}
      >
        <Bell size={16} />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full px-1 text-[10px] font-bold text-white" style={{ background: "var(--iris)" }}>
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-[var(--z-drawer)] w-72 rounded-[var(--r-card)] p-2 shadow-[var(--shadow-md)]" style={{ background: "var(--glass-hi)", border: "1px solid var(--glass-line)", backdropFilter: "blur(12px)" }}>
          <p className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-[var(--ink-3)]">Activity</p>
          {items.length === 0 ? (
            <p className="px-2 py-6 text-center text-[12.5px] text-[var(--ink-3)]">Nothing new yet.</p>
          ) : (
            <ul className="max-h-[60vh] overflow-y-auto">
              {items.slice(0, 12).map((n, i) => {
                const Icon = ICON[n.kind] ?? Dot;
                return (
                  <li key={i}>
                    <Link href={n.href} onClick={() => setOpen(false)} className="flex gap-2.5 rounded-[var(--r-btn)] p-2 transition-colors hover:bg-[var(--glass)]">
                      <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full text-[var(--iris-ink)]" style={{ background: "var(--iris-ghost)" }}>
                        <Icon size={14} />
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate text-[13px] font-semibold text-[var(--ink)]">{n.title}</span>
                          <span className="shrink-0 text-[11px] text-[var(--ink-3)]">{timeAgo(n.created_at)}</span>
                        </span>
                        {n.detail && <span className="mt-0.5 block text-[12px] leading-snug text-[var(--ink-3)]">{n.detail}</span>}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
