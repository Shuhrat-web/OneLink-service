import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  tone?: "green" | "red" | "amber" | "blue" | "gray";
};

const toneMap: Record<NonNullable<Props["tone"]>, string> = {
  green: "bg-emerald-50 text-emerald-700 border-emerald-200",
  red: "bg-rose-50 text-rose-700 border-rose-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  blue: "bg-sky-50 text-sky-700 border-sky-200",
  gray: "bg-zinc-50 text-zinc-700 border-zinc-200",
};

export function Badge({ children, tone = "gray" }: Props) {
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${toneMap[tone]}`}>{children}</span>;
}
