import { NextResponse } from "next/server";
import { appendSotsugyoEventRow, type SotsugyoEventType } from "@/lib/sheets";

// /sotsugyo のファネル（ページ表示→チェック開始→各CTAクリック）を匿名で記録する。
// 個人情報は扱わない。失敗しても画面側の動作はブロックしない。
// 公開APIで誰でも直接POSTできるため、eventTypeは固定の許可リストのみ受け付ける。
const VALID_EVENT_TYPES = new Set<SotsugyoEventType>([
  "page_view",
  "started",
  "cta_seminar",
  "cta_consult",
  "cta_detail",
]);

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const eventType = typeof body?.eventType === "string" ? body.eventType : "";

  if (!VALID_EVENT_TYPES.has(eventType as SotsugyoEventType)) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  try {
    await appendSotsugyoEventRow(eventType as SotsugyoEventType);
  } catch (err) {
    console.error("sotsugyo-event record failed", err);
  }

  return NextResponse.json({ ok: true });
}
