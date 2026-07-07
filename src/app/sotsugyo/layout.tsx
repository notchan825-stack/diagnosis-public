import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ひとり社長卒業診断",
  description:
    "24項目のチェックで、あなたの事業の詰まりを3分で確認できます。",
};

export default function SotsugyoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
