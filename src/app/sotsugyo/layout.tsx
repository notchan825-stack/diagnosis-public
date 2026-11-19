import type { Metadata } from "next";
import MetaPixel from "@/components/MetaPixel";

export const metadata: Metadata = {
  title: "あなたのお仕事棚卸診断",
  description:
    "24項目のチェックで、あなたの事業の詰まりを3分で確認できます。",
};

export default function SotsugyoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Metaピクセルは、広告の飛び先の診断ページだけに入れる（メールアドレスがURLに入る /andsteady-check55 などへは入れない）
  return (
    <>
      <MetaPixel />
      {children}
    </>
  );
}
