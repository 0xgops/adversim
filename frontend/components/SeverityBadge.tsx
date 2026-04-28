import clsx from "clsx";

const styles: Record<string, string> = {
  info: "border-zinc-500/25 bg-white/5 text-zinc-300",
  low: "border-cobalt/30 bg-cobalt/10 text-cobalt",
  medium: "border-lime/35 bg-lime/10 text-lime",
  high: "border-orange-400/35 bg-orange-400/10 text-orange-300",
  critical: "border-crimson/40 bg-crimson/10 text-crimson",
  Low: "border-cobalt/30 bg-cobalt/10 text-cobalt",
  Medium: "border-lime/35 bg-lime/10 text-lime",
  High: "border-orange-400/35 bg-orange-400/10 text-orange-300",
  Critical: "border-crimson/40 bg-crimson/10 text-crimson"
};

export function SeverityBadge({ severity }: { severity: string }) {
  return (
    <span
      className={clsx(
        "inline-flex h-7 items-center rounded-md border px-2 text-xs font-semibold",
        "technical uppercase tracking-[0.16em]",
        styles[severity] ?? styles.info
      )}
    >
      {severity}
    </span>
  );
}
