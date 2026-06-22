import { Monitor, MoreVertical, Trash2, Wifi } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";
import { useData } from "@/store/data-store";
import { RelativeTime } from "@/components/common/RelativeTime";
import type { Dispositivo } from "@/types/database";
import { toast } from "sonner";

export function DispositivoCard({ dispositivo }: { dispositivo: Dispositivo }) {
  const { clientes, playlists, trocarPlaylistDoDispositivo, removerDispositivo } = useData();
  const cliente = clientes.find((c) => c.id === dispositivo.cliente_id);

  return (
    <Card className="group bg-card/70 border-border/60 hover:border-primary/40 hover:shadow-[0_8px_30px_-12px_rgba(82,130,255,0.35)] transition-all">
      <CardContent className="p-5 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="h-10 w-10 shrink-0 rounded-lg bg-primary/10 ring-1 ring-primary/30 grid place-items-center text-primary">
              <Monitor className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold truncate">{dispositivo.nome_tela}</h3>
              <p className="text-xs text-muted-foreground truncate">
                {cliente?.nome_estabelecimento ?? "Cliente removido"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <StatusBadge online={dispositivo.status_online} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={async () => {
                    await removerDispositivo(dispositivo.id);
                    toast.success("Terminal removido");
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Remover terminal
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Playlist ativa
          </label>
          <Select
            value={dispositivo.playlist_id ?? "none"}
            onValueChange={async (v) => {
              await trocarPlaylistDoDispositivo(dispositivo.id, v === "none" ? null : v);
              toast.success("Playlist atualizada na TV");
            }}
          >
            <SelectTrigger className="w-full bg-background/40">
              <SelectValue placeholder="Sem playlist" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sem playlist</SelectItem>
              {playlists.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.nome_playlist}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Wifi className="h-3.5 w-3.5" />
            Sync <RelativeTime iso={dispositivo.ultima_sincronizacao} />
          </span>
          <span className="font-mono text-[11px] tracking-wider opacity-70">
            #{dispositivo.codigo_vinculo}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}