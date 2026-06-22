import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="border border-dashed border-border/70 rounded-xl bg-card/30 px-6 py-14 text-center flex flex-col items-center">
      <div className="h-14 w-14 rounded-2xl bg-primary/10 ring-1 ring-primary/20 grid place-items-center text-primary mb-4">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      {description ? (
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}