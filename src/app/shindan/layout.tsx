import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "なんで忙しいんだろう？がわかる診断",
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
