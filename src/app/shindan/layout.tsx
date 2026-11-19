import type { Metadata } from "next";
import MetaPixel from "@/components/MetaPixel";

export const metadata: Metadata = {
  title: "毎日忙しいのに　利益が残らないのは、なぜ？",
  description:
    "なんで忙しいんだろう？の原因を探します。５つのチェックで、約１分。",
};

export default function ShindanLayout({
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
