import { NextResponse } from "next/server";
import { appendSotsugyoViewRow } from "@/lib/sheets";
import { TOTAL } from "../../sotsugyo/scoring";

// アナログ社長卒業診断(/sotsugyo)で「診断結果を見る」が押された回数だけを記録する。
// 個人情報は扱わない(匿名カウント用)。失敗しても画面側の結果表示はブロックしない。
//
// このエンドポイントは公開APIで誰でも直接POSTできるため、resultLabelは
// scoring.tsが実際に返す3種類の固定文言以外は受け付けない(スプレッドシート
// 数式インジェクション対策。値そのものも appendSotsugyoViewRow 側でRAW書き込み
// にして二重に防いでいる)。
const VALID_RESULT_LABELS = new Set([
  "基盤はできています",
  "今が転換点です",
  "一人で抱えすぎています",
]);

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const checkedCount = Number(body?.checkedCount);
  const resultLabel = typeof body?.resultLabel === "string" ? body.resultLabel : "";

  if (
    !Number.isInteger(checkedCount) ||
    checkedCount < 0 ||
    checkedCount > TOTAL ||
    !VALID_RESULT_LABELS.has(resultLabel)
  ) {
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
