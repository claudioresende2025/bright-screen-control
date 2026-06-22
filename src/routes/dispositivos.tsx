import { createFileRoute } from "@tanstack/react-router";
import { Monitor, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { DispositivoCard } from "@/components/dispositivos/DispositivoCard";
import { VincularTerminalDialog } from "@/components/dispositivos/VincularTerminalDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { useData } from "@/store/data-store";

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
  const { dispositivos } = useData();

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
      <PageHeader
        title="Dispositivos"
        subtitle={`${dispositivos.length} terminais cadastrados`}
        action={
          <VincularTerminalDialog
            trigger={
              <Button>
                <Plus className="h-4 w-4 mr-1.5" />
                Vincular Novo Terminal
              </Button>
            }
          />
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
    </div>
  );
}