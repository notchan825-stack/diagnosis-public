"use client";

import { useState } from "react";
import { RotateCcw, ArrowRight, CheckCircle2, Mail } from "lucide-react";
import { SECTIONS, TOTAL, tier } from "./scoring";

// 相談導線（note 仕事のご依頼ページ）
const CTA_URL = "https://note.com/onozaki_noriko/n/n8379446cf997";
// セミナー導線（ひとり社長の仕組化支援セミナー・10/20,10/25）
const SEMINAR_URL = "https://meguri168.com/shikumika-seminar";

export default function SotsugyoPage() {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [done, setDone] = useState(false); // チェックリスト→結果表示に切り替えたらtrue
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [detailSent, setDetailSent] = useState(false); // 詳細診断メール送信済みか

  const toggle = (key: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const count = checked.size;
  const result = tier(count);
  const sectionCounts = SECTIONS.map(
    (s, si) => s.items.filter((_, ii) => checked.has(`${si}-${ii}`)).length
  );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">
      <div className="mx-auto max-w-xl px-4 py-8 sm:py-12">
        {/* ヘッダー */}
        <header className="mb-8 text-center">
          <p className="mb-2 text-xs font-semibold tracking-widest text-amber-700">
            専門家オーナーのための
          </p>
          <h1 className="mb-3 text-2xl font-bold leading-snug sm:text-3xl">
            ひとり社長卒業診断
          </h1>
          <p className="text-sm leading-relaxed text-slate-500">
あなたの専門性を広げる準備はできていますか？
            <br />
            当てはまる項目にチェックを入れてください（全{TOTAL}項目・約3分）
          </p>
        </header>

        {!done ? (
          <>
            {/* チェックリスト */}
            {SECTIONS.map((section, si) => (
              <section key={section.title} className="mb-6">
                <h2 className="mb-2 border-l-4 border-amber-600 pl-3 text-sm font-bold text-slate-700">
                  {section.title}
                </h2>
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  {section.items.map((item, ii) => {
                    const key = `${si}-${ii}`;
                    const on = checked.has(key);
                    return (
                      <label
                        key={key}
                        className={`flex cursor-pointer items-start gap-3 border-b border-slate-100 p-3 text-sm leading-relaxed transition-colors last:border-b-0 ${
                          on ? "bg-amber-50" : "hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={on}
                          onChange={() => toggle(key)}
                          className="mt-0.5 h-5 w-5 shrink-0 accent-amber-600"
                        />
                        <span>{item}</span>
                      </label>
                    );
                  })}
                </div>
              </section>
            ))}

            {/* 診断ボタン */}
            <div className="sticky bottom-4 mt-8">
              <button
                onClick={() => {
                  setDone(true);
                  if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-slate-800 py-4 text-base font-bold text-white shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99]"
              >
                診断結果を見る（現在 {count} 個）
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </>
        ) : (
          <>
            {/* 結果 */}
            <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
              <p className="mb-1 text-sm text-slate-500">チェックがついたのは</p>
              <p className="mb-3 text-5xl font-bold text-slate-800">
                {count}
                <span className="ml-1 text-lg font-normal text-slate-400">
                  / {TOTAL}
                </span>
              </p>
              <p
                className={`mb-3 text-xl font-bold ${
                  result.urgent ? "text-amber-700" : "text-emerald-700"
                }`}
              >
                {result.label}
              </p>
              <p className="text-sm leading-relaxed text-slate-600">{result.message}</p>
            </section>

            {/* さらに詳しい診断（無料・メール送付） */}
            <section className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
              {detailSent ? (
                <p className="text-sm leading-relaxed text-slate-700">
                  送信しました。届いたメールをご確認ください。
                </p>
              ) : (
                <>
                  <h3 className="mb-1 text-sm font-bold text-slate-800">
                    さらに詳しい診断をご希望の方は
                  </h3>
                  <p className="mb-4 text-xs leading-relaxed text-slate-500">
                    お名前とメールアドレスをご入力いただくと、詳細な診断内容をお届けします。
                  </p>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setSubmitError("");
                      setSubmitting(true);
                      try {
                        const res = await fetch("/api/sotsugyo-lead", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            name,
                            email,
                            checkedKeys: Array.from(checked),
                          }),
                        });
                        if (!res.ok) throw new Error("failed");
                        setDetailSent(true);
                      } catch {
                        setSubmitError("送信に失敗しました。時間をおいて再度お試しください。");
                      } finally {
                        setSubmitting(false);
                      }
                    }}
                    className="space-y-2"
                  >
                    <input
                      type="text"
                      required
                      placeholder="お名前"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-amber-600 focus:outline-none"
                    />
                    <input
                      type="email"
                      required
                      placeholder="メールアドレス"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-amber-600 focus:outline-none"
                    />
                    {submitError && (
                      <p className="text-xs text-red-600">{submitError}</p>
                    )}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-amber-600 py-3 text-sm font-bold text-white shadow-sm transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
                    >
                      <Mail className="h-4 w-4" />
                      {submitting ? "送信中…" : "無料で詳しい診断を受け取る"}
                    </button>
                  </form>
                </>
              )}
            </section>

            {/* 内訳 */}
            <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-bold text-slate-700">
                あなたの「詰まり」はここ
              </h3>
              {SECTIONS.map((s, si) => (
                <div key={s.title} className="mb-2 flex items-center gap-3 text-sm">
                  <span className="w-36 shrink-0 text-slate-500">{s.title}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-amber-500"
                      style={{
                        width: `${(sectionCounts[si] / s.items.length) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="w-10 text-right text-slate-600">
                    {sectionCounts[si]}/{s.items.length}
                  </span>
                </div>
              ))}
            </section>

            {/* CTA */}
            {count >= 5 && (
              <section className="mb-6 rounded-2xl bg-slate-800 p-6 text-center text-white">
                <p className="mb-3 text-sm leading-relaxed">
                  あなたの事業に足りないのは「頑張り」ではありません。
                  <br />
                  <span className="font-bold">売れるコンセプト・儲かる仕組</span>
                  の設計です。
                </p>
                <p className="mb-4 text-xs leading-relaxed text-slate-300">
                  あなたの「めんどうくさい」を一緒に排除して、仕組みづくりを伴走します。
                </p>
                <a
                  href={CTA_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-6 py-3 text-sm font-bold text-slate-900 transition-transform hover:scale-105"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  個別相談について見てみる
                </a>
              </section>
            )}

            {/* セミナー導線 */}
            <section className="mb-6 rounded-2xl border-2 border-amber-500 bg-amber-50 p-6 text-center">
              <p className="mb-2 text-xs font-bold tracking-wide text-amber-700">
                オンラインセミナー開催
              </p>
              <h3 className="mb-3 text-base font-bold leading-snug text-slate-800">
                ひとり社長の仕組化支援セミナー
              </h3>
              <p className="mb-4 text-sm leading-relaxed text-slate-600">
                浅草の靴メーカー3代目社長が、実際に事業を整理した事例をそのままお話しします。
                <br />
                10月20日(火)・10月25日(日)開催／参加費3,000円
              </p>
              <a
                href={SEMINAR_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-6 py-3 text-sm font-bold text-white transition-transform hover:scale-105"
              >
                セミナーの詳細を見る
              </a>
            </section>

            {/* リセット */}
            <button
              onClick={() => {
                setChecked(new Set());
                setDone(false);
                setDetailSent(false);
                setName("");
                setEmail("");
                setSubmitError("");
                if (typeof window !== "undefined") window.scrollTo({ top: 0 });
              }}
              className="mx-auto flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
              <RotateCcw className="h-4 w-4" />
              もう一度診断する
            </button>
          </>
        )}

        <footer className="mt-10 text-center text-xs text-slate-400">
          2026 © ひとり社長卒業診断
        </footer>
      </div>
    </main>
  );
}
