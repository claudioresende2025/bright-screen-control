import { useEffect, useRef, useState } from "react";
import { Film, Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatarTamanho } from "@/store/data-store";

interface Props {
  file: File;
  onCancel: () => void;
  onConfirm: (opts: { duracao_segundos: number }) => void;
}

/**
 * Mostra preview local (objectURL) de imagem ou vídeo antes de adicionar à playlist.
 */
export function MediaPreview({ file, onCancel, onConfirm }: Props) {
  const [url, setUrl] = useState<string>("");
  const [dim, setDim] = useState<{ w: number; h: number } | null>(null);
  const [videoDur, setVideoDur] = useState<number | null>(null);
  const [imgDuracao, setImgDuracao] = useState<number>(8);
  const videoRef = useRef<HTMLVideoElement>(null);

  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");

  useEffect(() => {
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  return (
    <div className="rounded-xl border border-primary/30 bg-card/80 overflow-hidden shadow-[0_8px_30px_-12px_rgba(82,130,255,0.4)]">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/60 bg-background/40">
        <div className="flex items-center gap-2 min-w-0">
          {isImage ? (
            <ImageIcon className="h-4 w-4 text-primary shrink-0" />
          ) : (
            <Film className="h-4 w-4 text-primary shrink-0" />
          )}
          <p className="text-sm font-medium truncate">{file.name}</p>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="relative bg-black aspect-video grid place-items-center overflow-hidden">
        {url && isImage ? (
          <img
            src={url}
            alt={file.name}
            className="max-h-full max-w-full object-contain"
            onLoad={(e) => {
              const img = e.currentTarget;
              setDim({ w: img.naturalWidth, h: img.naturalHeight });
            }}
          />
        ) : null}
        {url && isVideo ? (
          <video
            ref={videoRef}
            src={url}
            controls
            playsInline
            className="max-h-full max-w-full"
            onLoadedMetadata={(e) => {
              const v = e.currentTarget;
              setDim({ w: v.videoWidth, h: v.videoHeight });
              setVideoDur(v.duration);
            }}
          />
        ) : null}
      </div>

      <div className="px-4 py-3 space-y-3">
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div>
            <p className="text-muted-foreground">Tamanho</p>
            <p className="font-medium tabular-nums">{formatarTamanho(file.size)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Resolução</p>
            <p className="font-medium tabular-nums">
              {dim ? `${dim.w}×${dim.h}` : "—"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Tipo</p>
            <p className="font-medium">{isImage ? "Imagem" : isVideo ? "Vídeo" : "—"}</p>
          </div>
        </div>

        {isImage ? (
          <div className="space-y-1.5">
            <Label htmlFor="dur">Duração na playlist (segundos)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="dur"
                type="number"
                min={1}
                max={300}
                value={imgDuracao}
                onChange={(e) =>
                  setImgDuracao(Math.max(1, Math.min(300, Number(e.target.value) || 1)))
                }
                className="w-24"
              />
              <input
                type="range"
                min={3}
                max={60}
                value={imgDuracao}
                onChange={(e) => setImgDuracao(Number(e.target.value))}
                className="flex-1 accent-[color:var(--color-primary)]"
              />
            </div>
          </div>
        ) : null}

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={() =>
              onConfirm({
                duracao_segundos: isImage
                  ? imgDuracao
                  : videoDur
                  ? Math.round(videoDur)
                  : 15,
              })
            }
          >
            Adicionar à playlist
          </Button>
        </div>
      </div>
    </div>
  );
}