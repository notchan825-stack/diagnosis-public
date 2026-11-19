// Metaピクセルのイベント送信。ピクセル未設定・広告ブロック時は何もしない（お客様体験を止めない）。
type Fbq = (...args: unknown[]) => void;

export function trackMeta(kind: "track" | "trackCustom", name: string, params?: Record<string, unknown>) {
  try {
    const fbq = (window as unknown as { fbq?: Fbq }).fbq;
    if (typeof fbq === "function") fbq(kind, name, params);
  } catch {
    /* 計測の失敗は無視 */
  }
}
