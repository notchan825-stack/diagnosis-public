import { NextResponse } from "next/server";
import { sendDiagnosisResultEmail } from "@/lib/email";
import { appendDiagnosisRow } from "@/lib/sheets";
import { QUESTIONS } from "../../andsteady-check55/questions";
import { diagnose, type ResultTier } from "../../andsteady-check55/scoring";
import type { Category } from "../../andsteady-check55/questions";

const VALID_IDS = new Set(QUESTIONS.map((q) => q.id));
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CATEGORY_LABELS: Record<Category, string> = {
  shoe: "くつチェック",
  foot: "あし（FOOT）チェック",
  leg: "あし（LEG）チェック",
  walk: "あるくチェック",
  posture: "姿勢チェック",
};

const TIER_LABELS: Record<ResultTier, string> = {
  gaihanboshi: "外反母趾タイプ",
  tako: "タコ・魚の目タイプ",
  gaisoku: "外側重心タイプ（O脚・内反小趾等）",
  fallback: "総合タイプ",
};

function resultSummary(result: ReturnType<typeof diagnose>) {
  if (result.tier === "fallback" && result.category) {
    return `${TIER_LABELS.fallback}（${CATEGORY_LABELS[result.category]}）`;
  }
  return TIER_LABELS[result.tier];
}

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
  const checkedLabels = QUESTIONS.filter((q) => safeIds.has(q.id)).map((q) => q.label);

  // 記録は結果メール送信の成否に関わらず必ず試みる（メール失敗時も何を診断したかは残す）
  try {
    await appendDiagnosisRow(email, checkedLabels, resultSummary(result));
  } catch (err) {
    console.error("append-diagnosis-row failed", err);
  }

  try {
    await sendDiagnosisResultEmail(email, result.text);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("send-diagnosis-result failed", err);
    return NextResponse.json({ error: "failed to send email" }, { status: 500 });
  }
}
