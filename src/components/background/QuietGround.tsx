/**
 * The page ground. Replaces SignalField's animated constellation.
 *
 * What it replaced and why: a canvas of drifting nodes joined by lines, over a
 * blurred five-stop wash. Two problems. The lines read as a decorative tech
 * motif that says nothing about hiring — motion should tell you where something
 * came from or what changed, and drifting dots do neither. And it sat behind
 * every section of every page, so it competed with the content on top of it
 * rather than supporting it.
 *
 * What this is instead: two very soft radial washes, off-white into white, at
 * low opacity. It gives the page a centre of light so the hero copy sits in the
 * brightest part of the frame, and gets out of the way everywhere else. Closer
 * to how the reference sites handle a light ground — the page feels considered
 * rather than decorated.
 *
 * Deliberately a Server Component with no canvas, no rAF and no motion. There is
 * nothing here to animate: a static ground cannot judder on scroll, cannot cost
 * a frame, and needs no `prefers-reduced-motion` branch because it never moved.
 * It also removes a full-screen canvas from every page's paint path.
 */
export function QuietGround() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0"
      style={{
        zIndex: 0,
        background: [
          // Warm centre-left, where the headline sits.
          "radial-gradient(58% 44% at 38% 32%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 70%)",
          // Cool lift bottom-right, so the field is not perfectly flat.
          "radial-gradient(46% 40% at 82% 78%, rgba(248,247,252,0.85) 0%, rgba(248,247,252,0) 72%)",
          // The ground itself. Near-white, not white — a flat #FFF under white
          // cards makes the cards disappear.
          "linear-gradient(180deg, #FCFCFD 0%, #FAFAFB 100%)",
        ].join(", "),
      }}
    />
  );
}
