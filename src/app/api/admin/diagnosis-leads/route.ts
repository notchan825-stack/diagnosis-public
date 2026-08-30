import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { getDiagnosisRows } from "@/lib/sheets";

// 診断結果メール送信時に記録されたメールアドレス一覧をCSVで書き出す。
// オートビズ（メルマガ配信ツール）への取り込み用。氏名は診断フォームで
// 集めていないため含まれない（メールアドレスのみ）。
//
// 認証は共有シークレット1本（?key=... または Authorization: Bearer ...）。
// このアプリには他に管理画面が無いため、最小限のガードとして専用の
// DIAGNOSIS_ADMIN_KEY環境変数と照合するだけの単純な仕組み。

// タイミング攻撃対策: 単純な !== 比較だと文字列比較の早期リターンで
// 応答時間から1文字ずつ推測されうる。長さを揃えてから定数時間で比較する。
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // 長さが違う場合もtimingSafeEqualは例外を投げるため、ダミー比較で
    // 早期リターンとの時間差を減らしてからfalseを返す。
    timingSafeEqual(bufA, bufA);
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

// CSVインジェクション対策: セルの値が =+-@ で始まると、Excel/スプレッド
// シートで開いたときに数式として評価されうる（例: メールアドレス欄に
// 悪意ある文字列が入っていた場合）。先頭に ' を足して文字列扱いに固定する。
function sanitizeCsvCell(v: string): string {
  return /^[=+\-@]/.test(v) ? `'${v}` : v;
}

function toCsv(rows: { submittedAt: string; email: string; checkedLabels: string; resultSummary: string }[]) {
  const escape = (v: string) => `"${sanitizeCsvCell(v).replace(/"/g, '""')}"`;
  const header = ["送信日時", "メールアドレス", "チェックした項目", "診断結果"].map(escape).join(",");
  const lines = rows.map((r) =>
    [r.submittedAt, r.email, r.checkedLabels, r.resultSummary].map(escape).join(",")
  );
  return [header, ...lines].join("\r\n");
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
    const rows = await getDiagnosisRows();
    const format = searchParams.get("format");

    if (format === "emails") {
      // AutoBiz取込等で「メールアドレスだけ改行区切り」が欲しい場合向け
      const emails = [...new Set(rows.map((r) => r.email))].join("\n");
      return new NextResponse(emails, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const csv = toCsv(rows);
    return new NextResponse("﻿" + csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="diagnosis-leads.csv"`,
      },
    });
  } catch (err) {
    console.error("diagnosis-leads export failed", err);
    return NextResponse.json({ error: "export failed" }, { status: 500 });
  }
}
