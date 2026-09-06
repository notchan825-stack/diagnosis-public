// ひとり社長卒業診断（24項目）— page.tsx（クライアント表示）とAPIルート（サーバー側スコアリング）の共有ロジック
// 出典: コンサル事業資料 09_セルフ診断チェックリスト.md（2026-06-07版）

export const SECTIONS: { title: string; items: string[] }[] = [
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

export const TOTAL = SECTIONS.reduce((n, s) => n + s.items.length, 0);

// 「{セクション番号}-{項目番号}」形式のキー一覧（サーバー側でのバリデーション用）
export const VALID_KEYS = new Set(
  SECTIONS.flatMap((s, si) => s.items.map((_, ii) => `${si}-${ii}`))
);

export interface Tier {
  label: string;
  message: string;
  urgent: boolean;
}

export function tier(count: number): Tier {
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

const CATEGORY_ADVICE: Record<string, string> = {
  事業の現状:
    "売上や商品構成が「なんとなく」で決まっている状態は、頑張っても数字が変わらない一番の原因です。まずは今ある商品・メニューを「入口」「本命」「単価アップ」の3つに分けて整理するだけで、見える景色が変わります。",
  "集客・ブランディング":
    "「いいものを作れば伝わる」という思い込みは、実は一番危険な油断です。あなたの事業を選ぶべき理由を、あなた自身の言葉で一文にできるかどうかが、これからの集客を左右します。",
  "仕組み・スケール":
    "自分がいないと回らない状態は、事業ではなく「あなたの仕事」のままだというサインです。任せられる仕組みがあるかどうかが、次のステージに進めるかの分かれ目になります。",
  "PCスキル・ツール":
    "感覚や紙・スマホだけの管理は、悪いわけではありませんが、事業が大きくなるほど確実に限界がきます。小さな作業からデジタル化していくことで、時間の使い方が変わります。",
  "意識・マインド":
    "「頑張ればなんとかなる」という気持ちは大切ですが、それだけに頼ると、いつまでも同じ場所から動けません。まず必要なのは根性ではなく、設計です。",
};

// チェック率の高いカテゴリ上位2件のアドバイス文（0件のカテゴリは除外）
export function topCategoryAdvice(keys: Iterable<string>, max = 2): string[] {
  const keySet = new Set(keys);
  const ranked = SECTIONS.map((s, si) => {
    const hitCount = s.items.filter((_, ii) => keySet.has(`${si}-${ii}`)).length;
    return { title: s.title, ratio: hitCount / s.items.length, hitCount };
  })
    .filter((r) => r.hitCount > 0)
    .sort((a, b) => b.ratio - a.ratio);

  return ranked.slice(0, max).map((r) => CATEGORY_ADVICE[r.title]).filter(Boolean);
}

export function labelsFromKeys(keys: Iterable<string>): string[] {
  const labels: string[] = [];
  for (const key of keys) {
    const [si, ii] = key.split("-").map(Number);
    const label = SECTIONS[si]?.items[ii];
    if (label) labels.push(label);
  }
  return labels;
}
