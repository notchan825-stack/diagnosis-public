import { Resend } from "resend";

const FROM = process.env.EMAIL_FROM ?? "andsteady <info@andsteady.com>";
const LOGO_URL = "https://diagnosis-public.vercel.app/andsteady-logo.png";
const RESERVATION_URL = "https://andsteady.com/reservation";
const NAVY = "#1C2848";
const RED = "#aa2f2f";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key || key.startsWith("re_xxx")) return null;
  return new Resend(key);
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendDiagnosisResultEmail(to: string, resultText: string) {
  const resend = getResend();
  if (!resend) throw new Error("RESEND_API_KEY is not configured");

  const html = `
<!doctype html>
<html lang="ja">
  <body style="margin:0; padding:0; background-color:#f4f4f5; font-family: -apple-system, 'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5; padding: 32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px; width:100%;">

            <tr>
              <td align="center" style="padding-bottom: 24px;">
                <img src="${LOGO_URL}" alt="andsteady" width="150" style="display:block;" />
              </td>
            </tr>

            <tr>
              <td align="center" style="padding-bottom: 24px;">
                <h1 style="margin:0; font-size:20px; font-weight:bold; color:${NAVY}; line-height:1.5;">
                  くつ・あし・あるく黄金チェック55診断
                </h1>
              </td>
            </tr>

            <tr>
              <td style="background-color:#ffffff; border:1px solid rgba(28,40,72,0.1); border-radius:16px; padding:24px; box-shadow:0 1px 3px rgba(0,0,0,0.06);">
                <p style="margin:0 0 12px 0; font-size:14px; font-weight:bold; color:${RED};">あなたへの診断結果</p>
                <p style="margin:0; font-size:15px; line-height:1.8; color:${NAVY}; white-space:pre-wrap;">${escapeHtml(resultText)}</p>
              </td>
            </tr>

            <tr><td style="height:16px;"></td></tr>

            <tr>
              <td align="center" style="background-color:#ffffff; border:1px solid rgba(28,40,72,0.1); border-radius:16px; padding:24px; box-shadow:0 1px 3px rgba(0,0,0,0.06);">
                <p style="margin:0 0 16px 0; font-size:14px; line-height:1.8; color:${NAVY};">
                  足に合う靴に履き替え、正しい歩き方に修正することで、<br />
                  足もとだけでない不定愁訴が解消することも多くあります。
                </p>
                <a href="${RESERVATION_URL}" style="display:inline-block; background-color:${RED}; color:#ffffff; font-size:14px; font-weight:bold; text-decoration:none; padding:14px 32px; border-radius:999px;">
                  ご予約はこちら
                </a>
              </td>
            </tr>

            <tr><td style="height:32px;"></td></tr>

            <tr>
              <td align="center" style="font-size:12px; line-height:1.8; color:rgba(28,40,72,0.6);">
                くつ・あし・あるく研究所アンド・ステディ<br />
                <a href="mailto:info@andsteady.com" style="color:rgba(28,40,72,0.6);">info@andsteady.com</a><br />
                <a href="https://www.instagram.com/andsteady/" style="color:rgba(28,40,72,0.6);">Instagram</a><br />
                <a href="https://www.youtube.com/@andsteadytokyo" style="color:rgba(28,40,72,0.6);">YouTube</a>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `;

  return resend.emails.send({
    from: FROM,
    to,
    bcc: "info@andsteady.com",
    subject: "【くつ・あし・あるく黄金チェック55診断】あなたの診断結果",
    html,
  });
}

// ひとり社長卒業診断（コンサル事業・小野崎記子個人）の詳細診断メール。
// andsteadyロゴ・ブランド文言は使わず、個人の言葉として送る。
// ※送信ドメインはandsteady.comのみRESEND側で検証済みのため、表示名のみ変えて暫定運用。
// 専用ドメインを用意でき次第、FROM_SOTSUGYOをそちらに差し替えるとよい。
const FROM_SOTSUGYO = process.env.EMAIL_FROM_SOTSUGYO ?? "おのざきのりこ <info@andsteady.com>";

export async function sendSotsugyoDetailEmail(
  to: string,
  name: string,
  tierLabel: string,
  tierMessage: string,
  adviceParagraphs: string[]
) {
  const resend = getResend();
  if (!resend) throw new Error("RESEND_API_KEY is not configured");

  const adviceHtml = adviceParagraphs
    .map(
      (p) =>
        `<tr><td style="padding:16px 0; border-top:1px solid rgba(28,40,72,0.08); font-size:14px; line-height:1.9; color:${NAVY};">${escapeHtml(p)}</td></tr>`
    )
    .join("");

  const html = `
<!doctype html>
<html lang="ja">
  <body style="margin:0; padding:0; background-color:#f4f4f5; font-family: -apple-system, 'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5; padding: 32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px; width:100%;">

            <tr>
              <td align="center" style="padding-bottom: 24px;">
                <p style="margin:0; font-size:12px; font-weight:bold; letter-spacing:0.05em; color:#b45309;">専門家オーナーのための</p>
                <h1 style="margin:8px 0 0; font-size:20px; font-weight:bold; color:${NAVY};">ひとり社長卒業診断</h1>
              </td>
            </tr>

            <tr>
              <td style="background-color:#ffffff; border:1px solid rgba(28,40,72,0.1); border-radius:16px; padding:24px; box-shadow:0 1px 3px rgba(0,0,0,0.06);">
                <p style="margin:0 0 8px 0; font-size:14px; color:${NAVY};">${escapeHtml(name)} 様</p>
                <p style="margin:0 0 16px 0; font-size:13px; line-height:1.8; color:rgba(28,40,72,0.7);">
                  診断へのご回答、ありがとうございました。あなたの回答をもとにした、詳しい診断結果をお届けします。
                </p>
                <p style="margin:0 0 4px 0; font-size:13px; color:rgba(28,40,72,0.6);">総合判定</p>
                <p style="margin:0 0 12px 0; font-size:18px; font-weight:bold; color:#b45309;">${escapeHtml(tierLabel)}</p>
                <p style="margin:0; font-size:14px; line-height:1.8; color:${NAVY};">${escapeHtml(tierMessage)}</p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${adviceHtml}</table>
              </td>
            </tr>

            <tr><td style="height:16px;"></td></tr>

            <tr>
              <td align="center" style="background-color:#1C2848; border-radius:16px; padding:24px;">
                <p style="margin:0 0 16px 0; font-size:14px; line-height:1.8; color:#ffffff;">
                  10月20日(火)・10月25日(日)、ひとり社長の仕組化支援セミナーを開催します。
                </p>
                <a href="https://meguri168.com/shikumika-seminar" style="display:inline-block; background-color:#f59e0b; color:#1C2848; font-size:14px; font-weight:bold; text-decoration:none; padding:14px 32px; border-radius:999px;">
                  セミナーの詳細を見る
                </a>
              </td>
            </tr>

            <tr><td style="height:16px;"></td></tr>

            <tr>
              <td align="center">
                <a href="https://note.com/onozaki_noriko/n/n8379446cf997" style="font-size:13px; color:rgba(28,40,72,0.6);">個別相談について見てみる →</a>
              </td>
            </tr>

            <tr><td style="height:32px;"></td></tr>

            <tr>
              <td align="center" style="font-size:12px; line-height:1.8; color:rgba(28,40,72,0.5);">
                おのざきのりこ
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `;

  return resend.emails.send({
    from: FROM_SOTSUGYO,
    to,
    subject: "【ひとり社長卒業診断】あなたの詳しい診断結果をお届けします",
    html,
  });
}
