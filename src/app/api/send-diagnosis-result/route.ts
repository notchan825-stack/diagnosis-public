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

// アンド・ステディ本体サイトの「メール講座LP」(andsteady.com/mailseminar)から呼ばれる
// ため、この2つのオリジンだけCORSを許可する（2026-11-03）。それ以外には何も足さない。
const ALLOWED_ORIGINS = new Set(["https://andsteady.com", "https://www.andsteady.com"]);

function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get("origin") ?? "";
  if (!ALLOWED_ORIGINS.has(origin)) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

// メール講座LP(andsteady.com/mailseminar)から来た登録を、アウトバイズの
// 「【新規】８日間の足もとづくりの基礎講座」(pid=1)へ登録する（2026-11-03）。
// アウトバイズの申込フォームは「入力→確認画面→送信」の2段階で、確認画面の送信を
// 押さないと登録されない。ブラウザからは確認画面を操作できないため、ここ(サーバー側)で
// 同じセッションのまま2回POSTして登録を完了させる。
const AUTOBIZ_FORM_URL = "https://88auto.biz/andsteady/planmail.php";
const AUTOBIZ_PID = "1";

function decodeAny(buf: ArrayBuffer): string {
  const u8 = new TextDecoder("utf-8").decode(buf);
  if (!u8.includes("\uFFFD")) return u8;
  try {
    return new TextDecoder("shift_jis").decode(buf);
  } catch {
    return u8;
  }
}

async function registerToAutoBiz(name1: string, name2: string, email: string, fld4: string): Promise<boolean> {
  const form = { "Content-Type": "application/x-www-form-urlencoded" };
  const r1 = await fetch(AUTOBIZ_FORM_URL, {
    method: "POST",
    headers: form,
    body: new URLSearchParams({ mcode: "UTF-8", pid: AUTOBIZ_PID, spflg: "1", name1, name2, email, fld4 }),
    signal: AbortSignal.timeout(15000),
  });
  const cookie = r1.headers.getSetCookie().map((c) => c.split(";")[0]).join("; ");
  const confirmPage = decodeAny(await r1.arrayBuffer());
  // 確認画面には送信ボタン(send_btn)がある。無ければ入力エラー等で登録に進めていない
  if (!cookie || !confirmPage.includes("send_btn")) return false;
  const r2 = await fetch(AUTOBIZ_FORM_URL, {
    method: "POST",
    headers: { ...form, Cookie: cookie },
    body: new URLSearchParams({ pid: AUTOBIZ_PID, bak: "-2", sbm: "send" }),
    signal: AbortSignal.timeout(15000),
  });
  return decodeAny(await r2.arrayBuffer()).includes("ご登録ありがとうございました");
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(request) });
}

export async function POST(request: Request) {
  const cors = corsHeaders(request);
  const body = await request.json().catch(() => null);
  const email = body?.email;
  const checkedIds = body?.checkedIds;

  if (typeof email !== "string" || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "invalid email" }, { status: 400, headers: cors });
  }
  if (!Array.isArray(checkedIds) || checkedIds.length === 0) {
    return NextResponse.json({ error: "checkedIds is required" }, { status: 400, headers: cors });
  }

  const safeIds = new Set(
    checkedIds.filter((id): id is string => typeof id === "string" && VALID_IDS.has(id))
  );
  if (safeIds.size === 0) {
    return NextResponse.json({ error: "no valid checkedIds" }, { status: 400, headers: cors });
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
  } catch (err) {
    console.error("send-diagnosis-result failed", err);
    // メール送信に失敗しても、LPは結果の文章を表示できるよう text を返す
    return NextResponse.json({ error: "failed to send email", text: result.text }, { status: 500, headers: cors });
  }

  // LPからの場合だけ、結果メールが送れたあとに講座へ登録する（失敗しても結果メールの成功は変えない）
  let registered = false;
  const reg = body?.register;
  if (reg && typeof reg === "object") {
    const n1 = typeof reg.name1 === "string" ? reg.name1.trim().slice(0, 50) : "";
    const n2 = typeof reg.name2 === "string" ? reg.name2.trim().slice(0, 50) : "";
    if (n1 && n2) {
      try {
        registered = await registerToAutoBiz(n1, n2, email, `【LPの診断】${checkedLabels.join("、")}`.slice(0, 1000));
        if (!registered) console.error("autobiz register: not completed");
      } catch (err) {
        console.error("autobiz register failed", err);
      }
    }
  }
  return NextResponse.json({ ok: true, text: result.text, registered }, { headers: cors });
}
