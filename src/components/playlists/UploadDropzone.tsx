import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { useData } from "@/store/data-store";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const BUCKET = "midias";
// 10 years — bucket is private, so we sign URLs at upload time.
const SIGNED_URL_TTL = 60 * 60 * 24 * 365 * 10;

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

  const probeVideoDuration = (file: File): Promise<number> =>
    new Promise((resolve) => {
      try {
        const url = URL.createObjectURL(file);
        const v = document.createElement("video");
        v.preload = "metadata";
        v.muted = true;
        const done = (d: number) => {
          URL.revokeObjectURL(url);
          resolve(d);
        };
        v.onloadedmetadata = () => done(Math.max(1, Math.round(v.duration || 15)));
        v.onerror = () => done(15);
        v.src = url;
      } catch {
        resolve(15);
      }
    });

  const uploadFile = async (file: File) => {
    const id = Math.random().toString(36).slice(2);
    const isImage = file.type.startsWith("image/") || /\.(png|jpe?g|webp|gif)$/i.test(file.name);
    const isVideo = file.type.startsWith("video/") || /\.(mp4|webm|mov|m4v)$/i.test(file.name);
    if (!isImage && !isVideo) {
      toast.error(`Formato não suportado: ${file.name}`);
      return;
    }
    const duracao = isImage ? 8 : await probeVideoDuration(file);
    setPending((p) => [...p, { id, name: file.name, progress: 10 }]);

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "_");
    const path = `${playlistId}/${Date.now()}_${safeName}`;

    try {
      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, {
          contentType: file.type || (isImage ? "image/jpeg" : "video/mp4"),
          upsert: false,
        });
      if (upErr) throw upErr;
      setPending((p) => p.map((x) => (x.id === id ? { ...x, progress: 70 } : x)));

      const { data: signed, error: signErr } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(path, SIGNED_URL_TTL);
      if (signErr || !signed?.signedUrl) throw signErr ?? new Error("Falha ao gerar URL");

      await adicionarMidia({
        playlist_id: playlistId,
        url_arquivo: signed.signedUrl,
        tipo_midia: isImage ? "image" : "video",
        nome_arquivo: file.name,
        tamanho_bytes: file.size,
        duracao_segundos: duracao,
      });
      toast.success(`${file.name} adicionado à playlist`);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : `Falha ao enviar ${file.name}`);
    } finally {
      setPending((p) => p.filter((x) => x.id !== id));
    }
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files).filter((f) => {
      const isImage =
        f.type.startsWith("image/") || /\.(png|jpe?g|webp|gif)$/i.test(f.name);
      const isVideo =
        f.type.startsWith("video/") || /\.(mp4|webm|mov|m4v)$/i.test(f.name);
      if (!isImage && !isVideo) {
        toast.error(`Formato não suportado: ${f.name}`);
        return false;
      }
      return true;
    });
    if (arr.length === 0) return;
    // Upload todos imediatamente, em paralelo controlado.
    arr.forEach((f) => {
      void uploadFile(f);
    });
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-3">
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
          accept="video/mp4,video/webm,video/quicktime,image/png,image/jpeg,image/webp,image/gif"
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