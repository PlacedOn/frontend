import type { Metadata } from "next";
import { RoutePage } from "@/components/layout/RoutePage";
import { InterviewDemo } from "@/components/sections/InterviewDemo";
import { API_BASE_URL } from "@/lib/api";

export const metadata: Metadata = {
  title: "Interview room — PlacedOn",
  description: "The live PlacedOn interview room.",
};

export default function InterviewPage() {
  return (
    <RoutePage
      eyebrow="Live interview"
      title="Interview room"
      intro="The live room connects to the PlacedOn interview engine over WebSocket. This preview shows the turn-by-turn flow and real-time signal extraction."
    >
      <InterviewDemo />
      <p className="mt-6 text-[13px] text-[var(--ink-3)]">
        Backend: streams from <code>{API_BASE_URL}</code> (FastAPI + WebSocket). Set
        <code> NEXT_PUBLIC_API_BASE_URL</code> to point at your interview engine.
      </p>
    </RoutePage>
  );
}
