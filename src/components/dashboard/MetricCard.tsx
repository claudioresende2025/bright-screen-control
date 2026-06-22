import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  icon: Icon,
  tone = "default",
  hint,
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  tone?: "default" | "success" | "destructive" | "primary";
  hint?: string;
}) {
  const toneClasses = {
    default: "text-foreground bg-muted/40 ring-border",
    primary: "text-primary bg-primary/10 ring-primary/30",
    success:
      "text-[color:var(--color-success)] bg-[color:var(--color-success)]/10 ring-[color:var(--color-success)]/30",
    destructive: "text-destructive bg-destructive/10 ring-destructive/30",
  }[tone];

  return (
    <Card className="bg-card/70 border-border/60">
      <CardContent className="p-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="text-3xl font-semibold mt-2 tabular-nums">{value}</p>
          {hint ? <p className="text-xs text-muted-foreground mt-1">{hint}</p> : null}
        </div>
        <div className={cn("h-10 w-10 rounded-xl grid place-items-center ring-1", toneClasses)}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}