import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { useData } from "@/store/data-store";
import { toast } from "sonner";
import { MediaPreview } from "./MediaPreview";

interface PendingUpload {
  id: string;
  name: string;
  progress: number;
}

export function UploadDropzone({ playlistId }: { playlistId: string }) {
  const { adicionarMidia } = useData();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [pending, setPending] = useState<PendingUpload[]>([]);
  const [previewFile, setPreviewFile] = useState<File | null>(null);

  const placeholderUrl = (isImage: boolean, name: string) =>
    isImage
      ? `https://picsum.photos/seed/${encodeURIComponent(name)}/600/400`
      : "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

  const simulateUpload = (file: File, duracao: number) => {
    const id = Math.random().toString(36).slice(2);
    setPending((p) => [...p, { id, name: file.name, progress: 0 }]);

    const isImage = file.type.startsWith("image/") || /\.(png|jpe?g|webp|gif)$/i.test(file.name);
    const isVideo = file.type.startsWith("video/") || /\.(mp4|webm|mov)$/i.test(file.name);
    if (!isImage && !isVideo) {
      toast.error(`Formato não suportado: ${file.name}`);
      setPending((p) => p.filter((x) => x.id !== id));
      return;
    }

    const step = () => {
      setPending((prev) => {
        const next = prev.map((p) =>
          p.id === id ? { ...p, progress: Math.min(100, p.progress + 15 + Math.random() * 20) } : p,
        );
        const item = next.find((p) => p.id === id);
        if (item && item.progress >= 100) {
          adicionarMidia({
            playlist_id: playlistId,
            url_arquivo: placeholderUrl(isImage, file.name),
            tipo_midia: isImage ? "image" : "video",
            nome_arquivo: file.name,
            tamanho_bytes: file.size,
            duracao_segundos: duracao,
          }).then(() => {
            toast.success(`${file.name} adicionado à playlist`);
          });
          return next.filter((p) => p.id !== id);
        }
        setTimeout(step, 200);
        return next;
      });
    };
    setTimeout(step, 200);
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    // Open preview for the first file; queue more later
    const arr = Array.from(files);
    if (arr.length === 0) return;
    setPreviewFile(arr[0]);
  };

  return (
    <div className="space-y-3">
      {previewFile ? (
        <MediaPreview
          file={previewFile}
          onCancel={() => setPreviewFile(null)}
          onConfirm={({ duracao_segundos }) => {
            simulateUpload(previewFile, duracao_segundos);
            setPreviewFile(null);
          }}
        />
      ) : null}

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`cursor-pointer rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
          dragOver
            ? "border-primary bg-primary/5"
            : "border-border/70 bg-card/30 hover:border-primary/50 hover:bg-card/50"
        }`}
      >
        <div className="mx-auto h-12 w-12 rounded-2xl bg-primary/10 ring-1 ring-primary/30 grid place-items-center text-primary mb-3">
          <Upload className="h-5 w-5" />
        </div>
        <p className="text-sm font-medium">Arraste arquivos aqui ou clique para enviar</p>
        <p className="text-xs text-muted-foreground mt-1">
          Suporta MP4, PNG, JPG · múltiplos arquivos
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="video/mp4,image/png,image/jpeg"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {pending.length > 0 ? (
        <div className="space-y-2">
          {pending.map((p) => (
            <div key={p.id} className="rounded-md border border-border/60 bg-card/40 p-3">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="truncate">{p.name}</span>
                <span className="text-muted-foreground tabular-nums">{Math.floor(p.progress)}%</span>
              </div>
              <Progress value={p.progress} className="h-1.5" />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}