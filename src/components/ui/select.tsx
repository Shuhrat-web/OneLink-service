import { SelectHTMLAttributes } from "react";

type Props = SelectHTMLAttributes<HTMLSelectElement> & { label: string };

export function Select({ label, id, children, className = "", ...props }: Props) {
  return (
    <label className="flex flex-col gap-1.5 text-sm text-zinc-700" htmlFor={id}>
      <span className="font-medium">{label}</span>
      <select
        id={id}
        className={`h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none ring-sky-200 transition focus:border-sky-500 focus:ring ${className}`}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}
