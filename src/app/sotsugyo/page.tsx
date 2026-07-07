"use client";

import { useState } from "react";
import { RotateCcw, ArrowRight, CheckCircle2 } from "lucide-react";

// ひとり社長卒業診断（24項目）
// 出典: コンサル事業資料 09_セルフ診断チェックリスト.md（2026-06-07版）
const SECTIONS: { title: string; items: string[] }[] = [
  {
    title: "事業の現状",
    items: [
      "何年やっても月商がほぼ変わっていない",
      "売上管理はどんぶり勘定、または「なんとなく」でやっている",
      "メニュー・サービスが５つ以上あって、何が一番売りかわからない",
      "価格を上げたいが、お客様に申し訳なくてできない",
      "来店いただいたお客さまのゴールを設定していない",
      "リピート来店をお客様のタイミングに任せている",
    ],
  },
  {
    title: "集客・ブランディング",
    items: [
      "「いいものを提供していれば自然に売れる」と思っている",
      "競合調査や業界調査をしたことがない",
      "「自分のお客様がどんな人か」を一言で説明できない",
      "プロフィールや自己紹介に資格・経歴しか書いていない",
      "集客はSNS・口コミ・紹介だけに頼っている",
      "GOOGLEビジネスプロフィールの口コミが30件以下",
    ],
  },
  {
    title: "仕組み・スケール",
    items: [
      "自分がいないとお店・事業が回らない",
      "人に任せたくても、教えるマニュアルや仕組みがない",
      "「次に何をすればいいか」がいつも迷う",
      "２店舗目の展開を考えているが、何から始めればいいかわからない",
    ],
  },
  {
    title: "PCスキル・ツール",
    items: [
      "PCに苦手意識があり、仕事の管理をスマホメインでやっている",
      "売上・予約・顧客情報をExcelやツールで管理していない",
      "SNS投稿に毎回１時間以上かかっている",
      "AI（Gemini・ChatGPT・Claude）に毎日触れていない",
    ],
  },
  {
    title: "意識・マインド",
    items: [
      "「もっと頑張れば何とかなる」と思い続けて数年経つ",
      "お金を稼ぐことは、無意識に「悪いこと」というメンタルブロックがある",
      "うまくいかない理由を、景気・立地・お客さまなど外に要因を探してしまう",
      "自分の事業は何のためにあるのか？ビジョンが明確になっていない",
    ],
  },
];

const TOTAL = SECTIONS.reduce((n, s) => n + s.items.length, 0);

// 相談導線（note 仕事のご依頼ページ）
const CTA_URL = "https://note.com/onozaki_noriko/n/n8379446cf997";

function tier(count: number) {
  if (count <= 4)
    return {
      label: "基盤はできています",
      message:
        "事業の土台は整っています。次のステージへ行くための「ひと押し」——絞り込みと見せ方の設計だけが残っています。",
      urgent: false,
    };
  if (count <= 9)
    return {
      label: "今が転換点です",
      message:
        "がんばりが空回りし始める時期です。仕組みを作る前に、まず「設計」——誰に・何を・なぜあなたから、の言語化が必要です。",
      urgent: true,
    };
  return {
    label: "一人で抱えすぎています",
    message:
      "このままでは数年後も同じ場所にいる可能性が高い状態です。足りないのは頑張りではなく、コンセプト・仕組み・見せ方の設計です。早急に動きましょう。",
    urgent: true,
  };
}

export default function SotsugyoPage() {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [done, setDone] = useState(false);

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
            専門性を、広がる事業に変える準備はできていますか？
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
                  <span className="font-bold">コンセプト・仕組み・見せ方</span>
                  の設計です。
                </p>
                <p className="mb-4 text-xs leading-relaxed text-slate-300">
                  現役社長として自社ブランドを育ててきた経験から、
                  あなたの事業を「選ばれるブランド」に変える伴走をします。
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

            {/* リセット */}
            <button
              onClick={() => {
                setChecked(new Set());
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
          2026 © ひとり社長卒業診断
        </footer>
      </div>
    </main>
  );
}
