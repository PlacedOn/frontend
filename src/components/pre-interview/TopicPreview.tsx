"use client";

import { useState } from "react";
import { track } from "@/lib/track";

/**
 * "What you'll actually be asked" — the topics, openable one at a time.
 *
 * Why this exists, on both sides:
 *
 * FOR THE CANDIDATE. The page asks a stranger for 25-30 minutes and, until now,
 * described the interview only in the abstract ("adapts to you", "pause
 * anytime"). The thing people actually want before committing that much time is
 * what they are walking into. Not knowing is the most common reason people do
 * not start, and reassurance about *process* does not answer a worry about
 * *content*.
 *
 * FOR THE DATA. Which topic someone opens is a signal you cannot get any other
 * way: it is the one they are least sure about. Opening "when you were wrong"
 * before starting is a different candidate from one who opens "a system you
 * designed". Those opens are labelled hesitation, per topic, from people who
 * have not yet given you a single answer — the only read available on someone
 * who might be about to leave.
 *
 * What is deliberately NOT here: no real interview questions. The interview is
 * adaptive, and publishing a question list would let people rehearse answers,
 * which is exactly the resume-theatre the product exists to replace. These are
 * the *areas*, phrased as what the conversation is about.
 */

type Topic = {
  id: string;
  title: string;
  /** What the conversation is about — never a verbatim question. */
  body: string;
};

const TOPICS: Topic[] = [
  {
    id: "how_you_work",
    title: "How you actually work",
    body: "A real problem you have solved, in your own words. We follow what you did and why, not which framework you named. There is no right answer being scored against a key.",
  },
  {
    id: "when_stuck",
    title: "What you do when you're stuck",
    body: "Everyone gets stuck. What matters is what happens next — what you try, who you ask, when you decide the approach was wrong. This is the part a resume cannot show.",
  },
  {
    id: "when_wrong",
    title: "A time you were wrong",
    body: "Not a trick, and not a weakness question. Changing your mind on evidence is a strength we can actually see, and saying so plainly reads better than a rehearsed answer.",
  },
  {
    id: "working_with_people",
    title: "Working with other people",
    body: "Disagreements, handovers, explaining something hard to someone who needed it. How you communicate under pressure, described by you rather than guessed from a job title.",
  },
  {
    id: "what_you_want",
    title: "What you want next",
    body: "The work you want more of, and the work you would rather not repeat. This shapes which roles you get matched to, so it is worth being honest rather than strategic.",
  },
];

export function TopicPreview() {
  const [open, setOpen] = useState<string | null>(null);

  const toggle = (t: Topic) => {
    const opening = open !== t.id;
    setOpen(opening ? t.id : null);
    // Only the open is interesting. A close is usually "done reading", and
    // logging both would double every topic's count for no added meaning.
    if (opening) track("interview_topic_opened", { topic: t.id });
  };

  return (
    <div className="mt-8">
      <p className="text-[13px] font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--ink-3)" }}>
        What you&rsquo;ll actually be asked
      </p>
      <p className="mt-3 max-w-[54ch] text-[15px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
        Five areas, not a question list — the conversation adapts to your
        answers. Open any of them to see what it covers.
      </p>

      <ul className="mt-5 flex flex-col gap-2">
        {TOPICS.map((t) => {
          const isOpen = open === t.id;
          return (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => toggle(t)}
                aria-expanded={isOpen}
                aria-controls={`topic-${t.id}`}
                className="flex w-full cursor-pointer items-center justify-between gap-4 rounded-[var(--r-btn)] px-4 py-3.5 text-left transition-colors duration-[var(--d-micro)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  border: "1px solid var(--iris-line)",
                  background: isOpen ? "var(--iris-ghost)" : "var(--white)",
                  outlineColor: "var(--iris)",
                }}
              >
                <span className="text-[15px] font-semibold" style={{ color: "var(--ink)" }}>
                  {t.title}
                </span>
                {/* Text, not a chevron — this page carries no decorative icons.
                    It still says which way the control goes. */}
                <span
                  className="shrink-0 text-[12.5px] font-semibold"
                  style={{ color: "var(--iris-ink)" }}
                >
                  {isOpen ? "Close" : "Open"}
                </span>
              </button>

              {isOpen && (
                <p
                  id={`topic-${t.id}`}
                  className="px-4 pb-1 pt-3 text-[14.5px] leading-relaxed"
                  style={{ color: "var(--ink-2)" }}
                >
                  {t.body}
                </p>
              )}
            </li>
          );
        })}
      </ul>

      <p className="mt-5 text-[13px] leading-relaxed" style={{ color: "var(--ink-3)" }}>
        You can stop at any point. Nothing is saved as evidence until you review
        it afterwards and say so.
      </p>
    </div>
  );
}
