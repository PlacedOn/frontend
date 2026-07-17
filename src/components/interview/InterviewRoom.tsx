"use client";

import { useEffect, useState } from "react";
import { isLiveBackend } from "@/lib/api";
import { accessToken } from "@/lib/v1";
import { useInterviewSession } from "@/lib/interview/useInterviewSession";
import { useLiveInterview } from "@/lib/interview/useLiveInterview";
import { InterviewSurface } from "./InterviewSurface";

interface InterviewRoomProps {
  /** Legacy demo interview id (?id=). */
  initialId?: string;
  /** Real authenticated interview session id (?session=), created via ConsentGate. */
  sessionId?: string;
}

/**
 * Selector: a real ?session= against a live backend runs the authenticated
 * transport; otherwise the room falls back to the scripted demo. Hooks can't be
 * called conditionally, so each path lives in its own sibling component.
 */
export function InterviewRoom({ initialId, sessionId }: InterviewRoomProps) {
  const authed = Boolean(sessionId) && isLiveBackend();
  if (authed && sessionId) return <LiveRoom sessionId={sessionId} />;
  return <DemoRoom initialId={initialId} />;
}

function DemoRoom({ initialId }: { initialId?: string }) {
  const { live, messages, streaming, status, turn, error, sendAnswer, end } =
    useInterviewSession(initialId);
  return (
    <InterviewSurface
      live={live}
      messages={messages}
      streaming={streaming}
      status={status}
      turn={turn}
      error={error}
      onSend={sendAnswer}
      onEnd={end}
    />
  );
}

function LiveRoom({ sessionId }: { sessionId: string }) {
  // Resolve the JWT once (the WS carries it as a query param), then mount the
  // transport. Rendering the inner component only after the token exists keeps
  // useLiveInterview's hook call unconditional.
  const [token, setToken] = useState<string | null>(null);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    accessToken()
      .then((t) => !cancelled && setToken(t))
      .catch(() => !cancelled && setAuthError(true));
    return () => {
      cancelled = true;
    };
  }, []);

  if (authError) {
    return (
      <div className="glass rounded-[var(--r-card)] p-8 text-center">
        <h2 className="text-[1.3rem]">Please sign in to continue.</h2>
        <p className="mx-auto mt-2 max-w-md text-[14.5px] text-[var(--ink-2)]">Your session couldn&rsquo;t be verified. Sign in and start the interview again.</p>
      </div>
    );
  }
  if (!token) {
    return <p className="text-[14px] text-[var(--ink-3)]">Connecting to your interview…</p>;
  }
  return <LiveRoomInner sessionId={sessionId} token={token} />;
}

function LiveRoomInner({ sessionId, token }: { sessionId: string; token: string }) {
  const { live, messages, streaming, status, turn, error, sendAnswer, retry, end } =
    useLiveInterview(sessionId, token);
  return (
    <InterviewSurface
      live={live}
      messages={messages}
      streaming={streaming}
      status={status}
      turn={turn}
      error={error}
      onSend={sendAnswer}
      onEnd={end}
      onRetry={retry}
      reviewHref={`/candidate/report/${sessionId}`}
    />
  );
}
