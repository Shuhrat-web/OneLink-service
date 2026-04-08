import { Card } from "@/components/ui/card";

export function StatsCards({ items }: { items: Array<{ label: string; value: string | number }> }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label}>
          <p className="text-sm text-zinc-500">{item.label}</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-900">{item.value}</p>
        </Card>
      ))}
    </div>
  );
}
