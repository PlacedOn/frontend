"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/cn";

type Props = {
  id: string;
  name: string;
  label: string;
  type?: "text" | "email" | "password";
  autoComplete?: string;
  placeholder?: string;
  error?: string;
  onValueChange?: () => void;
};

/** Labelled glass input with inline error; password fields get a show/hide toggle. */
export function AuthField({
  id,
  name,
  label,
  type = "text",
  autoComplete,
  placeholder,
  error,
  onValueChange,
}: Props) {
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === "password";
  const errorId = `${id}-error`;

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-semibold text-[var(--ink-2)]">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={isPassword && revealed ? "text" : type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          onChange={onValueChange}
          className={cn(
            "h-12 w-full rounded-[var(--r-btn)] border bg-white/75 px-4 text-[15px] text-[var(--ink)] placeholder:text-[var(--ink-3)] transition-colors duration-[var(--d-micro)]",
            isPassword && "pr-12",
          )}
          style={{
            borderColor: error ? "var(--danger)" : "var(--glass-line-hi)",
            boxShadow: "var(--shadow-sm)",
          }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            aria-label={revealed ? "Hide password" : "Show password"}
            aria-pressed={revealed}
            className="absolute inset-y-0 right-0 grid w-12 place-items-center rounded-[var(--r-btn)] text-[var(--ink-3)] transition-colors duration-[var(--d-micro)] hover:text-[var(--ink)]"
          >
            {revealed ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && (
        <p id={errorId} className="text-[13px] font-medium" style={{ color: "var(--danger)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
