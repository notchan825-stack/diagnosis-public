"use client";

import { useState } from "react";
import { ChevronRight, RotateCcw, Mail } from "lucide-react";

const QUESTIONS = [
  {
    id: 1,
    question: "あなたのビジネス・商品の「一番の強み」を、一言で言えますか？",
    options: [
      { label: "すらすら言える。他との違いも明確", score: 3 },
      { label: "なんとなく言えるが、自信がない", score: 2 },
      { label: "言えるが、お客さんに刺さってない気がする", score: 1 },
      { label: "考えたことがなかった", score: 0 },
    ],
  },
  {
    id: 2,
    question: "「なぜ競合ではなく、あなたから買うのか」お客さんに説明できますか？",
    options: [
      { label: "明確に説明できる", score: 3 },
      { label: "なんとなく「品質が違う」くらいなら言える", score: 2 },
      { label: "価格で勝負している", score: 1 },
      { label: "正直わからない", score: 0 },
    ],
  },
  {
    id: 3,
    question: "「理想のお客さん」はどんな人か、具体的にイメージできますか？",
    options: [
      { label: "ペルソナが明確にある", score: 3 },
      { label: "なんとなくはわかる", score: 2 },
      { label: "来る人が来る、というスタンス", score: 1 },
      { label: "想定外のお客さんが多くて困っている", score: 0 },
    ],
  },
  {
    id: 4,
    question: "商品・サービスの価格は、どう決めましたか？",
    options: [
      { label: "自分の価値や想いを基準に設定した", score: 3 },
      { label: "競合を参考にした", score: 2 },
      { label: "なんとなく決めた", score: 1 },
      { label: "安くしないと売れない気がして下げ続けている", score: 0 },
    ],
  },
  {
    id: 5,
    question: "SNS・サイト・名刺などのビジュアルや言葉は統一されていますか？",
    options: [
      { label: "しっかり統一されている", score: 3 },
      { label: "なんとなく合わせているが曖昧", score: 2 },
      { label: "バラバラだと思う", score: 1 },
      { label: "そもそも整備できていない", score: 0 },
    ],
  },
  {
    id: 6,
    question: "今のビジネスの「売れ方」に満足していますか？",
    options: [
      { label: "順調。口コミや紹介も多い", score: 3 },
      { label: "悪くはないが、もっと伸ばしたい", score: 2 },
      { label: "停滞している・思ったより売れない", score: 1 },
      { label: "正直、苦しい状況", score: 0 },
    ],
  },
];

type ResultType = {
  label: string;
  tag: string;
  tagColor: string;
  message: string;
  points: string[];
  cta: string;
};

function getResult(score: number): ResultType {
  if (score >= 14) {
    return {
      label: "ブランド完成型",
      tag: "あと一歩で突き抜ける",
      tagColor: "#c9a96e",
      message:
        "強みを持ち、言語化もできている。ここからは「磨く」フェーズです。プロの視点で整理・強化することで、今より一段上の市場へ届くポテンシャルがあります。",
      points: [
        "ブランドの言語をさらに研ぎ澄ますことで、価格競争から抜け出せます",
        "口コミ・紹介が自然に生まれる仕組みをつくれるタイミングです",
        "商品ラインや展開先を広げる戦略設計が有効です",
      ],
      cta: "ブランドをさらに強くしたい方へ",
    };
  }
  if (score >= 9) {
    return {
      label: "ブランド模索型",
      tag: "強みはある。整理次第で化ける",
      tagColor: "#4a7c59",
      message:
        "強みはすでに持っています。ただ、それがまだ「言葉」になりきれていない状態。ヒアリングと整理を重ねることで、お客さんに刺さるブランドに変わります。",
      points: [
        "自分では当たり前に思っていることが、実は最大の強みであることが多いです",
        "「誰に・何を・なぜ」の3点を言語化するだけで、発信が変わります",
        "価格設定を見直すことで、同じ商品が「高くても売れる」に変わります",
      ],
      cta: "あなたの強みを言葉にするお手伝いをします",
    };
  }
  if (score >= 4) {
    return {
      label: "ブランド覚醒前型",
      tag: "眠っている可能性がある",
      tagColor: "#5b7fa6",
      message:
        "まだ「自分らしさ」がブランドとして形になっていない状態です。でも、これは珍しくありません。ほとんどの方がここからスタートします。深いヒアリングで、あなたの中に眠る強みを掘り起こせます。",
      points: [
        "「自分の強み」は自分では気づきにくいもの。外部の目が必要なタイミングです",
        "ターゲットが曖昧なまま発信しても、響く人に届きません",
        "ブランドの土台を作ることで、今後の発信・商品開発がすべて変わります",
      ],
      cta: "ゼロから一緒に整理しましょう",
    };
  }
  return {
    label: "ブランド黎明型",
    tag: "今がいちばんのチャンス",
    tagColor: "#8b5e3c",
    message:
      "まだ何も固まっていないからこそ、正しい方向へ進める余地があります。「反則しなくても売れるブランド」は、最初の一歩の踏み方で決まります。今がいちばん大切なタイミングです。",
    points: [
      "まず「あなたにしかできないこと」を言葉にするところから始めます",
      "ブランドの核心が決まれば、デザインも発信も自然に揃っていきます",
      "初期段階だからこそ、土台を正しく作ることが最大の近道です",
    ],
    cta: "一緒にゼロから作りましょう",
  };
}

