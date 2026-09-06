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

// ひとり社長卒業診断（コンサル事業・小野崎記子個人）のリード。
// andsteady-check55のシートとは別タブに記録する（andsteady顧客動線と混ぜない方針のため）。
const SOTSUGYO_SHEET_NAME = "ひとり社長診断";

async function ensureSotsugyoSheetExists(
  sheets: ReturnType<typeof getSheetsClient>
) {
  if (!sheets || !SPREADSHEET_ID) return;
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const exists = meta.data.sheets?.some(
    (s) => s.properties?.title === SOTSUGYO_SHEET_NAME
  );
  if (exists) return;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: [{ addSheet: { properties: { title: SOTSUGYO_SHEET_NAME } } }],
    },
  });
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SOTSUGYO_SHEET_NAME}!A1:E1`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [["日時", "お名前", "メールアドレス", "チェック項目", "診断結果"]],
    },
  });
}

export async function appendSotsugyoRow(
  name: string,
  email: string,
  checkedLabels: string[],
  resultLabel: string
) {
  const sheets = getSheetsClient();
  if (!sheets || !SPREADSHEET_ID) {
    throw new Error("Google Sheets is not configured");
  }

  await ensureSotsugyoSheetExists(sheets);

  const now = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SOTSUGYO_SHEET_NAME}!A:E`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[now, name, email, checkedLabels.join("、"), resultLabel]],
    },
  });
}
