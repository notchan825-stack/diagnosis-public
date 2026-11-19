import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ブランド簡易診断 | BrandCraft",
  description:
    "あなたのブランドは今どのステージ？6つの質問で現在地と次のステップがわかります。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
