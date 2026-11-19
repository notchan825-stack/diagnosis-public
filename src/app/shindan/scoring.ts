// なんで忙しいんだろう？がわかる診断（ライト診断）
// 2026-11-19 改訂：「あてはまる／少しあてはまる／あてはまらない」の３段階で点をつけ、
// 一番重いタイプを主役に、ほかに重なっている点を添えて返す（旧：チェック数だけで判定→２個以上は全員同じ結果になっていた）。
// 元の正本: コンサル事業/29_再設計案_ライト診断と個別相談_20261101.md の3章（2026-11-02確定）

export type TypeKey = "renraku" | "hasshin" | "joho" | "okane" | "jibun";
export type Score = 0 | 1 | 2;

export const SCORE_OPTIONS: { value: Score; label: string }[] = [
  { value: 2, label: "あてはまる" },
  { value: 1, label: "少しあてはまる" },
  { value: 0, label: "あてはまらない" },
];

export const QUESTIONS: { key: TypeKey; text: string }[] = [
  { key: "renraku", text: "予約の確認・リマインド・キャンセル連絡に、毎週かなり時間を使っている" },
  { key: "hasshin", text: "SNSの投稿づくりに、毎回１時間以上かかっている" },
  { key: "joho", text: "お客さまの情報が、紙・スマホ・頭の中に散らばっている" },
  { key: "okane", text: "忙しいのに、月末にお金が残っている実感がない" },
  { key: "jibun", text: "自分が休むと、お店が止まる" },
];

// あわせて聞く３問（選ぶだけ。結果の「あなたの場合」の一言に使う）
export const PROFILE_QUESTIONS: { key: string; title: string; options: string[] }[] = [
  { key: "gyoshu", title: "業種", options: ["サロン", "飲食", "小売", "スタジオ", "その他"] },
  { key: "yoyaku", title: "予約システムを使っていますか", options: ["はい", "いいえ"] },
  { key: "ninzu", title: "一緒に働いている人は何人ですか", options: ["自分だけ", "１人", "２人以上"] },
];

// 同点のときの優先順（いちばん経営に響く順）
const PRIORITY: TypeKey[] = ["okane", "jibun", "joho", "renraku", "hasshin"];

const TYPES: Record<TypeKey, { label: string; hint: string; example: string; other: string }> = {
  renraku: {
    label: "連絡に追われているタイプ",
    hint: "お客さまとのやりとりに、時間と気持ちを取られているようです。ここは、改善の余地が大きいところです。",
    example: "予約の確認やリマインドは、LINE や予約システムの自動送信にまかせられます。毎回の手打ちをやめるだけで、毎週の時間が戻ってきます。",
    other: "予約・連絡の手間",
  },
  hasshin: {
    label: "発信に時間を取られているタイプ",
    hint: "発信に、思った以上の時間をかけていませんか。フォーマットを決めることで、グッと楽になることがあります。",
    example: "投稿の型（書き出し・中身・締め）を決めて、写真と一言を溜めておくだけで、毎回ゼロから考えなくて済みます。",
    other: "SNS・発信の手間",
  },
  joho: {
    label: "情報が散らばっているタイプ",
    hint: "お客さまの情報が、あちこちにあるようです。まず一か所にまとまるだけで、見える景色が変わります。",
    example: "お客さまの情報の置き場所を、まず一つに決めます。「探す時間」と「聞き直す手間」が、いちばん先に減ります。",
    other: "お客さま情報の散らばり",
  },
  okane: {
    label: "お金の見通しが見えていないタイプ",
    hint: "お金の出と入りを、ちゃんと把握していますか。数字を知ることは、あなたの味方になります。",
    example: "まず、毎月の「入ってくるお金」と「必ず出ていくお金」を、一枚の紙に書き出します。月末の不安の正体が、見えてきます。",
    other: "お金の見通し",
  },
  jibun: {
    label: "自分が止まると止まるタイプ",
    hint: "あなたにばかり仕事が集中しているようです。手を放す方法を整えていきましょう。",
    example: "「自分にしかできない仕事」と「手順にすれば誰でもできる仕事」を分けます。後者を手順書にするところから、手放せます。",
    other: "自分に仕事が集中している",
  },
};

