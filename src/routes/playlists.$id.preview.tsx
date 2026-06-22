import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { ArrowLeft, Maximize2, Pause, Play, SkipBack, SkipForward, Film, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PlaybackEngine } from "@/components/player/PlaybackEngine";
import { useData } from "@/store/data-store";

export const Route = createFileRoute("/playlists/$id/preview")({
  head: () => ({
    meta: [
      { title: "Preview da Playlist — SignageHub" },
      { name: "description", content: "Simule a reprodução da playlist como aparecerá na TV." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PreviewRoute,
});

function PreviewRoute() {
  const { id } = Route.useParams();
  const { playlists, midias } = useData();
  const playlist = playlists.find((p) => p.id === id);
  const items = useMemo(
    () =>
      midias
        .filter((m) => m.playlist_id === id)
        .sort((a, b) => a.ordem_exibicao - b.ordem_exibicao),
    [midias, id],
  );
  const [paused, setPaused] = useState(false);
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const tvRef = useRef<HTMLDivElement>(null);

  if (!playlist) {
    return (
      <div className="p-8">
        <p>Playlist não encontrada.</p>
        <Button asChild className="mt-4">
          <Link to="/playlists">Voltar</Link>
        </Button>
      </div>
    );
  }

  const current = items[index];
  const next = items[(index + 1) % Math.max(1, items.length)];

  const fullscreen = () => {
    const el = tvRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen?.();
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2 text-muted-foreground">
        <Link to="/playlists/$id" params={{ id }}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Voltar ao editor
        </Link>
      </Button>

      <div className="flex items-end justify-between mb-5">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Preview</p>
          <h1 className="text-2xl font-semibold mt-1">{playlist.nome_playlist}</h1>
          <p className="text-sm text-muted-foreground">
            {items.length} mídias · simulando exibição na TV
          </p>
        </div>
        <Button variant="outline" onClick={fullscreen}>
          <Maximize2 className="h-4 w-4 mr-1.5" /> Tela cheia
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        {/* TV frame */}
        <div className="relative">
          <div className="rounded-[28px] bg-zinc-950 p-3 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] ring-1 ring-white/5">
            <div
              ref={tvRef}
              className="relative aspect-video rounded-[18px] overflow-hidden bg-black ring-1 ring-white/10"
            >
              <PlaybackEngine
                midias={items}
                paused={paused}
                externalIndex={index}
                onIndexChange={setIndex}
                onProgress={setProgress}
              />
              <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur px-2.5 py-1 text-[10px] uppercase tracking-wider text-white/80">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" /> Preview
              </div>
            </div>
          </div>
          <div className="mx-auto mt-3 h-6 w-32 rounded-b-2xl bg-zinc-900" />
        </div>

        {/* Sidebar controls */}
        <div className="space-y-4">
          <Card className="bg-card/70 border-border/60">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Reproduzindo</span>
                <span className="tabular-nums">
                  {items.length ? `${index + 1} / ${items.length}` : "0 / 0"}
                </span>
              </div>
              {current ? (
                <div className="flex items-center gap-3">
                  <div className="h-12 w-16 rounded-md overflow-hidden bg-muted ring-1 ring-border shrink-0">
                    {current.tipo_midia === "image" ? (
                      <img
                        src={current.url_arquivo}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full grid place-items-center bg-primary/10 text-primary">
                        <Film className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{current.nome_arquivo}</p>
                    <p className="text-xs text-muted-foreground inline-flex items-center gap-1">
                      {current.tipo_midia === "image" ? (
                        <ImageIcon className="h-3 w-3" />
                      ) : (
                        <Film className="h-3 w-3" />
                      )}
                      {current.duracao_segundos}s
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhuma mídia.</p>
              )}

              <Progress value={progress * 100} className="h-1.5" />

              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setIndex((i) => (items.length ? (i - 1 + items.length) % items.length : 0))
                  }
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button size="icon" onClick={() => setPaused((p) => !p)}>
                  {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIndex((i) => (items.length ? (i + 1) % items.length : 0))}
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/70 border-border/60">
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                Próxima
              </p>
              {next ? (
                <div className="flex items-center gap-3">
                  <div className="h-10 w-14 rounded-md overflow-hidden bg-muted ring-1 ring-border shrink-0">
                    {next.tipo_midia === "image" ? (
                      <img src={next.url_arquivo} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full grid place-items-center bg-primary/10 text-primary">
                        <Film className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm truncate">{next.nome_arquivo}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">—</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card/70 border-border/60">
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                Fila ({items.length})
              </p>
              <ol className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                {items.map((m, i) => (
                  <li
                    key={m.id}
                    className={`flex items-center gap-2 text-xs rounded-md px-2 py-1.5 ${
                      i === index
                        ? "bg-primary/15 text-primary"
                        : "text-muted-foreground hover:bg-muted/40"
                    }`}
                  >
                    <span className="tabular-nums w-5 text-right">{i + 1}.</span>
                    <span className="truncate flex-1">{m.nome_arquivo}</span>
                    <span className="tabular-nums">{m.duracao_segundos}s</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}