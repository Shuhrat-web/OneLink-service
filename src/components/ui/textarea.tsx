import { TextareaHTMLAttributes } from "react";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
};

export function Textarea({ label, id, className = "", ...props }: Props) {
  return (
    <label className="flex flex-col gap-1.5 text-sm text-zinc-700" htmlFor={id}>
      <span className="font-medium">{label}</span>
      <textarea
        id={id}
        className={`min-h-24 rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none ring-sky-200 transition focus:border-sky-500 focus:ring ${className}`}
        {...props}
      />
    </label>
  );
}
