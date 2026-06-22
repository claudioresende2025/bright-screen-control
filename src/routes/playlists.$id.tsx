import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ListMusic, Pencil, Play, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/common/EmptyState";
import { UploadDropzone } from "@/components/playlists/UploadDropzone";
import { MidiaListItem } from "@/components/playlists/MidiaListItem";
import { useData } from "@/store/data-store";
import { toast } from "sonner";

export const Route = createFileRoute("/playlists/$id")({
  head: () => ({
    meta: [
      { title: "Editar Playlist — SignageHub" },
      { name: "description", content: "Edite mídias, duração e ordem de exibição da playlist." },
    ],
  }),
  component: PlaylistEditor,
});

function PlaylistEditor() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { playlists, midias, dispositivos, renomearPlaylist, removerPlaylist } = useData();
  const playlist = playlists.find((p) => p.id === id);

  const [editingName, setEditingName] = useState(false);
  const [nome, setNome] = useState(playlist?.nome_playlist ?? "");

  if (!playlist) {
    return (
      <div className="p-8 max-w-[1400px] mx-auto">
        <EmptyState
          icon={ListMusic}
          title="Playlist não encontrada"
          description="Essa playlist pode ter sido removida."
          action={
            <Button asChild>
              <Link to="/playlists">Voltar</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const items = midias
    .filter((m) => m.playlist_id === playlist.id)
    .sort((a, b) => a.ordem_exibicao - b.ordem_exibicao);

  const tvsUsando = dispositivos.filter((d) => d.playlist_id === playlist.id).length;

  return (
    <div className="p-6 lg:p-8 max-w-[1100px] mx-auto">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="mb-4 -ml-2 text-muted-foreground"
      >
        <Link to="/playlists">
          <ArrowLeft className="h-4 w-4 mr-1" /> Playlists
        </Link>
      </Button>

      <PageHeader
        title={
          editingName ? "Editar playlist" : (playlist.nome_playlist as unknown as string)
        }
        subtitle={`${items.length} mídias · ${tvsUsando} TVs reproduzindo`}
        action={
          <div className="flex items-center gap-2">
            {editingName ? (
              <>
                <Input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-64"
                />
                <Button
                  size="sm"
                  onClick={async () => {
                    if (!nome.trim()) return toast.error("Nome inválido");
                    await renomearPlaylist(playlist.id, nome.trim());
                    toast.success("Playlist renomeada");
                    setEditingName(false);
                  }}
                >
                  Salvar
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingName(false)}>
                  Cancelar
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="default" size="sm">
                  <Link to="/playlists/$id/preview" params={{ id: playlist.id }}>
                    <Play className="h-4 w-4 mr-1.5" /> Preview
                  </Link>
                </Button>
                <Button variant="outline" size="sm" onClick={() => setEditingName(true)}>
                  <Pencil className="h-4 w-4 mr-1.5" /> Renomear
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={async () => {
                    if (!confirm("Remover esta playlist?")) return;
                    await removerPlaylist(playlist.id);
                    toast.success("Playlist removida");
                    navigate({ to: "/playlists" });
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-1.5" /> Excluir
                </Button>
              </>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        <Card className="bg-card/70 border-border/60">
          <CardContent className="p-5">
            <h2 className="text-sm font-semibold mb-3">Mídias da playlist</h2>
            {items.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-8 border border-dashed border-border/60 rounded-lg">
                Nenhuma mídia adicionada ainda. Use o painel ao lado para enviar arquivos.
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((m, i) => (
                  <MidiaListItem
                    key={m.id}
                    midia={m}
                    isFirst={i === 0}
                    isLast={i === items.length - 1}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="bg-card/70 border-border/60">
            <CardContent className="p-5">
              <h2 className="text-sm font-semibold mb-3">Adicionar mídias</h2>
              <UploadDropzone playlistId={playlist.id} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}