const CONTACT_EMAIL = "info@meguri168.com";
const MAX_SCORE = QUESTIONS.length * 3;

export default function DiagnosisPage() {
  const [step, setStep] = useState<number>(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [animating, setAnimating] = useState(false);
  const [visitorEmail, setVisitorEmail] = useState("");
  const [emailError, setEmailError] = useState(false);

  const questionIndex = step - 1;
  const isIntro = step === 0;
  const isResult = step === QUESTIONS.length + 1;
  const currentQ = QUESTIONS[questionIndex];

  const totalScore = answers.reduce((sum, s) => sum + s, 0);
  const result = isResult ? getResult(totalScore) : null;
  const progress = isResult ? 100 : Math.round((questionIndex / QUESTIONS.length) * 100);

  function handleStart() {
    setStep(1);
    setAnswers([]);
    setSelected(null);
  }

  function handleSelect(score: number) {
    if (animating) return;
    setSelected(score);
    setAnimating(true);
    setTimeout(() => {
      const next = [...answers, score];
      setAnswers(next);
      setSelected(null);
      setAnimating(false);
      setStep((s) => s + 1);
    }, 320);
  }

  function handleReset() {
    setStep(0);
    setAnswers([]);
    setSelected(null);
    setVisitorEmail("");
    setEmailError(false);
  }

  function handleApply() {
    if (!visitorEmail.trim() || !visitorEmail.includes("@")) {
      setEmailError(true);
      return;
    }
    setEmailError(false);
    const subject = encodeURIComponent("【ブランド診断より】相談セッションを申し込みます");
    const body = encodeURIComponent(
      `返信先メールアドレス：${visitorEmail}\n診断結果：${result?.label}（スコア: ${totalScore}/${MAX_SCORE}点）\n\n---\nご相談内容（任意）：\n\n`
    );
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  }

  return (
    <div className="min-h-screen bg-[#fafaf8] flex flex-col">
      {/* Header */}
      <header className="border-b border-[#e5e5e0] bg-white">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-[#1a1a2e] tracking-tight">BrandCraft</span>
            <span className="ml-2 text-xs text-[#6b6b6b]">ブランド簡易診断</span>
          </div>
          {!isIntro && !isResult && (
            <span className="text-sm text-[#6b6b6b]">
              {step} / {QUESTIONS.length}
            </span>
          )}
        </div>
        {!isIntro && (
          <div className="h-1 bg-[#e5e5e0]">
            <div
              className="h-1 bg-[#c9a96e] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl">
          {/* Intro */}
          {isIntro && (
            <div className="text-center space-y-8">
              <div className="space-y-3">
                <p className="text-xs font-medium text-[#c9a96e] uppercase tracking-widest">
                  Brand Diagnosis
                </p>
                <h1 className="text-3xl font-bold text-[#1a1a2e] leading-tight">
                  あなたのブランド、<br />今どのステージにいますか？
                </h1>
                <p className="text-[#6b6b6b] leading-relaxed max-w-md mx-auto">
                  6つの質問に答えるだけで、あなたのブランド・商品の現在地と、
                  次のステップが見えてきます。所要時間は約2分です。
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-[#e5e5e0] p-6 text-left space-y-3">
                {[
                  "強みの言語化ができているか",
                  "競合との差別化が明確か",
                  "理想顧客へ届いているか",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#c9a96e]/20 flex items-center justify-center flex-shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#c9a96e]" />
                    </div>
                    <span className="text-sm text-[#1a1a2e]">{item}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleStart}
                className="inline-flex items-center gap-2 bg-[#1a1a2e] text-white px-8 py-3.5 rounded-xl font-medium hover:bg-[#2a2a4e] transition-colors"
              >
                診断をはじめる
                <ChevronRight size={16} />
              </button>
              <p className="text-xs text-[#a0a0a0]">登録不要・約2分</p>
            </div>
          )}

          {/* Question */}
          {!isIntro && !isResult && currentQ && (
            <div className={`space-y-6 transition-opacity duration-200 ${animating ? "opacity-0" : "opacity-100"}`}>
              <div className="space-y-2">
                <p className="text-xs font-medium text-[#c9a96e] uppercase tracking-widest">
                  Question {step}
                </p>
                <h2 className="text-xl font-bold text-[#1a1a2e] leading-snug">
                  {currentQ.question}
                </h2>
              </div>

              <div className="space-y-3">
                {currentQ.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelect(opt.score)}
                    disabled={animating}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-150 ${
                      selected === opt.score
                        ? "border-[#c9a96e] bg-[#c9a96e]/10 text-[#1a1a2e]"
                        : "border-[#e5e5e0] bg-white text-[#1a1a2e] hover:border-[#c9a96e]/50 hover:bg-[#fdf9f4]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 transition-colors ${
                        selected === opt.score ? "border-[#c9a96e] bg-[#c9a96e]" : "border-[#d0d0cc]"
                      }`} />
                      <span className="text-sm leading-relaxed">{opt.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Result */}
          {isResult && result && (
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <p className="text-xs font-medium text-[#c9a96e] uppercase tracking-widest">
                  診断結果
                </p>
                <div className="relative inline-flex items-center justify-center">
                  <svg width="120" height="120" className="-rotate-90">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e5e0" strokeWidth="8" />
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke={result.tagColor}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 50}`}
                      strokeDashoffset={`${2 * Math.PI * 50 * (1 - totalScore / MAX_SCORE)}`}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <p className="text-2xl font-bold text-[#1a1a2e]">{totalScore}</p>
                    <p className="text-xs text-[#6b6b6b]">/ {MAX_SCORE}点</p>
                  </div>
                </div>

                <div>
                  <span
                    className="inline-block text-xs font-medium px-3 py-1 rounded-full mb-2"
                    style={{ backgroundColor: result.tagColor + "22", color: result.tagColor }}
                  >
                    {result.tag}
                  </span>
                  <h2 className="text-2xl font-bold text-[#1a1a2e]">{result.label}</h2>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#e5e5e0] p-6 space-y-4">
                <p className="text-sm text-[#3a3a3a] leading-relaxed">{result.message}</p>
                <div className="border-t border-[#e5e5e0] pt-4 space-y-2.5">
                  <p className="text-xs font-medium text-[#6b6b6b] uppercase tracking-wide">
                    あなたへのヒント
                  </p>
                  {result.points.map((point, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
                        style={{ backgroundColor: result.tagColor }}
                      />
                      <p className="text-sm text-[#3a3a3a] leading-relaxed">{point}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="bg-[#1a1a2e] rounded-2xl p-6 space-y-5">
                <div className="text-center space-y-1">
                  <p className="text-white font-bold text-lg">{result.cta}</p>
                  <p className="text-[#a0a0b8] text-sm">
                    診断結果をもとに、商品づくり・売り方の方向性を整理しませんか？
                  </p>
                </div>

                <div className="flex items-center justify-between bg-white/10 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-white text-sm font-medium">ブランディング相談セッション</p>
                    <p className="text-[#a0a0b8] text-xs mt-0.5">60分 / オンライン or 対面</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#c9a96e] font-bold text-xl">¥9,800</p>
                    <p className="text-[#a0a0b8] text-xs">税込</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-[#a0a0b8]">メールアドレス（返信先）</label>
                  <input
                    type="email"
                    value={visitorEmail}
                    onChange={(e) => { setVisitorEmail(e.target.value); setEmailError(false); }}
                    placeholder="your@email.com"
                    className={`w-full px-3 py-2.5 rounded-xl bg-white/10 text-white placeholder-[#6b6b8a] text-sm focus:outline-none focus:ring-2 transition-colors ${
                      emailError ? "ring-2 ring-red-400" : "focus:ring-[#c9a96e]"
                    }`}
                  />
                  {emailError && (
                    <p className="text-red-400 text-xs">メールアドレスを正しく入力してください</p>
                  )}
                </div>

                <button
                  onClick={handleApply}
                  className="w-full flex items-center justify-center gap-2 bg-[#c9a96e] text-[#1a1a2e] px-8 py-3.5 rounded-xl font-medium hover:bg-[#b89055] transition-colors"
                >
                  <Mail size={16} />
                  相談を申し込む
                </button>
                <p className="text-center text-[#6b6b8a] text-xs">送信後、2営業日以内にご連絡します</p>
              </div>

              <div className="text-center">
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 text-sm text-[#6b6b6b] hover:text-[#1a1a2e] transition-colors"
                >
                  <RotateCcw size={13} />
                  もう一度診断する
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-[#e5e5e0] py-4 text-center">
        <p className="text-xs text-[#a0a0a0]">© BrandCraft — ブランドと商品化の専門家</p>
      </footer>
    </div>
  );
}
