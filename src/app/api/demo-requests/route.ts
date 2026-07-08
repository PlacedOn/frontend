import { NextResponse } from "next/server";
import { rateLimit, clientIp } from "@/lib/rateLimit";

/**
 * POST /api/demo-requests — persist a "Book a demo" lead to Supabase.
 * Runs server-side: Supabase keys never reach the browser. Input is
 * validated here; the table's RLS allows insert-only for this key.
 * Abuse controls: per-IP rate limit + a hidden honeypot field.
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;

const RATE_LIMIT = 5; // submissions
const RATE_WINDOW_MS = 60_000; // per minute, per IP

type Incoming = {
  name?: unknown;
  workEmail?: unknown;
  company?: unknown;
  audience?: unknown;
  hiringVolume?: unknown;
  roleType?: unknown;
  message?: unknown;
  hp?: unknown; // honeypot — humans never fill this
};

const isEmail = (s: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const clean = (v: unknown, max: number): string =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

export async function POST(req: Request) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return NextResponse.json(
      { ok: false, error: "Lead storage is not configured." },
      { status: 500 },
    );
  }

  const limit = rateLimit(`demo:${clientIp(req)}`, RATE_LIMIT, RATE_WINDOW_MS);
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please try again in a moment." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  let body: Incoming;
  try {
    body = (await req.json()) as Incoming;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  // Honeypot: a bot that fills the hidden field gets a silent success and
  // nothing is stored. Return 200 so scrapers can't detect the trap.
  if (clean(body.hp, 200)) {
    return NextResponse.json({ ok: true });
  }

  const name = clean(body.name, 120);
  const workEmail = clean(body.workEmail, 200);
  const company = clean(body.company, 160);
  const audience = body.audience === "candidate" ? "candidate" : "employer";
  const hiringVolume = clean(body.hiringVolume, 60) || null;
  const roleType = clean(body.roleType, 60) || null;
  const message = clean(body.message, 2000) || null;

  if (!name || !company || !isEmail(workEmail)) {
    return NextResponse.json(
      { ok: false, error: "Please provide a name, company, and a valid work email." },
      { status: 422 },
    );
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/demo_requests`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        name,
        work_email: workEmail,
        company,
        audience,
        hiring_volume: hiringVolume,
        role_type: roleType,
        message,
      }),
    });
    if (!res.ok) {
      return NextResponse.json({ ok: false, error: "Could not save your request." }, { status: 502 });
    }
  } catch {
    return NextResponse.json({ ok: false, error: "Could not reach storage." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
