"use client";

import { CheckCircle2, Mail } from "lucide-react";

// 診断ページ（/shindan・/sotsugyo）の結果の下に出す共通部分。直すときはここだけ直す（2026-11-03）。
// 個別相談の申込先（AutoBizの経営相談申込フォーム）
export const CONSULT_URL = "https://88auto.biz/andsteady/registp/soudan.htm";
// ８日間メール（小さなお店の経営８つの心得　令和版）の登録先。【仮】AutoBizの登録ページができたら差し替える。
export const MAIL_URL = "#";

export default function ConsultCta({ onConsultClick }: { onConsultClick?: () => void }) {
  return (
    <>
      <section className="mb-6 rounded-2xl bg-slate-800 p-6 text-center text-white">
        <h3 className="mb-2 text-base font-bold">個別相談（60分・9,800円）</h3>
        <p className="mb-4 text-sm leading-relaxed text-slate-300">
          あなたが「何だか、いつも、忙しい」原因を
          <br />
          一緒に洗い出し、整理します。
        </p>
        <a
          href={CONSULT_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onConsultClick}
          className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-6 py-3 text-sm font-bold text-slate-900 transition-transform hover:scale-105"
        >
          <CheckCircle2 className="h-4 w-4" />
          個別相談を申し込む
        </a>
      </section>

      {/* 登録ページのURLが入るまでは、押しても進まないボタンを出さないよう枠ごと隠す */}
      {MAIL_URL !== "#" && MAIL_URL !== "" && (
      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 text-center">
        <p className="mb-1 text-xs font-bold text-slate-500">もう少し学んでみたいあなたは</p>
        <h3 className="mb-2 text-sm font-bold leading-snug text-slate-800">
          小さなお店の経営８つの心得　令和版
        </h3>
        <p className="mb-4 text-xs leading-relaxed text-slate-500">
          ８日にわたってお届けしています（無料）
        </p>
        <a
          href={MAIL_URL}
          className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
        >
          <Mail className="h-4 w-4" />
          メールで受け取る
        </a>
      </section>
      )}
    </>
  );
}
