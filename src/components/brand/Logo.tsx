import { cn } from "@/lib/cn";

type Props = {
  size?: number;
  showWordmark?: boolean;
  className?: string;
};

// Native artwork bounds of the mark (viewBox 133 119 354 400).
const MARK_ASPECT = 354 / 400;

/**
 * Placedon brand mark: the geometric "P" built from two facing blocks with a
 * bookmark/star notch. Glyph tracks var(--iris) so it follows the brand token.
 * Gentle scale on hover of the enclosing link; no reinvented artwork.
 */
export function Logo({ size = 34, showWordmark = true, className }: Props) {
  return (
    <span className={cn("group inline-flex items-center gap-2.5", className)}>
      <svg
        width={Math.round(size * MARK_ASPECT)}
        height={size}
        viewBox="133 119 354 400"
        fill="var(--iris)"
        className="transition-transform duration-300 ease-out group-hover:scale-105"
        aria-hidden="true"
      >
        <path d="M468 140 L152 142 L196 264 L259 264 L259 219 L269 208 L351 208 L361 218 L361 264 L425 264 Z" />
        <path d="M152 424 L258 497 L261 425 L468 425 L425 301 L361 301 L360 367 L310 336 L261 368 L259 301 L196 301 Z" />
      </svg>

      {showWordmark && (
        // `currentColor` rather than a hardcoded --ink: the mark now appears on
        // both the light page and the dark hero, and an inline colour here beat
        // every override the parent could apply. The parent sets the tone.
        <span
          className="text-[19px] font-bold tracking-tight text-[currentColor]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Placed<span className="grad-iris">on</span>
        </span>
      )}
    </span>
  );
}
