import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { getSotsugyoEventRows } from "@/lib/sheets";

// /sotsugyo のファネル各段階（ページ表示→チェック開始→各CTAクリック）を
// 日次で報告するための集計エンドポイント。認証はsotsugyo-viewsと同じ
// DIAGNOSIS_ADMIN_KEY共有シークレット。

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    timingSafeEqual(bufA, bufA);
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

export async function GET(request: Request) {
  const adminKey = process.env.DIAGNOSIS_ADMIN_KEY;
  if (!adminKey) {
    return NextResponse.json({ error: "not configured" }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const authHeader = request.headers.get("authorization");
  const bearerKey = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const providedKey = searchParams.get("key") ?? bearerKey;

  if (!providedKey || !safeEqual(providedKey, adminKey)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const rows = await getSotsugyoEventRows();
    const todayPrefix = new Date().toLocaleDateString("ja-JP", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });

    const countBy = (predicate: (r: (typeof rows)[number]) => boolean) =>
      rows.filter(predicate).length;

    const summary = (type: string) => ({
      total: countBy((r) => r.eventType === type),
      today: countBy((r) => r.eventType === type && r.occurredAt.startsWith(todayPrefix)),
    });

    const includeRows = searchParams.get("raw") === "1";

    return NextResponse.json({
      page_view: summary("page_view"),
      started: summary("started"),
      cta_seminar: summary("cta_seminar"),
      cta_consult: summary("cta_consult"),
      cta_detail: summary("cta_detail"),
      ...(includeRows ? { rows } : {}),
    });
  } catch (err) {
    console.error("sotsugyo-events aggregate failed", err);
    return NextResponse.json({ error: "aggregate failed" }, { status: 500 });
  }
}
