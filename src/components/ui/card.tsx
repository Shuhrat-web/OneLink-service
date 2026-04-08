import { ReactNode } from "react";

type Props = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
};

export function Card({ title, subtitle, children, actions }: Props) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      {(title || actions) && (
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title ? <h3 className="text-base font-semibold text-zinc-900">{title}</h3> : null}
            {subtitle ? <p className="text-sm text-zinc-500">{subtitle}</p> : null}
          </div>
          {actions}
        </header>
      )}
      {children}
    </section>
  );
}
