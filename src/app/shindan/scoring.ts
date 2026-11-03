// なんで忙しいんだろう？がわかる診断（ライト診断）
// 正本: コンサル事業/29_再設計案_ライト診断と個別相談_20261101.md の3章（2026-11-02確定）

export type TypeKey = "renraku" | "hasshin" | "joho" | "okane" | "jibun";

export const QUESTIONS: { key: TypeKey; text: string }[] = [
  { key: "renraku", text: "予約の確認・リマインド・キャンセル連絡に、毎週かなり時間を使っている" },
  { key: "hasshin", text: "SNSの投稿づくりに、毎回１時間以上かかっている" },
  { key: "joho", text: "お客さまの情報が、紙・スマホ・頭の中に散らばっている" },
  { key: "okane", text: "忙しいのに、月末にお金が残っている実感がない" },
  { key: "jibun", text: "自分が休むと、お店が止まる" },
];

// あわせて聞く３問（選ぶだけ・結果には影響しない）
export const PROFILE_QUESTIONS: { key: string; title: string; options: string[] }[] = [
  { key: "gyoshu", title: "業種", options: ["サロン", "飲食", "小売", "スタジオ", "その他"] },
  { key: "yoyaku", title: "予約システムを使っていますか", options: ["はい", "いいえ"] },
  { key: "ninzu", title: "一緒に働いている人は何人ですか", options: ["自分だけ", "１人", "２人以上"] },
];

export type Result = { label: string | null; hint: string | null; message: string };

const HINTS: Record<TypeKey, { label: string; hint: string }> = {
  renraku: {
    label: "連絡に追われているタイプ",
    hint: "お客さまとのやりとりに、時間と気持ちを取られているようです。ここは、改善の余地が大きいところです。",
  },
  hasshin: {
    label: "発信に時間を取られているタイプ",
    hint: "発信に、思った以上の時間をかけていませんか。フォーマットを決めることで、グッと楽になることがあります。",
  },
  joho: {
    label: "情報が散らばっているタイプ",
    hint: "お客さまの情報が、あちこちにあるようです。まず一か所にまとまるだけで、見える景色が変わります。",
  },
  okane: {
    label: "お金の見通しが見えていないタイプ",
    hint: "お金の出と入りを、ちゃんと把握していますか。数字を知ることは、あなたの味方になります。",
  },
  jibun: {
    label: "自分が止まると止まるタイプ",
    hint: "あなたにばかり仕事が集中しているようです。手を放す方法を整えていきましょう。",
  },
};

export const CLOSING =
  "忙しさの原因は、いくつも複雑に絡み合っています。一度きちんと整理しましょう。";

export function judge(checked: Set<TypeKey>): Result {
  if (checked.size === 0) {
    return {
      label: null,
      hint: null,
      message: "基盤ができています。何かご相談の際は是非ご連絡ください。",
    };
  }
  if (checked.size === 1) {
    const k = [...checked][0];
    return { label: HINTS[k].label, hint: HINTS[k].hint, message: CLOSING };
  }
  return {
    label: "あれもこれも重なっているタイプ",
    hint: null,
    message: CLOSING,
  };
}
