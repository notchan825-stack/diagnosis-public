import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "くつ・あし・あるく黄金チェック55診断",
  description:
    "靴・足・脚・歩き方・姿勢の55項目をチェックして、あなたの足もとのお悩みを診断します。",
};

export default function AndsteadyCheck55Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