// 業種ごとの言い換え（「あなたの場合」の一言用）
const FIELD_WORDS: Record<string, Partial<Record<TypeKey, string>>> = {
  サロン: { renraku: "予約の確認・リマインド・キャンセルの連絡", joho: "お客さまのカルテや来店の履歴" },
  スタジオ: { renraku: "予約の確認・リマインド・キャンセルの連絡", joho: "会員さまの情報や通われた履歴" },
  飲食: { renraku: "予約・席の確認のお電話", joho: "常連さんの好みや記念日" },
  小売: { renraku: "取り置きや在庫のお問い合わせ", joho: "購入の履歴とお客さまの好み" },
};

export type Result = {
  empty: boolean;
  label: string | null;
  hint: string | null;
  example: string | null;
  level: string | null;
  others: { key: TypeKey; label: string; strong: boolean }[];
  yourCase: string[];
  message: string;
};

const CLOSING = "忙しさの原因は、いくつも複雑に絡み合っています。一度きちんと整理しましょう。";

export function judge(scores: Partial<Record<TypeKey, Score>>, profile: Record<string, string> = {}): Result {
  const get = (k: TypeKey): number => scores[k] ?? 0;
  const total = PRIORITY.reduce((s, k) => s + get(k), 0);

  if (total === 0) {
    return {
      empty: true, label: null, hint: null, example: null, level: null, others: [], yourCase: [],
      message: "基盤ができています。何かご相談の際は是非ご連絡ください。",
    };
  }

  // 点の高い順→同点なら PRIORITY の順
  const ranked = [...PRIORITY].filter((k) => get(k) > 0).sort((a, b) => get(b) - get(a) || PRIORITY.indexOf(a) - PRIORITY.indexOf(b));
  const top = ranked[0];
  const others = ranked.slice(1).map((k) => ({ key: k, label: TYPES[k].other, strong: get(k) === 2 }));

  let level: string;
  if (ranked.length === 1) level = "はっきりしているのは、ここです。ここから整えるのが、いちばん効果が見えやすいところです。";
  else if (total <= 3) level = "気になる点が、小さく重なっています。小さいうちに整えておくと、あとで楽になります。";
  else if (total <= 6) level = "いくつかの項目が、同時に負担になっているようです。全部を一度に直さず、順番をつけて整えるのがコツです。";
  else level = "多くの項目が重なっています。頑張りで回している状態かもしれません。いちばん痛いところから、整理していきましょう。";

  const yourCase: string[] = [];
  const words = FIELD_WORDS[profile.gyoshu ?? ""];
  if (words?.[top]) yourCase.push(`${profile.gyoshu}の場合、「${words[top]}」から見直すのが近道です。`);
  if (profile.yoyaku === "いいえ" && (top === "renraku" || get("renraku") > 0)) {
    yourCase.push("予約システムをまだお使いでなければ、そこを整えるだけで、連絡の手間が大きく減ります。");
  }
  if (profile.ninzu === "自分だけ" && (top === "jibun" || get("jibun") > 0)) {
    yourCase.push("いまは一人で回しているので、全部を手放す前に、「自分しかできない仕事」を決めるところからです。");
  } else if ((profile.ninzu === "１人" || profile.ninzu === "２人以上") && (top === "jibun" || get("jibun") > 0)) {
    yourCase.push("一緒に働く方がいるので、任せ方を整えるだけで、状況が変わります。");
  }

  return {
    empty: false,
    label: TYPES[top].label,
    hint: TYPES[top].hint,
    example: TYPES[top].example,
    level,
    others,
    yourCase,
    message: CLOSING,
  };
}
