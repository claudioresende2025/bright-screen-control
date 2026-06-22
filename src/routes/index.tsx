import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Monitor, Wifi, WifiOff, ListMusic, Activity } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useData, tempoRelativo } from "@/store/data-store";
import { StatusBadge } from "@/components/dispositivos/StatusBadge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — SignageHub" },
      { name: "description", content: "Visão geral dos terminais de Mídia Indoor em tempo real." },
      { property: "og:title", content: "Dashboard — SignageHub" },
      { property: "og:description", content: "Métricas globais e atividade recente dos terminais." },
    ],
  }),
  component: Index,
});

function Index() {
  const { dispositivos, playlists, clientes } = useData();
  const online = dispositivos.filter((d) => d.status_online);
  const offline = dispositivos.filter((d) => !d.status_online);

  const recentes = [...dispositivos]
    .sort(
      (a, b) =>
        new Date(b.ultima_sincronizacao).getTime() -
        new Date(a.ultima_sincronizacao).getTime(),
    )
    .slice(0, 6);

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral da sua rede de Mídia Indoor"
        action={
          <Button asChild>
            <Link to="/dispositivos">Gerenciar terminais</Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total de Terminais"
          value={dispositivos.length}
          icon={Monitor}
          tone="primary"
          hint={`${clientes.length} clientes ativos`}
        />
        <MetricCard
          label="TVs Online"
          value={online.length}
          icon={Wifi}
          tone="success"
          hint="Transmitindo agora"
        />
        <MetricCard
          label="TVs Offline"
          value={offline.length}
          icon={WifiOff}
          tone="destructive"
          hint={offline.length ? "Verifique a conexão" : "Tudo conectado"}
        />
        <MetricCard
          label="Playlists"
          value={playlists.length}
          icon={ListMusic}
          hint="Conteúdos configurados"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <Card className="lg:col-span-2 bg-card/70 border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Atividade recente
            </CardTitle>
            <Link
              to="/dispositivos"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Ver todos →
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentes.map((d) => {
              const cli = clientes.find((c) => c.id === d.cliente_id);
              const pl = playlists.find((p) => p.id === d.playlist_id);
              return (
                <div
                  key={d.id}
                  className="flex items-center justify-between rounded-lg border border-border/50 bg-background/30 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{d.nome_tela}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {cli?.nome_estabelecimento} · {pl?.nome_playlist ?? "sem playlist"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-muted-foreground">
                      {tempoRelativo(d.ultima_sincronizacao)}
                    </span>
                    <StatusBadge online={d.status_online} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="bg-card/70 border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Status por cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {clientes.map((c) => {
              const tvs = dispositivos.filter((d) => d.cliente_id === c.id);
              const on = tvs.filter((d) => d.status_online).length;
              return (
                <div key={c.id}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="truncate font-medium">{c.nome_estabelecimento}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {on}/{tvs.length}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-[color:var(--color-success)] transition-all"
                      style={{ width: tvs.length ? `${(on / tvs.length) * 100}%` : "0%" }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
