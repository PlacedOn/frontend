"use client";

import { useTransition } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { signOut } from "@/app/login/actions";
import { cn } from "@/lib/cn";

type Props = {
  className?: string;
  iconOnly?: boolean;
};

/** Small glass sign-out control — drop it into any signed-in surface. */
export function SignOutButton({ className, iconOnly = false }: Props) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      title="Sign out"
      onClick={() => startTransition(() => signOut())}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-[var(--r-chip)] border text-[13px] font-semibold text-[var(--ink-2)] transition-colors duration-[var(--d-micro)] hover:text-[var(--ink)]",
        iconOnly ? "h-9 w-9 p-0 shrink-0" : "px-3.5 py-2",
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
      {!iconOnly && "Sign out"}
    </button>
  );
}
