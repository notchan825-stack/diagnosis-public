"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { ArrowRight, RotateCcw } from "lucide-react";
import { QUESTIONS, type Category } from "./questions";
import { diagnose, type DiagnosisResult } from "./scoring";

const CATEGORY_LABELS: Record<Category, string> = {
  shoe: "くつチェック",
  foot: "あし（FOOT）チェック",
  leg: "あし（LEG）チェック",
  walk: "あるくチェック",
  posture: "姿勢チェック",
};

const CATEGORY_ORDER: Category[] = ["shoe", "foot", "leg", "walk", "posture"];

function Check55Inner() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<DiagnosisResult | null>(null);

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const count = checked.size;

  const handleSubmit = () => {
    setResult(diagnose(checked));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReset = () => {
    setChecked(new Set());
    setResult(null);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-white text-[#1C2848]">
      <div className="mx-auto max-w-xl px-4 py-8 sm:py-12">
        {/* ヘッダー */}
        <header className="mb-8 text-center">
          <Image
            src="/andsteady-logo.png"
            alt="andsteady"
            width={180}
            height={40}
            className="mx-auto mb-4 h-6 w-auto"
            priority
          />
          <h1 className="mb-3 text-2xl font-bold leading-snug sm:text-3xl">
            くつ・あし・あるく黄金チェック55診断
          </h1>
          {!result && (
            <p className="text-sm leading-relaxed text-[#1C2848]">
              あなたの足もとのお悩み、
              <br />
              「足が痛い」「足に合う靴がない」「変な歩きかただ」
              <br />
              １つ１つ紐解いて、原因と対策を明らかにしましょう。
            </p>
          )}
        </header>

        {!result ? (
          <>
            {CATEGORY_ORDER.map((cat) => (
              <section key={cat} className="mb-6">
                <h2 className="mb-2 border-l-4 border-[#aa2f2f] pl-3 text-sm font-bold text-[#1C2848]">
                  {CATEGORY_LABELS[cat]}
                </h2>
                <div className="overflow-hidden rounded-xl border border-[#1C2848]/10 bg-white">
                  {QUESTIONS.filter((q) => q.category === cat).map((q) => {
                    const on = checked.has(q.id);
                    return (
                      <label
                        key={q.id}
                        className={`flex cursor-pointer items-start gap-3 border-b border-[#1C2848]/5 p-3 text-sm leading-relaxed transition-colors last:border-b-0 ${
                          on ? "bg-[#aa2f2f]/5" : "hover:bg-[#1C2848]/[0.02]"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={on}
                          onChange={() => toggle(q.id)}
                          className="mt-0.5 h-5 w-5 shrink-0 accent-[#aa2f2f]"
                        />
                        <span>{q.label}</span>
                      </label>
                    );
                  })}
                </div>
              </section>
            ))}

            <div className="sticky bottom-4 mt-8">
              <button
                onClick={handleSubmit}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#1C2848] py-4 text-base font-bold text-white shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99]"
              >
                診断結果を見る（現在 {count} 個チェック）
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </>
        ) : (
          <>
            <section className="mb-6 rounded-2xl border border-[#1C2848]/10 bg-white p-6 shadow-sm">
              <p className="mb-4 text-sm font-semibold text-[#aa2f2f]">あなたへの診断結果</p>
              <p className="whitespace-pre-wrap text-base leading-relaxed text-[#1C2848]">
                {result.text}
              </p>
            </section>

            <section className="mb-6 rounded-2xl border border-[#1C2848]/10 bg-white p-6 text-center shadow-sm">
              <p className="mb-2 text-sm leading-relaxed text-[#1C2848]">
                足に合う靴に履き替え、正しい歩き方に修正することで、
                <br />
                足もとだけでない不定愁訴が解消することも多いのです。
              </p>
              <a
                href="https://andsteady.com/reservation"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-[#aa2f2f] px-8 py-3 text-sm font-bold text-white shadow-md transition-transform hover:scale-[1.02] active:scale-[0.99]"
              >
                ご予約はこちら
              </a>
            </section>

            <button
              onClick={handleReset}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-[#1C2848]/20 py-3 text-sm text-[#1C2848]/60 transition-colors hover:bg-white"
            >
              <RotateCcw className="h-4 w-4" />
              もう一度チェックする
            </button>
          </>
        )}
      </div>
    </main>
  );
}

export default function AndsteadyCheck55Page() {
  return (
    <Suspense fallback={null}>
      <Check55Inner />
    </Suspense>
  );
}
