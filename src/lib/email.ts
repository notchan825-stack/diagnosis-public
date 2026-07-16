import { Resend } from "resend";

const FROM = process.env.EMAIL_FROM ?? "andsteady <info@andsteady.com>";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key || key.startsWith("re_xxx")) return null;
  return new Resend(key);
}

export async function sendDiagnosisResultEmail(to: string, resultText: string) {
  const resend = getResend();
  if (!resend) throw new Error("RESEND_API_KEY is not configured");

  const html = `
    <div style="font-family: sans-serif; color: #1C2848; max-width: 480px; margin: 0 auto;">
      <p style="font-size: 14px; font-weight: bold; color: #aa2f2f;">あなたへの診断結果</p>
      <p style="font-size: 15px; line-height: 1.8; white-space: pre-wrap;">${resultText}</p>
    </div>
  `;

  return resend.emails.send({
    from: FROM,
    to,
    subject: "【くつ・あし・あるく黄金チェック55診断】あなたの診断結果",
    html,
  });
}
