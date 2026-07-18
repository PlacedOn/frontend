"use client";

/**
 * The "show your work" whiteboard — the candidate solves visibly, and we capture
 * only what they PRODUCE: how many strokes, how many revisions. That process is
 * the fair, surveillance-free input to anti-cheat-by-design (app.process_evidence
 * on the backend) — no camera, no gaze, no keystroke policing. It's optional and
 * candidate-controlled; nobody is watched.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Pen, Eraser, Undo2, Trash2 } from "lucide-react";
import type { WhiteboardEvidence } from "@/lib/interview";

type Tool = "pen" | "eraser";

export function Whiteboard({ onEvidence }: { onEvidence?: (e: WhiteboardEvidence) => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const drawing = useRef(false);
  const undoStack = useRef<ImageData[]>([]);
  const [tool, setTool] = useState<Tool>("pen");
  const [strokes, setStrokes] = useState(0);
  const [revisions, setRevisions] = useState(0);

  useEffect(() => onEvidence?.({ whiteboard_strokes: strokes, revisions }), [strokes, revisions, onEvidence]);

  // Size the canvas to its container at device resolution (crisp strokes).
  const fit = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const prev = ctxRef.current?.getImageData(0, 0, canvas.width, canvas.height);
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctxRef.current = ctx;
    if (prev) ctx.putImageData(prev, 0, 0);
  }, []);

  useEffect(() => {
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [fit]);

  const pos = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const start = (e: React.PointerEvent) => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    undoStack.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    if (undoStack.current.length > 40) undoStack.current.shift();
    drawing.current = true;
    const { x, y } = pos(e);
    ctx.strokeStyle = tool === "pen" ? "#0E1020" : "#EEF1FA";
    ctx.lineWidth = tool === "pen" ? 2.4 : 18;
    ctx.beginPath();
    ctx.moveTo(x, y);
    canvas.setPointerCapture(e.pointerId);
  };

  const move = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    const ctx = ctxRef.current;
    if (!ctx) return;
    const { x, y } = pos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const end = () => {
    if (!drawing.current) return;
    drawing.current = false;
    setStrokes((s) => s + 1);
    if (tool === "eraser") setRevisions((r) => r + 1);
  };

  const undo = () => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    const last = undoStack.current.pop();
    if (!ctx || !canvas || !last) return;
    ctx.putImageData(last, 0, 0);
    setRevisions((r) => r + 1);
  };

  const clear = () => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    undoStack.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setRevisions((r) => r + 1);
  };

  const toolBtn = (active: boolean) =>
    `grid h-9 w-9 place-items-center rounded-[var(--r-btn)] border transition-colors ${active ? "" : "hover:text-[var(--ink)]"}`;

  return (
    <div className="glass rounded-[var(--r-card)] p-3">
      <div className="mb-2 flex items-center gap-2">
        <button type="button" aria-label="Pen" onClick={() => setTool("pen")} className={toolBtn(tool === "pen")}
          style={tool === "pen" ? { background: "var(--iris)", color: "#fff", borderColor: "var(--iris)" } : { borderColor: "var(--glass-line-hi)", color: "var(--ink-3)" }}>
          <Pen size={16} />
        </button>
        <button type="button" aria-label="Eraser" onClick={() => setTool("eraser")} className={toolBtn(tool === "eraser")}
          style={tool === "eraser" ? { background: "var(--iris)", color: "#fff", borderColor: "var(--iris)" } : { borderColor: "var(--glass-line-hi)", color: "var(--ink-3)" }}>
          <Eraser size={16} />
        </button>
        <button type="button" aria-label="Undo" onClick={undo} className="grid h-9 w-9 place-items-center rounded-[var(--r-btn)] border text-[var(--ink-3)] hover:text-[var(--ink)]" style={{ borderColor: "var(--glass-line-hi)" }}>
          <Undo2 size={16} />
        </button>
        <button type="button" aria-label="Clear" onClick={clear} className="grid h-9 w-9 place-items-center rounded-[var(--r-btn)] border text-[var(--ink-3)] hover:text-[#b91c1c]" style={{ borderColor: "var(--glass-line-hi)" }}>
          <Trash2 size={16} />
        </button>
        <span className="ml-auto text-[11.5px] text-[var(--ink-3)]">Optional — your work, your choice</span>
      </div>
      <canvas
        ref={canvasRef}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
        className="h-[280px] w-full touch-none rounded-[var(--r-btn)]"
        style={{ background: "var(--porcelain-2)", border: "1px solid var(--glass-line)", cursor: "crosshair" }}
        aria-label="Whiteboard — sketch your solution"
      />
    </div>
  );
}
