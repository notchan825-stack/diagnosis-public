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

  // RAW指定: 呼び出し元(APIルート)で resultLabel は固定文言のみに絞っているが、
  // ここでも念のため数式として解釈させない(スプレッドシート数式インジェクション対策の二重化)。
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SOTSUGYO_VIEW_SHEET}!A:C`,
      valueInputOption: "RAW",
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
      valueInputOption: "RAW",
      requestBody: {
        values: [["日時", "チェック数", "結果タイプ"], ...row],
      },
    });
  }
}

export interface SotsugyoViewRow {
  viewedAt: string;
  checkedCount: number;
  resultLabel: string;
}

// sotsugyo_viewsタブを丸ごと読み出す（管理者専用エンドポイントからのみ呼ばれる想定）。
// タブ自体が未作成（＝まだ1件も記録がない）場合は空配列を返す。
export async function getSotsugyoViewRows(): Promise<SotsugyoViewRow[]> {
  const sheets = getSheetsClient();
  if (!sheets || !SPREADSHEET_ID) {
    throw new Error("Google Sheets is not configured");
  }

  let rows: unknown[][];
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SOTSUGYO_VIEW_SHEET}!A:C`,
    });
    rows = res.data.values ?? [];
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (/Unable to parse range|not found/i.test(message)) return [];
    throw err;
  }

  return rows
    .filter((row) => row[0] !== "日時") // ヘッダー行を除外
    .map((row) => ({
      viewedAt: String(row[0] ?? ""),
      checkedCount: Number(row[1]) || 0,
      resultLabel: String(row[2] ?? ""),
    }))
    .filter((r) => r.viewedAt);
}

// 2026-09-24の実装検証時にマッキーが送ったテスト行だけを狙い撃ちで削除する。
// 見分け方: ラベルが "deploy-check" / "#ERROR!" / "デプロイ確認テスト" を含む、
// またはチェック数が999（設問数TOTALを超える、実際のお客様にはありえない値）。
// 該当しない行（実際のお客様の閲覧記録）には一切触れない。1回限りの後始末用。
export async function deleteTestSotsugyoViewRows(): Promise<{ deleted: number }> {
  const sheets = getSheetsClient();
  if (!sheets || !SPREADSHEET_ID) {
    throw new Error("Google Sheets is not configured");
  }

  const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const sheet = meta.data.sheets?.find((s) => s.properties?.title === SOTSUGYO_VIEW_SHEET);
  if (!sheet || sheet.properties?.sheetId == null) return { deleted: 0 };
  const sheetId = sheet.properties.sheetId;

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SOTSUGYO_VIEW_SHEET}!A:C`,
  });
  const rows = res.data.values ?? [];

  const isTestRow = (row: unknown[]) => {
    const label = String(row[2] ?? "");
    const count = Number(row[1]);
    const viewedAt = String(row[0] ?? "");
    return (
      label === "deploy-check" ||
      label.includes("デプロイ確認テスト") ||
      label === "#ERROR!" ||
      count === 999 ||
      // 2026-09-25追記: 最終動作確認で送った3件(2026/9/24 11:47:12・11:47:13・11:48:16)は
      // 上のパターンに一致しない「正常に見えるテスト値」だったため、時刻を直接指定して除外する。
      // それ以外の本物の閲覧記録(同日23:51:01等)には触れない。
      viewedAt === "2026/9/24 11:47:12" ||
      viewedAt === "2026/9/24 11:47:13" ||
      viewedAt === "2026/9/24 11:48:16"
    );
  };

  const rowIndicesToDelete: number[] = [];
  rows.forEach((row, i) => {
    if (i === 0 && row[0] === "日時") return; // ヘッダー行は残す
    if (isTestRow(row)) rowIndicesToDelete.push(i);
  });

  if (rowIndicesToDelete.length === 0) return { deleted: 0 };

  // 後ろの行から削除しないと、削除のたびに残り行のインデックスがズレる
  const requests = rowIndicesToDelete
    .sort((a, b) => b - a)
    .map((i) => ({
      deleteDimension: {
        range: { sheetId, dimension: "ROWS" as const, startIndex: i, endIndex: i + 1 },
      },
    }));

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: { requests },
  });

  return { deleted: rowIndicesToDelete.length };
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
