import { Section, Page, Prose, Eyebrow, Heading, Text } from "@/components/primitives";

/**
 * "The problem" — section 2 of 6.
 *
 * First section built entirely on primitives. It sets no padding, no width, no
 * font-size and no colour of its own; that is the whole test. Everything comes
 * from Section, Page, Prose, Heading and Text, so it cannot drift out of rhythm
 * with the rest of the page.
 *
 * Says why resumes fail once, and never again. The current site makes this same
 * argument in seven different sections, which is why a visitor learns nothing
 * after the first one.
 *
 * No cards, no icons, no numbers — three plain columns. Harvey's principle is
 * "saying the most with the least", and three sentences do this job.
 */

const COLUMNS = [
  {
    title: "Screening is a lottery",
    body: "A resume gets about six seconds. Most of what makes someone good at the job isn't on it.",
  },
  {
    title: "Good people get missed",
    body: "Non-linear careers and self-taught skills don't survive a keyword filter.",
  },
  {
    title: "Bias hides in the shortlist",
    body: "School, name and company are proxies. They're also where bias tends to live.",
  },
] as const;

export function Problem() {
  return (
    <Section labelledBy="problem-heading">
      <Page>
        <Eyebrow>The problem</Eyebrow>

        <Heading level={2} id="problem-heading" className="mt-4 max-w-[20ch]">
          A resume tells you where someone has been.
        </Heading>

        <Prose className="mt-5">
          <Text size="lg">
            It can&rsquo;t tell you how they think, how they decide, or what they do when the problem
            isn&rsquo;t in the spec.
          </Text>
        </Prose>

        <div className="mt-[var(--space-lg)] grid gap-[var(--space-md)] md:grid-cols-3">
          {COLUMNS.map((c) => (
            <div key={c.title}>
              <Text size="base" tone="strong" className="font-semibold">
                {c.title}
              </Text>
              <Text size="sm" className="mt-2">
                {c.body}
              </Text>
            </div>
          ))}
        </div>
      </Page>
    </Section>
  );
}
