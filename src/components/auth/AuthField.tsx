"use client";

import { useState } from "react";
import { AlertCircle, Eye, EyeOff, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

type Props = {
  id: string;
  name: string;
  label: string;
  icon: LucideIcon;
  type?: "text" | "email" | "password";
  autoComplete?: string;
  placeholder?: string;
  error?: string;
  onValueChange?: () => void;
};

/**
 * Icon-prefixed glass input. Focus wakes the field up: the leading icon
 * turns iris, the border deepens, and a soft glow ring blooms outward.
 * Password fields get a show/hide toggle; errors read inline via
 * aria-describedby.
 */
export function AuthField({
  id,
  name,
  label,
  icon: Icon,
  type = "text",
  autoComplete,
  placeholder,
  error,
  onValueChange,
}: Props) {
  const [revealed, setRevealed] = useState(false);
  const [focused, setFocused] = useState(false);
  const isPassword = type === "password";
  const errorId = `${id}-error`;

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-semibold tracking-[0.01em] text-[var(--ink-2)]">
        {label}
      </label>
      <div className="relative">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 grid w-11 place-items-center transition-colors duration-[var(--d-micro)]"
          style={{
            color: error ? "var(--danger)" : focused ? "var(--iris)" : "var(--ink-3)",
          }}
        >
          <Icon size={17} />
        </span>
        <input
          id={id}
          name={name}
          type={isPassword && revealed ? "text" : type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          onChange={onValueChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={cn(
            "h-12 w-full rounded-[var(--r-btn)] border pl-11 text-[15px] text-[var(--ink)] placeholder:text-[var(--ink-3)] transition-[border-color,box-shadow,background-color] duration-[var(--d-micro)]",
            isPassword ? "pr-12" : "pr-4",
          )}
          style={{
            outline: "none",
            background: focused ? "rgba(255,255,255,0.94)" : "rgba(255,255,255,0.72)",
            borderColor: error ? "var(--danger)" : focused ? "var(--iris)" : "var(--glass-line-hi)",
            boxShadow: focused
              ? "0 0 0 4px var(--iris-ghost), 0 12px 28px -14px rgba(115, 54, 255, 0.45)"
              : error
                ? "0 0 0 4px rgba(229, 72, 77, 0.08), var(--shadow-sm)"
                : "var(--shadow-sm)",
          }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            aria-label={revealed ? "Hide password" : "Show password"}
            aria-pressed={revealed}
            className="absolute inset-y-0 right-0 grid w-12 place-items-center rounded-[var(--r-btn)] text-[var(--ink-3)] transition-colors duration-[var(--d-micro)] hover:text-[var(--iris-ink)]"
          >
            {revealed ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && (
        <p
          id={errorId}
          className="flex items-center gap-1.5 text-[13px] font-medium"
          style={{ color: "var(--danger)" }}
        >
          <AlertCircle size={13.5} className="shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}
