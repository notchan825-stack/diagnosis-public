import { NextResponse } from "next/server";
import { appendSotsugyoViewRow } from "@/lib/sheets";

// アナログ社長卒業診断(/sotsugyo)で「診断結果を見る」が押された回数だけを記録する。
// 個人情報は扱わない(匿名カウント用)。失敗しても画面側の結果表示はブロックしない。
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const checkedCount = Number(body?.checkedCount);
  const resultLabel = typeof body?.resultLabel === "string" ? body.resultLabel : "";

  if (!Number.isFinite(checkedCount) || !resultLabel) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  try {
    await appendSotsugyoViewRow(checkedCount, resultLabel);
  } catch (err) {
    console.error("sotsugyo-view record failed", err);
    // 計測失敗はお客様体験に影響させたくないので200のまま返す
  }

  return NextResponse.json({ ok: true });
}
