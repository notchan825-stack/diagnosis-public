import type { Metadata } from "next";

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
  return <>{children}</>;
}
