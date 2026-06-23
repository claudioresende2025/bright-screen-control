import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import {
  Download,
  ExternalLink,
  Save,
  Trash2,
  Smartphone,
  Upload,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useData } from "@/store/data-store";
import { supabase } from "@/integrations/supabase/client";

const BUCKET = "apks";
const FILE_PATH = "signagehub-player.apk";

type UploadedInfo = {
  size: number;
  updatedAt: string;
} | null;

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — SignageHub" },
      {
        name: "description",
        content:
          "Configurações gerais do painel, incluindo upload e URL do APK do player.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ConfiguracoesPage,
});

function ConfiguracoesPage() {
  const { apkDownloadUrl, setApkDownloadUrl } = useData();
  const [value, setValue] = useState(apkDownloadUrl);
  const [origin, setOrigin] = useState("");
  const [uploaded, setUploaded] = useState<UploadedInfo>(null);
  const [uploading, setUploading] = useState(false);
  const [checking, setChecking] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(apkDownloadUrl);
  }, [apkDownloadUrl]);

  useEffect(() => {
    if (typeof window !== "undefined") setOrigin(window.location.origin);
  }, []);

  const hostedUrl = origin ? `${origin}/api/public/apk` : "/api/public/apk";
  const landingUrl = origin ? `${origin}/baixar-apk` : "/baixar-apk";

  // Detect whether an APK is currently uploaded.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase.storage
          .from(BUCKET)
          .list("", { search: FILE_PATH });
        if (cancelled) return;
        if (error) {
          setUploaded(null);
          return;
        }
        const f = data?.find((x) => x.name === FILE_PATH);
        if (f) {
          setUploaded({
            size: (f.metadata as { size?: number } | null)?.size ?? 0,
            updatedAt: f.updated_at ?? f.created_at ?? "",
          });
        } else {
          setUploaded(null);
        }
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [uploading]);

  const salvar = () => {
    const trimmed = value.trim();
    if (trimmed && !/^https?:\/\//i.test(trimmed)) {
      toast.error("A URL deve começar com http:// ou https://");
      return;
    }
    setApkDownloadUrl(trimmed);
    toast.success(trimmed ? "URL do APK salva." : "URL removida.");
  };

  const limpar = () => {
    setValue("");
    setApkDownloadUrl("");
    toast.success("URL removida.");
  };

  const onPickFile = () => fileInputRef.current?.click();

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    if (!file.name.toLowerCase().endsWith(".apk")) {
      toast.error("Selecione um arquivo .apk válido.");
      return;
    }

    setUploading(true);
    try {
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(FILE_PATH, file, {
          upsert: true,
          contentType: "application/vnd.android.package-archive",
        });
      if (error) throw error;
      setApkDownloadUrl(hostedUrl);
      setValue(hostedUrl);
      toast.success("APK enviado com sucesso! Link público pronto.");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Falha ao enviar o APK.");
    } finally {
      setUploading(false);
    }
  };

  const removerUpload = async () => {
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        "Remover o APK enviado? O botão de download deixará de funcionar.",
      )
    )
      return;
    setUploading(true);
    try {
      const { error } = await supabase.storage.from(BUCKET).remove([FILE_PATH]);
      if (error) throw error;
      if (apkDownloadUrl === hostedUrl) {
        setApkDownloadUrl("");
        setValue("");
      }
      toast.success("APK removido.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao remover.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl">
      <PageHeader
        title="Configurações"
        subtitle="Ajustes globais do painel e da distribuição do player."
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" /> Player Android (APK)
          </CardTitle>
          <CardDescription>
            Envie o arquivo <code>.apk</code> direto pelo painel ou cole um link
            público (GitHub Releases, Google Drive, Dropbox, S3, R2). É esse link
            que abastece o botão <strong>Baixar APK</strong> em Dispositivos e o
            QR Code exibido na TV.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* ---------- Upload pelo painel ---------- */}
          <div className="rounded-lg border border-border/60 bg-muted/10 p-4 space-y-3">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <p className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Upload className="h-4 w-4 text-primary" /> Enviar APK pelo painel
                </p>
                <p className="text-xs text-muted-foreground mt-1 max-w-md">
                  Faça upload do arquivo <code>.apk</code> direto aqui. O link
                  público é preenchido automaticamente no campo abaixo.
                  Recomendado.
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".apk,application/vnd.android.package-archive"
                className="hidden"
                onChange={onFileChange}
              />
              <div className="flex gap-2">
                <Button onClick={onPickFile} disabled={uploading}>
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {uploaded ? "Substituir APK" : "Enviar APK"}
                </Button>
                {uploaded && (
                  <Button
                    variant="outline"
                    onClick={removerUpload}
                    disabled={uploading}
                  >
                    <Trash2 className="h-4 w-4" /> Remover
                  </Button>
                )}
              </div>
            </div>
            {checking ? (
              <p className="text-xs text-muted-foreground">
                Verificando APK enviado…
              </p>
            ) : uploaded ? (
              <div className="text-xs text-[color:var(--color-success)] flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                APK enviado · {formatBytes(uploaded.size)}
                {uploaded.updatedAt
                  ? ` · atualizado em ${new Date(uploaded.updatedAt).toLocaleString("pt-BR")}`
                  : ""}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Nenhum APK enviado ainda.
              </p>
            )}
          </div>

          {/* ---------- URL externa ---------- */}
          <div className="grid gap-4 md:grid-cols-[1fr_auto] items-end">
            <div className="space-y-1.5">
              <Label htmlFor="apk-url">URL pública do APK</Label>
              <Input
                id="apk-url"
                placeholder="https://github.com/seu-usuario/signagehub-player/releases/download/v1.0.0/player.apk"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Se você usou o botão de upload acima, este campo já vem
                preenchido com <code>{hostedUrl}</code>. Você também pode colar
                manualmente uma URL externa (GitHub Releases, Drive{" "}
                <code>uc?export=download&amp;id=...</code>, Dropbox{" "}
                <code>?dl=1</code>, S3, R2).
              </p>
            </div>
            <div className="flex gap-2">
              {apkDownloadUrl ? (
                <Button variant="outline" onClick={limpar}>
                  <Trash2 className="h-4 w-4" /> Limpar
                </Button>
              ) : null}
              <Button onClick={salvar}>
                <Save className="h-4 w-4" /> Salvar
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-[auto_1fr] items-start border-t border-border/60 pt-6">
            <div className="flex flex-col items-center gap-2">
              <div className="rounded-xl bg-white p-3">
                <QRCodeSVG value={landingUrl} size={148} />
              </div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                QR exibido na TV
              </span>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  URL do QR (fixa)
                </p>
                <p className="font-mono text-sm break-all">{landingUrl}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Status
                </p>
                {apkDownloadUrl ? (
                  <p className="text-[color:var(--color-success)] flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[color:var(--color-success)]" />
                    Configurado · escanear baixa o APK automaticamente
                  </p>
                ) : (
                  <p className="text-amber-400 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    Não configurado · escanear abre uma página com instruções
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button asChild variant="outline" size="sm">
                  <a href={landingUrl} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-4 w-4" /> Abrir página de download
                  </a>
                </Button>
                {apkDownloadUrl ? (
                  <Button asChild variant="outline" size="sm">
                    <a href={apkDownloadUrl} target="_blank" rel="noreferrer">
                      <Download className="h-4 w-4" /> Testar download direto
                    </a>
                  </Button>
                ) : null}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border/60 bg-muted/20 p-4 text-xs text-muted-foreground space-y-2">
            <p className="font-medium text-foreground">Como gerar o APK</p>
            <p>
              O projeto Android está em <code>/android-player</code>. Há duas
              formas de compilar:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Automático (recomendado):</strong> conecte o projeto ao
                GitHub (botão GitHub no chat da Lovable). O workflow{" "}
                <code>.github/workflows/build-apk.yml</code> compila o APK a cada
                push em <code>main</code> e publica em{" "}
                <strong>GitHub Releases</strong> (URL estável tipo{" "}
                <code>releases/latest/download/signagehub-player.apk</code>).
                Baixe esse arquivo e envie aqui no botão de upload.
              </li>
              <li>
                <strong>Manual:</strong> abra <code>android-player/</code> no
                Android Studio → <strong>Build → Build APK(s)</strong> → envie o
                arquivo gerado aqui.
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}