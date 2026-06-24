import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ListMusic, Plus, ChevronRight, Film, Image as ImageIcon } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/common/EmptyState";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useData } from "@/store/data-store";
import { toast } from "sonner";

export const Route = createFileRoute("/playlists")({
  head: () => ({
    meta: [
      { title: "Playlists — SignageHub" },
      { name: "description", content: "Gerencie playlists de mídias exibidas nas TVs." },
      { property: "og:title", content: "Playlists — SignageHub" },
      { property: "og:description", content: "Crie e edite playlists com vídeos e imagens." },
    ],
  }),
  component: Playlists,
});

function NovaPlaylistDialog() {
  const { criarPlaylist } = useData();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [saving, setSaving] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-1.5" /> Nova Playlist
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Nova playlist</DialogTitle>
        </DialogHeader>
        <div className="space-y-1.5 py-2">
          <Label htmlFor="pl-nome">Nome</Label>
          <Input
            id="pl-nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Promoções de Natal"
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            disabled={saving}
            onClick={async () => {
              if (!nome.trim()) return toast.error("Informe um nome");
              setSaving(true);
              try {
                const pl = await criarPlaylist(nome.trim());
                toast.success("Playlist criada");
                setNome("");
                setOpen(false);
                navigate({ to: "/playlists/$id", params: { id: pl.id } });
              } catch (err) {
                console.error(err);
                toast.error(
                  err instanceof Error ? err.message : "Falha ao criar playlist",
                );
              } finally {
                setSaving(false);
              }
            }}
          >
            {saving ? "Criando..." : "Criar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Playlists() {
  const { playlists, midias, dispositivos } = useData();

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
      <PageHeader
        title="Playlists"
        subtitle="Conteúdos centralizados para distribuir às TVs"
        action={<NovaPlaylistDialog />}
      />

      {playlists.length === 0 ? (
        <EmptyState
          icon={ListMusic}
          title="Nenhuma playlist criada"
          description="Crie sua primeira playlist e comece a enviar mídias para as TVs."
          action={<NovaPlaylistDialog />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {playlists.map((pl) => {
            const items = midias.filter((m) => m.playlist_id === pl.id);
            const totalSec = items.reduce((acc, m) => acc + m.duracao_segundos, 0);
            const imgs = items.filter((m) => m.tipo_midia === "image").length;
            const vids = items.filter((m) => m.tipo_midia === "video").length;
            const tvs = dispositivos.filter((d) => d.playlist_id === pl.id).length;
            const min = Math.floor(totalSec / 60);
            const sec = totalSec % 60;
            return (
              <Link
                key={pl.id}
                to="/playlists/$id"
                params={{ id: pl.id }}
                preload="intent"
                className="block group cursor-pointer"
              >
                <Card className="bg-card/70 border-border/60 group-hover:border-primary/40 group-hover:shadow-[0_8px_30px_-12px_rgba(82,130,255,0.35)] transition-all">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold truncate">{pl.nome_playlist}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {items.length} {items.length === 1 ? "mídia" : "mídias"} ·{" "}
                          {min > 0 ? `${min}m ${sec}s` : `${sec}s`}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="flex items-center gap-3 mt-4 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <ImageIcon className="h-3.5 w-3.5" /> {imgs}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Film className="h-3.5 w-3.5" /> {vids}
                      </span>
                      <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-primary ring-1 ring-primary/30">
                        {tvs} {tvs === 1 ? "TV" : "TVs"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}