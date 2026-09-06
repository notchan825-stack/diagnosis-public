import { NextResponse } from "next/server";
import { appendSotsugyoRow } from "@/lib/sheets";
import { VALID_KEYS, tier, labelsFromKeys } from "../../sotsugyo/scoring";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = body?.email;
  const checkedKeys = body?.checkedKeys;

  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  if (typeof email !== "string" || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "invalid email" }, { status: 400 });
  }
  if (!Array.isArray(checkedKeys)) {
    return NextResponse.json({ error: "checkedKeys is required" }, { status: 400 });
  }

  const safeKeys = checkedKeys.filter(
    (k): k is string => typeof k === "string" && VALID_KEYS.has(k)
  );
  const resultLabel = tier(safeKeys.length).label;
  const checkedLabels = labelsFromKeys(safeKeys);

  try {
    await appendSotsugyoRow(name, email, checkedLabels, resultLabel);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("append-sotsugyo-row failed", err);
    return NextResponse.json({ error: "failed to record lead" }, { status: 500 });
  }
}
