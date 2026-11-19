"use client";

import { useEffect, useState } from "react";
import { RotateCcw, ArrowRight } from "lucide-react";
import ConsultCta from "@/components/ConsultCta";
import { trackMeta } from "@/lib/metaPixel";
import { QUESTIONS, PROFILE_QUESTIONS, SCORE_OPTIONS, judge, type TypeKey, type Score } from "./scoring";

// ページ表示・チェック開始・診断完了・各ボタンのクリックを匿名で記録する（お客様体験はブロックしない・個人情報なし）。
function trackEvent(eventType: "shindan_view" | "shindan_started" | "shindan_done" | "shindan_cta_consult" | "shindan_cta_mail") {
  fetch("/api/sotsugyo-event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventType }),
  }).catch(() => {});
}

export default function ShindanPage() {
  useEffect(() => {
    trackEvent("shindan_view");
  }, []);

  const [scores, setScores] = useState<Partial<Record<TypeKey, Score>>>({});
  const [profile, setProfile] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const setScore = (k: TypeKey, v: Score) => {
    if (Object.keys(scores).length === 0) trackEvent("shindan_started");
    setScores((prev) => ({ ...prev, [k]: v }));
  };

  const result = judge(scores, profile);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">
      <div className="mx-auto max-w-xl px-4 py-8 sm:py-12">
        <header className="mb-8 text-center">
          <p className="mb-2 text-sm font-semibold leading-relaxed text-amber-700">
            サロン・飲食店・小売店など
            <br />
            小さなお店のオーナーさんへ
          </p>
          <h1 className="mb-3 text-2xl font-bold leading-snug sm:text-3xl">
            <span className="inline-block">毎日忙しいのに</span>
            　
            <span className="inline-block">利益が残らないのは、なぜ？</span>
          </h1>
          <p className="text-sm leading-relaxed text-slate-500">
            あてはまる度合いを選んでください
            <br />
            （５つ・約１分）
          </p>
        </header>

        {!done ? (
          <>
            <section className="mb-6">
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                {QUESTIONS.map((q) => (
                  <div key={q.key} className="border-b border-slate-100 p-4 last:border-b-0">
                    <p className="mb-3 text-sm leading-relaxed">{q.text}</p>
                    <div className="grid grid-cols-3 gap-2">
                      {SCORE_OPTIONS.map((o) => {
                        const on = scores[q.key] === o.value;
                        return (
                          <button
                            key={o.value}
                            type="button"
                            onClick={() => setScore(q.key, o.value)}
                            className={`rounded-full border px-2 py-1.5 text-xs transition-colors sm:text-sm ${
                              on
                                ? "border-amber-600 bg-amber-50 font-bold text-amber-800"
                                : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            {o.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="mb-6 rounded-xl border border-slate-200 bg-white p-4">
              <h2 className="mb-3 border-l-4 border-amber-600 pl-3 text-sm font-bold text-slate-700">
                あわせて教えてください（任意）
              </h2>
              {PROFILE_QUESTIONS.map((pq) => (
                <div key={pq.key} className="mb-3 last:mb-0">
                  <p className="mb-1 text-xs text-slate-500">{pq.title}</p>
                  <div className="flex flex-wrap gap-2">
                    {pq.options.map((opt) => {
                      const on = profile[pq.key] === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setProfile((p) => ({ ...p, [pq.key]: opt }))}
                          className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                            on
                              ? "border-amber-600 bg-amber-50 font-bold text-amber-800"
                              : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </section>

            <div className="sticky bottom-4 mt-8">
              <button
                onClick={() => {
                  trackEvent("shindan_done");
                  trackMeta("trackCustom", "DiagnosisComplete", { content_name: "shindan" });
                  setDone(true);
                  if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-slate-800 py-4 text-base font-bold text-white shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99]"
              >
                結果を見る
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </>
        ) : (
          <>
            <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
              {result.label && (
                <>
                  <p className="mb-1 text-sm text-slate-500">忙しさの正体は</p>
                  <p className="mb-4 text-xl font-bold text-amber-700">{result.label}</p>
                </>
              )}
              {result.level && <p className="mb-4 text-sm leading-relaxed text-slate-600">{result.level}</p>}
              {result.hint && (
                <div className="mb-4 rounded-xl bg-amber-50 p-4 text-left">
                  <p className="mb-1 text-xs font-bold text-amber-700">整えると楽になりそうなところ</p>
                  <p className="text-sm leading-relaxed text-slate-700">{result.hint}</p>
                </div>
              )}
              {result.example && (
                <div className="mb-4 rounded-xl bg-slate-50 p-4 text-left">
                  <p className="mb-1 text-xs font-bold text-slate-600">たとえば</p>
                  <p className="text-sm leading-relaxed text-slate-700">{result.example}</p>
                </div>
              )}
              {result.others.length > 0 && (
                <div className="mb-4 rounded-xl border border-slate-200 p-4 text-left">
                  <p className="mb-2 text-xs font-bold text-slate-600">ほかにも、重なっているところ</p>
                  <ul className="space-y-1 text-sm text-slate-700">
                    {result.others.map((o) => (
                      <li key={o.key}>
                        ・{o.label}
                        {o.strong ? "（こちらも、かなり）" : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {result.yourCase.length > 0 && (
                <div className="mb-4 rounded-xl bg-amber-50 p-4 text-left">
                  <p className="mb-1 text-xs font-bold text-amber-700">あなたの場合</p>
                  {result.yourCase.map((t, i) => (
                    <p key={i} className="text-sm leading-relaxed text-slate-700">{t}</p>
                  ))}
                </div>
              )}
              <p className="text-sm leading-relaxed text-slate-600">{result.message}</p>
            </section>

            <ConsultCta
              onConsultClick={() => {
                trackEvent("shindan_cta_consult");
                trackMeta("trackCustom", "ConsultClick");
              }}
              onMailClick={() => {
                trackEvent("shindan_cta_mail");
                trackMeta("trackCustom", "MailClick");
              }}
            />

            <button
              onClick={() => {
                setScores({});
                setProfile({});
                setDone(false);
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
          2026 © なんで忙しいんだろう？がわかる診断
        </footer>
      </div>
    </main>
  );
}
