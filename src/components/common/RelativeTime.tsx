import { useEffect, useState } from "react";
import { tempoRelativo } from "@/store/data-store";

/**
 * Renders a relative time string only on the client to avoid SSR hydration
 * mismatches (server and client computing Date.now() at different moments).
 */
export function RelativeTime({ iso, className }: { iso: string; className?: string }) {
  const [text, setText] = useState<string>("");

  useEffect(() => {
    setText(tempoRelativo(iso));
    const t = setInterval(() => setText(tempoRelativo(iso)), 15000);
    return () => clearInterval(t);
  }, [iso]);

  return (
    <span className={className} suppressHydrationWarning>
      {text || "…"}
    </span>
  );
}