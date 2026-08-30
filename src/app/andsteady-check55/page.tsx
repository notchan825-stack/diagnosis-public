"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { ArrowRight, RotateCcw } from "lucide-react";
import { QUESTIONS, type Category } from "./questions";
import { diagnose, type DiagnosisResult } from "./scoring";

// LINE Harness（検証環境）のLIFF ID・API。LINEアプリ内（リッチメニュー等）で開かれた
// ときだけ liff.getIDToken() が取れるので、その場合だけ診断結果をLINEタグに自動反映する。
// 外部ブラウザで開かれた場合はLIFF初期化が失敗する/未ログインになるだけで、診断自体は
// 従来通り動く（tagFriend側はcatchで握りつぶし、診断結果表示をブロックしない）。
//
// 2026-08-30: 旧ID（2011233775-TslC3t0W）はkanriの予約ログイン画面（kanri.andsteady.com）
// と共有しており、エンドポイントURLがandsteady.com側を向いていたため診断ページ
// （diagnosis-public.vercel.app、別ドメイン）ではIDトークンが取得できなかった
// （実機テストでタグ0件・原因判明）。診断ページ専用に新規発行したLIFF ID
// （check55-shindan、エンドポイントURL=diagnosis-public.vercel.app/andsteady-check55）
// に差し替え。kanri側の旧IDには一切手を入れていない。
const LIFF_ID = "2011233775-Af5JXf7C";
const LINE_HARNESS_SUBMIT_URL =
  "https://line-harness.notchan825.workers.dev/api/public/diagnosis/check55/submit";

// LINEの中（LIFF）で開かれたかどうかを返す。true のときだけ実際にタグ付けも行う。
// この戻り値は、結果画面の出口CTAをLINE経由/メール経由で出し分けるのにも使う。
async function tagFriendViaLiff(checkedIds: string[]): Promise<boolean> {
  try {
    const liff = (await import("@line/liff")).default;
    await liff.init({ liffId: LIFF_ID });
    if (!liff.isLoggedIn() || !liff.isInClient()) return false;
    const idToken = liff.getIDToken();
    if (!idToken) return false;
    await fetch(LINE_HARNESS_SUBMIT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ checkedIds }),
    });
    return true;
  } catch (err) {
    // LINEの外（通常ブラウザ）で開かれた場合はここに来る。診断自体は継続するので黙って無視。
    console.warn("LIFF tag sync skipped:", err);
    return false;
  }
}

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
  const [email] = useState(() => searchParams.get("email") ?? "");

  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  // null = 判定中、true = LINE(LIFF)経由、false = メール講座経由/通常ブラウザ
  const [isLineOrigin, setIsLineOrigin] = useState<boolean | null>(null);

  // メールアドレスをURLに残さない（履歴・リファラー等への露出を減らすため、読み込み直後に消す）
  useEffect(() => {
    if (!email || typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (url.searchParams.has("email")) {
      url.searchParams.delete("email");
      window.history.replaceState(null, "", url.toString());
    }
  }, [email]);

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
    const diagnosis = diagnose(checked);
    setResult(diagnosis);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });

    if (email) {
      fetch("/api/send-diagnosis-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, checkedIds: Array.from(checked) }),
      }).catch((err) => console.error("diagnosis result email failed", err));
    }

    tagFriendViaLiff(Array.from(checked)).then(setIsLineOrigin);
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
              あなたの足もとのお悩み
              <br />
              「足が痛い」「足に合う靴がない」「むくみがひどい」「歩きかたが変」等々、
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

            {isLineOrigin !== null && (
              <section className="mb-6 rounded-2xl border border-[#1C2848]/10 bg-white p-6 text-center shadow-sm">
                {isLineOrigin ? (
                  <>
                    <p className="mb-2 text-sm leading-relaxed text-[#1C2848]">
                      無料メール講座に登録すると、あなたのお悩みに合わせて、
                      <br />
                      さらに詳しい足もとケアをお届けします。
                    </p>
                    <a
                      href="https://andsteady.com/mailseminar/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-[#aa2f2f] px-8 py-3 text-sm font-bold text-white shadow-md transition-transform hover:scale-[1.02] active:scale-[0.99]"
                    >
                      無料メール講座に登録する
                    </a>
                  </>
                ) : (
                  <>
                    <p className="mb-2 text-sm leading-relaxed text-[#1C2848]">
                      足に合う靴に履き替え、正しい歩き方に修正することで、
                      <br />
                      足もとだけでない不定愁訴が解消することも多くあります。
                    </p>
                    <a
                      href="https://andsteady.com/reservation"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-[#aa2f2f] px-8 py-3 text-sm font-bold text-white shadow-md transition-transform hover:scale-[1.02] active:scale-[0.99]"
                    >
                      ご予約はこちら
                    </a>
                  </>
                )}
              </section>
            )}

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
