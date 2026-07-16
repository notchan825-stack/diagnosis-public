import { NextResponse } from "next/server";
import { sendDiagnosisResultEmail } from "@/lib/email";

export async function POST(request: Request) {
  const { email, resultText } = await request.json();

  if (!email || typeof email !== "string" || !resultText || typeof resultText !== "string") {
    return NextResponse.json({ error: "email and resultText are required" }, { status: 400 });
  }

  try {
    await sendDiagnosisResultEmail(email, resultText);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("send-diagnosis-result failed", err);
    return NextResponse.json({ error: "failed to send email" }, { status: 500 });
  }
}
