import { ArrowDown, ArrowUp, Film, Image as ImageIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useData, formatarTamanho } from "@/store/data-store";
import type { MidiaPlaylist } from "@/types/database";
import { toast } from "sonner";

export function MidiaListItem({
  midia,
  isFirst,
  isLast,
}: {
  midia: MidiaPlaylist;
  isFirst: boolean;
  isLast: boolean;
}) {
  const { reordenarMidia, removerMidia, atualizarDuracaoMidia } = useData();

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card/50 p-3 hover:border-primary/40 transition-colors">
      <div className="flex flex-col gap-0.5">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          disabled={isFirst}
          onClick={() => reordenarMidia(midia.id, "up")}
        >
          <ArrowUp className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          disabled={isLast}
          onClick={() => reordenarMidia(midia.id, "down")}
        >
          <ArrowDown className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-md bg-muted ring-1 ring-border">
        {midia.tipo_midia === "image" ? (
          <img src={midia.url_arquivo} alt={midia.nome_arquivo} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full grid place-items-center bg-gradient-to-br from-primary/20 to-primary/5 text-primary">
            <Film className="h-6 w-6" />
          </div>
        )}
        <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1 text-[9px] font-medium text-white uppercase tracking-wider">
          {midia.tipo_midia === "image" ? "IMG" : "VID"}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {midia.tipo_midia === "image" ? (
            <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <Film className="h-3.5 w-3.5 text-muted-foreground" />
          )}
          <p className="text-sm font-medium truncate">{midia.nome_arquivo}</p>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {formatarTamanho(midia.tamanho_bytes)}
          {midia.tipo_midia === "video" ? ` · ${midia.duracao_segundos}s` : ""}
        </p>
      </div>

      {midia.tipo_midia === "image" ? (
        <div className="flex items-center gap-1.5">
          <Input
            type="number"
            min={1}
            max={300}
            value={midia.duracao_segundos}
            onChange={(e) => {
              const v = Math.max(1, Number(e.target.value) || 1);
              atualizarDuracaoMidia(midia.id, v);
            }}
            className="w-20 h-8 text-sm"
          />
          <span className="text-xs text-muted-foreground">s</span>
        </div>
      ) : null}

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-destructive"
        onClick={async () => {
          await removerMidia(midia.id);
          toast.success("Mídia removida");
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}