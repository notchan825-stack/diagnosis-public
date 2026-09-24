import { google } from "googleapis";

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
const CLIENT_EMAIL = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, "\n");

function getSheetsClient() {
  if (!SPREADSHEET_ID || !CLIENT_EMAIL || !PRIVATE_KEY) return null;
  const auth = new google.auth.JWT({
    email: CLIENT_EMAIL,
    key: PRIVATE_KEY,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

export interface DiagnosisRow {
  submittedAt: string;
  email: string;
  checkedLabels: string;
  resultSummary: string;
}

// 診断結果を記録したシートを丸ごと読み出す。オートビズ等へのメルマガリスト
// 取り込み用（管理者専用エンドポイントからのみ呼ばれる想定）。
export async function getDiagnosisRows(): Promise<DiagnosisRow[]> {
  const sheets = getSheetsClient();
  if (!sheets || !SPREADSHEET_ID) {
    throw new Error("Google Sheets is not configured");
  }

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "A:D",
  });

  const rows = res.data.values ?? [];
  return rows
    .map((row) => ({
      submittedAt: row[0] ?? "",
      email: row[1] ?? "",
      checkedLabels: row[2] ?? "",
      resultSummary: row[3] ?? "",
    }))
    // ヘッダー行や空行を除外（emailが実在の形式のものだけ残す）
    .filter((r) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email));
}

const SOTSUGYO_VIEW_SHEET = "sotsugyo_views";

// アナログ社長卒業診断(/sotsugyo)の「結果を見た」回数を記録する専用タブ。
// 個人情報は取っていない画面のため、匿名でタイムスタンプ・チェック数・結果ラベルのみ記録する。
export async function appendSotsugyoViewRow(checkedCount: number, resultLabel: string) {
  const sheets = getSheetsClient();
  if (!sheets || !SPREADSHEET_ID) {
    throw new Error("Google Sheets is not configured");
  }

  const now = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
  const row = [[now, checkedCount, resultLabel]];

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SOTSUGYO_VIEW_SHEET}!A:C`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: row },
    });
  } catch (err) {
    // タブが未作成だと "Unable to parse range" 相当のエラーになる。
    // その場合だけタブを新規作成し、ヘッダー行込みで作り直してから1回だけ再試行する。
    const message = err instanceof Error ? err.message : String(err);
    if (!/Unable to parse range|not found/i.test(message)) throw err;

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [{ addSheet: { properties: { title: SOTSUGYO_VIEW_SHEET } } }],
      },
    });

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SOTSUGYO_VIEW_SHEET}!A:C`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [["日時", "チェック数", "結果タイプ"], ...row],
      },
    });
  }
}

export async function appendDiagnosisRow(
  email: string,
  checkedLabels: string[],
  resultSummary: string
) {
  const sheets = getSheetsClient();
  if (!sheets || !SPREADSHEET_ID) {
    throw new Error("Google Sheets is not configured");
  }

  const now = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: "A:D",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[now, email, checkedLabels.join("、"), resultSummary]],
    },
  });
}
