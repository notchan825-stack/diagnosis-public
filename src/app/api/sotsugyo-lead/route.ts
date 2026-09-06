import { NextResponse } from "next/server";
import { appendSotsugyoRow } from "@/lib/sheets";
import { sendSotsugyoDetailEmail } from "@/lib/email";
import { VALID_KEYS, tier, labelsFromKeys, topCategoryAdvice } from "../../sotsugyo/scoring";

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
  const resultTier = tier(safeKeys.length);
  const checkedLabels = labelsFromKeys(safeKeys);

  // 記録はメール送信の成否に関わらず必ず試みる
  try {
    await appendSotsugyoRow(name, email, checkedLabels, resultTier.label);
  } catch (err) {
    console.error("append-sotsugyo-row failed", err);
    return NextResponse.json({ error: "failed to record lead" }, { status: 500 });
  }

  try {
    await sendSotsugyoDetailEmail(
      email,
      name,
      resultTier.label,
      resultTier.message,
      topCategoryAdvice(safeKeys)
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("send-sotsugyo-detail-email failed", err);
    // リードは記録済みなので、メール送信失敗はエラーにせずok扱い（本人が手動フォロー可能）
    return NextResponse.json({ ok: true, emailFailed: true });
  }
}
