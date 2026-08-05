/**
 * FIXTURE identities — the post-shortlist half of the fixture directory.
 *
 * ══ WHY THIS FILE EXISTS SEPARATELY FROM directoryCandidates.ts ══
 * `DirectoryCandidate` has no `name` field and must never get one; the argument
 * is written out at the top of `src/components/directory/CandidateCard.tsx`.
 * Identity is not a property of the browse record, it is a thing that is
 * RELEASED at a moment. Putting it in a second file, keyed by id, keeps that
 * true structurally: a component that renders a `DirectoryCandidate` cannot
 * accidentally print a name, because the object it holds does not contain one.
 *
 * ══ WHY THE ONLY ACCESSOR DEMANDS THE SHORTLIST ══
 * `releaseIdentity()` below takes the shortlist and returns `null` for anyone
 * not on it. That is not defensive programming for its own sake — it is the
 * one place the product's central boundary can be enforced by the type system
 * rather than by everyone remembering. There is deliberately no exported map
 * to import directly.
 *
 * ══ WHY THESE NAMES ARE NOT NAMES ══
 * src/mocks/README.md rule 2 says "no named people", for the reason that a grid
 * of plausible humans with figures beside them is exactly the screenshot that
 * ends up in a deck captioned "our candidates". Post-shortlist identity is the
 * one place a name has to appear at all, so these are built to be impossible to
 * mistake for people: "Fixture Candidate One", contactable at a `.invalid`
 * address (RFC 2606 reserves that TLD precisely so it can never resolve). A
 * screenshot of this surface reads as a fixture even with the caption removed.
 *
 * ══ NO PHOTOS, HERE OR ANYWHERE ══
 * There is no `photoUrl`, `avatarUrl`, or `imageUrl` field on this type and
 * none may be added. The backend's `PROTECTED_AND_PROXY` set in
 * `app/fairness/firewall.py` bans `photo` outright, with no post-shortlist
 * exception, and this file is the place a well-meaning "but now we know who
 * they are" would try to introduce one. A name is needed to hold a
 * conversation. A face is not needed at any stage of an assessment product.
 */

/**
 * What is released when a recruiter shortlists.
 *
 * Note what is still absent after release: no school, no college, no employer,
 * no age, no gender, no photograph. Shortlisting releases the means to make
 * contact; it does not open a file.
 */
export interface ReleasedIdentity {
  /** Display name. Fixture-shaped on purpose — see the header. */
  name: string;
  /** Reachable handle. `.invalid` by RFC 2606; nothing here can be emailed. */
  contactEmail: string;
  /** Preferred pronouns IF the person supplied them. Volunteered, never inferred. */
  pronouns?: string;
}

const FIXTURE_IDENTITIES: Readonly<Record<string, ReleasedIdentity>> = {
  "fx-01": { name: "Fixture Candidate One", contactEmail: "fx-01@fixtures.invalid" },
  "fx-02": { name: "Fixture Candidate Two", contactEmail: "fx-02@fixtures.invalid" },
  "fx-03": { name: "Fixture Candidate Three", contactEmail: "fx-03@fixtures.invalid" },
  "fx-04": { name: "Fixture Candidate Four", contactEmail: "fx-04@fixtures.invalid" },
  "fx-05": { name: "Fixture Candidate Five", contactEmail: "fx-05@fixtures.invalid" },
  "fx-06": { name: "Fixture Candidate Six", contactEmail: "fx-06@fixtures.invalid" },
  "fx-07": { name: "Fixture Candidate Seven", contactEmail: "fx-07@fixtures.invalid" },
  "fx-08": { name: "Fixture Candidate Eight", contactEmail: "fx-08@fixtures.invalid" },
  "fx-09": { name: "Fixture Candidate Nine", contactEmail: "fx-09@fixtures.invalid" },
};

/**
 * The ONLY way to obtain an identity. Returns `null` unless this candidate is
 * on the supplied shortlist.
 *
 * The shortlist is a parameter rather than a hook read so that this stays a
 * pure function and so that the caller has to name, at the call site, which
 * commitment it is relying on. A component that wants a name has to be holding
 * the evidence that it earned one.
 */
export function releaseIdentity(
  candidateId: string,
  shortlistedIds: readonly string[],
): ReleasedIdentity | null {
  if (!shortlistedIds.includes(candidateId)) return null;
  return FIXTURE_IDENTITIES[candidateId] ?? null;
}

/** Marker for any surface rendering released identities. */
export const PIPELINE_FIXTURE_NOTICE =
  "Sample data — these identities are invented fixtures. No real candidate has been assessed or shortlisted.";
