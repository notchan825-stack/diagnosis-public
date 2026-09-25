import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { getSotsugyoViewRows, deleteTestSotsugyoViewRows } from "@/lib/sheets";

// アナログ社長卒業診断(/sotsugyo)の「結果を見た」件数を日次で報告するための
// 集計エンドポイント。認証はdiagnosis-leadsと同じDIAGNOSIS_ADMIN_KEY共有シークレット。

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
    if (searchParams.get("cleanup") === "1") {
      const result = await deleteTestSotsugyoViewRows();
      console.log("sotsugyo-views cleanup", result);
    }

    const rows = await getSotsugyoViewRows();
    const todayPrefix = new Date().toLocaleDateString("ja-JP", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
    const todayCount = rows.filter((r) => r.viewedAt.startsWith(todayPrefix)).length;

    const byLabel: Record<string, number> = {};
    for (const r of rows) byLabel[r.resultLabel] = (byLabel[r.resultLabel] ?? 0) + 1;

    const includeRows = searchParams.get("raw") === "1";

    return NextResponse.json({
      total: rows.length,
      today: todayCount,
      byResultLabel: byLabel,
      ...(includeRows ? { rows } : {}),
    });
  } catch (err) {
    console.error("sotsugyo-views aggregate failed", err);
    return NextResponse.json({ error: "aggregate failed" }, { status: 500 });
  }
}
