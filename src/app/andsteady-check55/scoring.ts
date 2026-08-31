import { QUESTIONS, type Category } from './questions'

export type ResultTier = 'gaihanboshi' | 'tako' | 'gaisoku' | 'fallback'

export interface DiagnosisResult {
  tier: ResultTier
  category?: Category
  text: string
}

const GAIHANBOSHI_IDS = new Set(['shoe-08', 'foot-06'])
const TAKO_IDS = new Set(['foot-10'])
const GAISOKU_IDS = new Set([
  'shoe-09', 'foot-07', 'leg-07', 'leg-08', 'leg-09',
])
const KOSHITSU_ONLY_ID = 'foot-11' // 腰痛・膝痛・肩こり

const GAIHANBOSHI_TEXT = `外反母趾は、足の筋力であるアーチの低下がスタートですが、
母趾に負担のかかる歩き方が決定打となります。
歩くたびに母趾を使いすぎることで、骨格の曲がりが起こっていきます。

靴だけでなく、歩行の修正を行うことで、曲がりも痛みも楽になります。

足に筋肉をつけるためには、足指を使って、正しく歩くことが必要です。`

const TAKO_TEXT = `足裏の魚の目は、足裏にバランスよく体重が分散していないということです。
足裏にできたタコは、横アーチが落ちた、開張足の状態ということです。

足に合う靴が、横アーチを作ってくれると、足裏の痛みは格段に楽になります。`

const GAISOKU_TEXT = `足と靴のフィット感が得られにくいことから、外にぶれる歩行クセとなり、
O脚・内反小趾・小指の痛みが進んできたと予想します。

靴が脱げないように日々「無意識」で歩くことは、体にボディブローのようなダメージを与えます。
重心が前に進むだけでなく、内へ外へ左右に揺れながら歩くことで、
そうした足もとのクセの筋肉の付きかたになっていると予想します。`

const KOSHITSU_TEXT = `足裏アーチ、おそらく横アーチも落ちた開張足で、
ぐらつく足をカバーしようと、腰ががんばってしまい、
結果、腰痛や膝痛に繋がっていると思われます。`

const FALLBACK_TEXT: Record<Category, string> = {
  shoe: `靴選びで悩まれているとのこと。
合う靴が見つからない場合には、
靴ではなく、足の問題であるケースも多いのです。

そして、合わない靴選びと歩き方が、足を崩してしまっている可能性も高いです。

足と靴は相性ですので、
おそらく、足に合う靴とともに、痛くならない足づくりを行うことをおすすめします。`,
  foot: `足の形状にお悩みがあるとのこと。偏平足、浮き指、巻き爪など、
足のトラブルのほとんどが「浮き指」からスタートしています。

合わない靴を履くことで、足指は靴が脱げないように動き、浮き指になって、
本来の働きをしないことで、筋力不足となり、開張足となります。

筋肉は何歳からでもつけられますので、
まずは足指がしっかり使える靴環境を整えることが第一歩です。`,
  leg: `むくみやだるさ、脚の太さといったお悩みは、実は「歩き方」に原因があることが多いです。
正しく歩くことで、むくみや冷えが解消され、代謝があがっていくのです。

それは、靴が脱げないように無意識に歩いていると、
足指～足裏～ふくらはぎ～太もも～お尻が連動して動かず、
血を巡らせるポンプがうまく働かないからです。

まずは脂肪ではなく、余計な水分を脚から追い出す「歩き方」を身に着けることをおすすめします。`,
  walk: `歩くことにお悩みがあるとのこと。
歩くとすぐ疲れる、音が気になる、つまづきやすいといったことは、
足が本来の働きをしていないサインです。

歩き方を習ったことのある日本人は１割もいません。
そして、長年の歩き方のクセは１日ではなおりません。

ですからまず、自分の歩きかたを自覚するところからはじめましょう。`,
  posture: `姿勢にお悩みがあるとのこと。

猫背や反り腰、重心の置き場所に迷うといったことは、
実は足もとの不安定さに原因があることが多いです。

ぐらつく足をカバーしようと、体の他の部分ががんばってしまう。
結果、姿勢の崩れに繋がっていく。

実は、背筋から遠い足もとを整えることが、姿勢改善の一番の近道なのです。`,
}

const CATEGORY_TIEBREAK_ORDER: Category[] = ['shoe', 'foot', 'leg', 'walk', 'posture']

export function diagnose(checkedIds: Set<string>): DiagnosisResult {
  const has = (ids: Set<string>) => [...ids].some((id) => checkedIds.has(id))

  if (has(GAIHANBOSHI_IDS)) {
    return { tier: 'gaihanboshi', text: GAIHANBOSHI_TEXT }
  }
  if (has(TAKO_IDS)) {
    return { tier: 'tako', text: TAKO_TEXT }
  }
  if (has(GAISOKU_IDS)) {
    return { tier: 'gaisoku', text: GAISOKU_TEXT }
  }
  if (checkedIds.has(KOSHITSU_ONLY_ID)) {
    return { tier: 'gaisoku', text: KOSHITSU_TEXT }
  }

  const counts: Record<Category, number> = { shoe: 0, foot: 0, leg: 0, walk: 0, posture: 0 }
  for (const q of QUESTIONS) {
    if (checkedIds.has(q.id)) counts[q.category]++
  }
  let winner: Category = 'shoe'
  let max = -1
  for (const cat of CATEGORY_TIEBREAK_ORDER) {
    if (counts[cat] > max) {
      max = counts[cat]
      winner = cat
    }
  }
  return { tier: 'fallback', category: winner, text: FALLBACK_TEXT[winner] }
}
