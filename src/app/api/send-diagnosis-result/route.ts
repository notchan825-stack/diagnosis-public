import { NextResponse } from "next/server";
import { sendDiagnosisResultEmail } from "@/lib/email";
import { QUESTIONS } from "../../andsteady-check55/questions";
import { diagnose } from "../../andsteady-check55/scoring";

const VALID_IDS = new Set(QUESTIONS.map((q) => q.id));
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = body?.email;
  const checkedIds = body?.checkedIds;

  if (typeof email !== "string" || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "invalid email" }, { status: 400 });
  }
  if (!Array.isArray(checkedIds) || checkedIds.length === 0) {
    return NextResponse.json({ error: "checkedIds is required" }, { status: 400 });
  }

  const safeIds = new Set(
    checkedIds.filter((id): id is string => typeof id === "string" && VALID_IDS.has(id))
  );
  if (safeIds.size === 0) {
    return NextResponse.json({ error: "no valid checkedIds" }, { status: 400 });
  }

  const result = diagnose(safeIds);

  try {
    await sendDiagnosisResultEmail(email, result.text);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("send-diagnosis-result failed", err);
    return NextResponse.json({ error: "failed to send email" }, { status: 500 });
  }
}
