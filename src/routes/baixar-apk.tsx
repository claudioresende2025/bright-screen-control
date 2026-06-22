import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { Download, Smartphone, AlertTriangle } from "lucide-react";
import { useData } from "@/store/data-store";

export const Route = createFileRoute("/baixar-apk")({
  head: () => ({
    meta: [
      { title: "Baixar Player APK — SignageHub" },
      { name: "description", content: "Download do player SignageHub para Android TV." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: BaixarApkPage,
});

function BaixarApkPage() {
  const { apkDownloadUrl } = useData();

  useEffect(() => {
    if (!apkDownloadUrl) return;
    if (typeof window === "undefined") return;
    // Pequeno delay para o usuário ver a tela antes do download começar
    const t = setTimeout(() => {
      window.location.replace(apkDownloadUrl);
    }, 800);
    return () => clearTimeout(t);
  }, [apkDownloadUrl]);

  return (
    <div className="min-h-screen bg-black text-white grid place-items-center px-6 py-10">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/15 ring-1 ring-primary/40 grid place-items-center text-primary">
          <Smartphone className="h-8 w-8" />
        </div>

        {apkDownloadUrl ? (
          <>
            <div>
              <h1 className="text-2xl font-semibold">Baixando SignageHub Player…</h1>
              <p className="mt-2 text-sm text-white/60">
                O download deve começar em instantes. Se não iniciar automaticamente, toque no botão
                abaixo.
              </p>
            </div>
            <a
              href={apkDownloadUrl}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Download className="h-4 w-4" /> Baixar APK agora
            </a>
            <div className="text-xs text-white/40 space-y-1 pt-4 border-t border-white/10">
              <p className="text-white/60 font-medium">Após o download:</p>
              <p>1. Abra o arquivo .apk no gerenciador de arquivos da TV.</p>
              <p>
                2. Habilite <em>"Permitir instalação de fontes desconhecidas"</em> nas Configurações
                do Android, se solicitado.
              </p>
              <p>3. Confirme a instalação e abra o SignageHub Player.</p>
            </div>
          </>
        ) : (
          <>
            <div className="mx-auto h-12 w-12 rounded-full bg-amber-500/15 ring-1 ring-amber-500/40 grid place-items-center text-amber-400">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">APK ainda não publicado</h1>
              <p className="mt-2 text-sm text-white/60">
                O administrador ainda não configurou a URL pública do APK. Peça para ele acessar{" "}
                <strong>Configurações → Player Android (APK)</strong> no painel e cadastrar o link.
              </p>
            </div>
            <a
              href="/configuracoes"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-medium text-white hover:bg-white/5 transition-colors"
            >
              Abrir Configurações
            </a>
          </>
        )}
      </div>
    </div>
  );
}