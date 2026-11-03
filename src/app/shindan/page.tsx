"use client";

import { useState } from "react";
import { RotateCcw, ArrowRight } from "lucide-react";
import ConsultCta from "@/components/ConsultCta";
import { QUESTIONS, PROFILE_QUESTIONS, judge, type TypeKey } from "./scoring";


export default function ShindanPage() {
  const [checked, setChecked] = useState<Set<TypeKey>>(new Set());
  const [profile, setProfile] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const toggle = (k: TypeKey) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });

  const result = judge(checked);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">
      <div className="mx-auto max-w-xl px-4 py-8 sm:py-12">
        <header className="mb-8 text-center">
          <p className="mb-2 text-xs font-semibold tracking-widest text-amber-700">
            なんだか毎日、忙しい。そんなあなたへ
          </p>
          <h1 className="mb-3 text-2xl font-bold leading-snug sm:text-3xl">
            なんで忙しいんだろう？
            <br />
            の原因を探します
          </h1>
          <p className="text-sm leading-relaxed text-slate-500">
            当てはまるものにチェックを入れてください
            <br />
            （５つ・約１分）
          </p>
        </header>

        {!done ? (
          <>
            <section className="mb-6">
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                {QUESTIONS.map((q) => {
                  const on = checked.has(q.key);
                  return (
                    <label
                      key={q.key}
                      className={`flex cursor-pointer items-start gap-3 border-b border-slate-100 p-4 text-sm leading-relaxed transition-colors last:border-b-0 ${
                        on ? "bg-amber-50" : "hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => toggle(q.key)}
                        className="mt-0.5 h-5 w-5 shrink-0 accent-amber-600"
                      />
                      <span>{q.text}</span>
                    </label>
                  );
                })}
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
              {result.hint && (
                <div className="mb-4 rounded-xl bg-amber-50 p-4 text-left">
                  <p className="mb-1 text-xs font-bold text-amber-700">整えると楽になりそうなところ</p>
                  <p className="text-sm leading-relaxed text-slate-700">{result.hint}</p>
                </div>
              )}
              <p className="text-sm leading-relaxed text-slate-600">{result.message}</p>
            </section>

            <ConsultCta />

            <button
              onClick={() => {
                setChecked(new Set());
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
