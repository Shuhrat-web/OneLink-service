import Link from "next/link";

type Props = { searchParams: Promise<{ type?: string }> };

const map: Record<string, { title: string; description: string }> = {
  not_found: { title: "Link not found", description: "The smart link does not exist." },
  inactive: { title: "Link disabled", description: "This smart link is currently inactive." },
  expired: { title: "Link expired", description: "This smart link has passed its expiration date." },
  click_limit_reached: { title: "Click limit reached", description: "This smart link reached its maximum allowed clicks." },
};

export default async function PublicStatusPage({ searchParams }: Props) {
  const query = await searchParams;
  const item = map[query.type ?? ""] ?? { title: "Unavailable", description: "This link cannot be opened right now." };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col items-center justify-center px-6 text-center">
      <h1 className="text-2xl font-semibold text-zinc-900">{item.title}</h1>
      <p className="mt-2 text-zinc-600">{item.description}</p>
      <Link className="mt-6 text-sm text-zinc-700 underline" href="/">Back to homepage</Link>
    </main>
  );
}
