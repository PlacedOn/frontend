// Process evidence captured from what the candidate PRODUCES during a problem —
// never surveillance. Mirrors the backend app.process_evidence.ProcessEvidence.
// Feeds the anti-cheat-by-design loop: a polished answer earns no band until the
// candidate shows the reasoning (incremental work here, or a self-explanation
// consistent with their own artifact).

export interface WhiteboardEvidence {
  whiteboard_strokes: number; // completed pen strokes — a process, not a single drop
  revisions: number; // undos + clears — genuine iteration
}

export interface ProcessEvidence extends WhiteboardEvidence {
  self_explanation?: string;
  artifact_text?: string;
}

export const emptyEvidence: WhiteboardEvidence = { whiteboard_strokes: 0, revisions: 0 };
