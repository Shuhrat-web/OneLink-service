import { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
};

export function Input({ label, hint, id, className = "", ...props }: Props) {
  return (
    <label className="flex flex-col gap-1.5 text-sm text-zinc-700" htmlFor={id}>
      <span className="font-medium">{label}</span>
      <input id={id} className={`h-10 rounded-md border border-zinc-300 px-3 text-sm outline-none ring-sky-200 transition focus:border-sky-500 focus:ring ${className}`} {...props} />
      {hint ? <span className="text-xs text-zinc-500">{hint}</span> : null}
    </label>
  );
}
