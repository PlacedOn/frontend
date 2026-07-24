"use client";

import { useTransition } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { signOut } from "@/app/login/actions";
import { cn } from "@/lib/cn";

type Props = {
  className?: string;
};

/** Small glass sign-out control — drop it into any signed-in surface. */
export function SignOutButton({ className }: Props) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => signOut())}
      className={cn(
        "inline-flex py-2 items-center gap-1.5 rounded-[var(--r-chip)] border px-3.5 text-[13px] font-semibold text-[var(--ink-2)] transition-colors duration-[var(--d-micro)] hover:text-[var(--ink)]",
        pending ? "cursor-wait opacity-70" : "cursor-pointer",
        className,
      )}
      style={{
        background: "var(--glass-hi)",
        borderColor: "var(--glass-line)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {pending ? (
        <Loader2 size={15} className="animate-spin" aria-hidden="true" />
      ) : (
        <LogOut size={15} aria-hidden="true" />
      )}
      Sign out
    </button>
  );
}
