import { cn } from "@/lib/utils";

export function StatusBadge({ online }: { online: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1",
        online
          ? "bg-[color:var(--color-success)]/15 text-[color:var(--color-success)] ring-[color:var(--color-success)]/30"
          : "bg-destructive/15 text-destructive ring-destructive/30",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          online ? "bg-[color:var(--color-success)] animate-pulse" : "bg-destructive",
        )}
      />
      {online ? "Online" : "Offline"}
    </span>
  );
}