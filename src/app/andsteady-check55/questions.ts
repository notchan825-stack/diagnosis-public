export type Category = 'shoe' | 'foot' | 'leg' | 'walk' | 'posture'

export interface Question {
  id: string
  label: string
  category: Category
}

export const QUESTIONS: Question[] = [
  // ■くつチェック（14項目）
  { id: 'shoe-01', label: '靴の選び方がわからない', category: 'shoe' },
  { id: 'shoe-02', label: '左右で大きさが違う', category: 'shoe' },
  { id: 'shoe-03', label: '踵が脱げる', category: 'shoe' },
  { id: 'shoe-04', label: '甲高幅広で靴がない', category: 'shoe' },
  { id: 'shoe-05', label: '甲薄幅狭で靴がない', category: 'shoe' },
  { id: 'shoe-06', label: '足が大きくて靴がない', category: 'shoe' },
  { id: 'shoe-07', label: '足が小さくて靴がない', category: 'shoe' },
  { id: 'shoe-08', label: '外反母趾で靴がない', category: 'shoe' },
  { id: 'shoe-09', label: '小指がいつも痛くなる', category: 'shoe' },
  { id: 'shoe-10', label: '足裏の中央が痛くなる', category: 'shoe' },
  { id: 'shoe-11', label: '踵が靴擦れを起こす', category: 'shoe' },
  { id: 'shoe-12', label: '甲が痛くなる', category: 'shoe' },
  { id: 'shoe-13', label: 'すねの外が痛くなる', category: 'shoe' },
  { id: 'shoe-14', label: '特に問題を感じない', category: 'shoe' },
  // ■あし（FOOT）チェック（11項目）
  { id: 'foot-01', label: '開張足・開帳足', category: 'foot' },
  { id: 'foot-02', label: '偏平足・扁平足', category: 'foot' },
  { id: 'foot-03', label: 'こんにゃく足', category: 'foot' },
  { id: 'foot-04', label: '浮き指', category: 'foot' },
  { id: 'foot-05', label: 'ハンマートゥ', category: 'foot' },
  { id: 'foot-06', label: '外反母趾', category: 'foot' },
  { id: 'foot-07', label: '内反小趾・寝指', category: 'foot' },
  { id: 'foot-08', label: '巻き爪・爪の変形', category: 'foot' },
  { id: 'foot-09', label: '外反足', category: 'foot' },
  { id: 'foot-10', label: 'タコ・魚の目', category: 'foot' },
  { id: 'foot-11', label: '腰痛・膝痛・肩こり', category: 'foot' },
  // ■あし（LEG）チェック（11項目）
  { id: 'leg-01', label: 'いつも脚がむくんでいる', category: 'leg' },
  { id: 'leg-02', label: 'ふくらはぎがだるい', category: 'leg' },
  { id: 'leg-03', label: '脚が太い', category: 'leg' },
  { id: 'leg-04', label: '脚が冷えている', category: 'leg' },
  { id: 'leg-05', label: '上半身に比べて、下半身が太っている', category: 'leg' },
  { id: 'leg-06', label: 'ししゃも脚', category: 'leg' },
  { id: 'leg-07', label: 'O脚', category: 'leg' },
  { id: 'leg-08', label: 'XO脚', category: 'leg' },
  { id: 'leg-09', label: 'X脚', category: 'leg' },
  { id: 'leg-10', label: '内また', category: 'leg' },
  { id: 'leg-11', label: '太ももの前に筋肉がつく', category: 'leg' },
  // ■あるくチェック（15項目）
  { id: 'walk-01', label: '歩くとすぐに疲れる', category: 'walk' },
  { id: 'walk-02', label: '歩くと足が痛くなる', category: 'walk' },
  { id: 'walk-03', label: '歩くのが遅い', category: 'walk' },
  { id: 'walk-04', label: 'ヒールでうまく歩けない', category: 'walk' },
  { id: 'walk-05', label: '何もないのによくつまづく', category: 'walk' },
  { id: 'walk-06', label: 'スネが張る', category: 'walk' },
  { id: 'walk-07', label: '雨の日に歩くと服が汚れる', category: 'walk' },
  { id: 'walk-08', label: 'お尻が垂れている', category: 'walk' },
  { id: 'walk-09', label: '歩く音が大きい', category: 'walk' },
  { id: 'walk-10', label: '靴がすぐ壊れる', category: 'walk' },
  { id: 'walk-11', label: '歩くとペタペタ音がする', category: 'walk' },
  { id: 'walk-12', label: '歩くとスリスリ音がする', category: 'walk' },
  { id: 'walk-13', label: '歩くとドタドタ音がうるさい', category: 'walk' },
  { id: 'walk-14', label: '左右に揺れる', category: 'walk' },
  { id: 'walk-15', label: '泥はねする', category: 'walk' },
  // ■姿勢チェック（4項目）
  { id: 'posture-01', label: '重心の置き場所に悩む', category: 'posture' },
  { id: 'posture-02', label: '立つと踵と踵が離れている', category: 'posture' },
  { id: 'posture-03', label: '猫背', category: 'posture' },
  { id: 'posture-04', label: '反り腰', category: 'posture' },
]
