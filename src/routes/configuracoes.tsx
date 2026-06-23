import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { Download, ExternalLink, Save, Trash2, Smartphone } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useData } from "@/store/data-store";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — SignageHub" },
      { name: "description", content: "Configurações gerais do painel, incluindo URL do APK do player." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ConfiguracoesPage,
});

function ConfiguracoesPage() {
  const { apkDownloadUrl, setApkDownloadUrl } = useData();
  const [value, setValue] = useState(apkDownloadUrl);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setValue(apkDownloadUrl);
  }, [apkDownloadUrl]);

  useEffect(() => {
    if (typeof window !== "undefined") setOrigin(window.location.origin);
  }, []);

  const landingUrl = origin ? `${origin}/baixar-apk` : "/baixar-apk";

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
            Cole aqui o link público do arquivo <code>.apk</code> (GitHub Releases, Google Drive
            <code> uc?export=download&amp;id=…</code>, Dropbox <code>?dl=1</code>, S3, R2). Esse link
            é usado pelo botão <strong>Baixar APK</strong> na página de Dispositivos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
                Aceita qualquer URL pública que retorne o arquivo .apk: GitHub Releases, Google Drive
                (<code>uc?export=download&amp;id=...</code>), Dropbox (<code>?dl=1</code>), S3 público,
                Cloudflare R2, etc.
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
                <p className="text-xs uppercase tracking-wider text-muted-foreground">URL do QR (fixa)</p>
                <p className="font-mono text-sm break-all">{landingUrl}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Status</p>
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

          <div className="rounded-lg border border-border/60 bg-muted/20 p-4 text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">Como gerar o APK</p>
            <p>
              O projeto Android está em <code>/android-player</code>. Abra no Android Studio e use{" "}
              <strong>Build → Build Bundle(s) / APK(s) → Build APK(s)</strong>. Faça upload do arquivo
              gerado para o GitHub Releases (ou outro host público) e cole a URL aqui.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}