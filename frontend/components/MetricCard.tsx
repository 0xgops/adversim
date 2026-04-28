import type { LucideIcon } from "lucide-react";

type MetricCardProps = {
  label: string;
  value: string | number;
  helper: string;
  icon: LucideIcon;
};

export function MetricCard({ label, value, helper, icon: Icon }: MetricCardProps) {
  return (
    <section className="rounded-md border border-line bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-normal text-ink">{value}</p>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-md bg-slate-100 text-brand">
          <Icon aria-hidden size={20} />
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-600">{helper}</p>
    </section>
  );
}
