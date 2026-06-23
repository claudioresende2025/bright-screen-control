import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Monitor, Plus, Download, Copy, Settings } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DispositivoCard } from "@/components/dispositivos/DispositivoCard";
import { VincularTerminalDialog } from "@/components/dispositivos/VincularTerminalDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { useData } from "@/store/data-store";
import { useState } from "react";

export const Route = createFileRoute("/dispositivos")({
  head: () => ({
    meta: [
      { title: "Dispositivos — SignageHub" },
      { name: "description", content: "Gerencie as TVs vinculadas a cada cliente parceiro." },
      { property: "og:title", content: "Dispositivos — SignageHub" },
      { property: "og:description", content: "Monitore status e troque playlists em tempo real." },
    ],
  }),
  component: Dispositivos,
});

function Dispositivos() {
  const { dispositivos, apkDownloadUrl } = useData();
  const [showConfigDialog, setShowConfigDialog] = useState(false);

  const baixarApk = () => {
    if (!apkDownloadUrl) {
      setShowConfigDialog(true);
      return;
    }
    window.open(apkDownloadUrl, "_blank", "noopener,noreferrer");
  };

  const copiarLink = async () => {
    if (!apkDownloadUrl) return;
    try {
      await navigator.clipboard.writeText(apkDownloadUrl);
      toast.success("Link do APK copiado.");
    } catch {
      toast.error("Não foi possível copiar.");
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
      <PageHeader
        title="Dispositivos"
        subtitle={`${dispositivos.length} terminais cadastrados`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={baixarApk}>
              <Download className="h-4 w-4 mr-1.5" />
              Baixar APK
            </Button>
            {apkDownloadUrl ? (
              <Button variant="ghost" size="icon" onClick={copiarLink} title="Copiar link do APK">
                <Copy className="h-4 w-4" />
              </Button>
            ) : null}
            <VincularTerminalDialog
              trigger={
                <Button>
                  <Plus className="h-4 w-4 mr-1.5" />
                  Vincular Novo Terminal
                </Button>
              }
            />
          </div>
        }
      />

      {dispositivos.length === 0 ? (
        <EmptyState
          icon={Monitor}
          title="Nenhum terminal vinculado"
          description="Comece pareando o primeiro APK player instalado em uma TV usando o código de 6 dígitos."
          action={
            <VincularTerminalDialog
              trigger={
                <Button>
                  <Plus className="h-4 w-4 mr-1.5" />
                  Vincular Terminal
                </Button>
              }
            />
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {dispositivos.map((d) => (
            <DispositivoCard key={d.id} dispositivo={d} />
          ))}
        </div>
      )}

      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>APK ainda não configurado</DialogTitle>
            <DialogDescription>
              Para baixar o APK, primeiro cole a URL pública do arquivo <code>.apk</code> em
              Configurações. Depois é só clicar em "Baixar APK" aqui.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfigDialog(false)}>
              Fechar
            </Button>
            <Button asChild onClick={() => setShowConfigDialog(false)}>
              <Link to="/configuracoes">
                <Settings className="h-4 w-4 mr-1.5" />
                Abrir Configurações
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}