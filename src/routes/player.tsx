import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PairingScreen } from "@/components/player/PairingScreen";
import { PlaybackEngine } from "@/components/player/PlaybackEngine";
import { useData } from "@/store/data-store";

export const Route = createFileRoute("/player")({
  head: () => ({
    meta: [
      { title: "Player — SignageHub" },
      { name: "description", content: "Player de TV — exibe o código de pareamento e reproduz a playlist." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PlayerRoute,
});

function gerarCodigo() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function PlayerRoute() {
  const { midias, registrarPendingPlayer, getDispositivoPorCodigo, heartbeatDispositivo } =
    useData();
  const [mounted, setMounted] = useState(false);
  const [codigo, setCodigo] = useState<string>("");
  const [deviceId, setDeviceId] = useState<string>("");

  // Initialise persistent player identity client-side only
  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;
    let c = localStorage.getItem("player_codigo");
    let d = localStorage.getItem("player_device_id");
    if (!c) {
      c = gerarCodigo();
      localStorage.setItem("player_codigo", c);
    }
    if (!d) {
      d = "dev_" + Math.random().toString(36).slice(2, 10);
      localStorage.setItem("player_device_id", d);
    }
    setCodigo(c);
    setDeviceId(d);
    registrarPendingPlayer(c, d);
  }, [registrarPendingPlayer]);

  const dispositivo = useMemo(
    () => (codigo ? getDispositivoPorCodigo(codigo) : undefined),
    [codigo, getDispositivoPorCodigo],
  );

  // Heartbeat every 30s when bound
  useEffect(() => {
    if (!dispositivo) return;
    heartbeatDispositivo(dispositivo.id);
    const t = setInterval(() => heartbeatDispositivo(dispositivo.id), 30000);
    return () => clearInterval(t);
  }, [dispositivo, heartbeatDispositivo]);

  const playlistMidias = useMemo(
    () =>
      dispositivo?.playlist_id
        ? midias.filter((m) => m.playlist_id === dispositivo.playlist_id)
        : [],
    [dispositivo, midias],
  );

  // Hidden reset button: top-right long-press / double click
  const reset = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("player_codigo");
    localStorage.removeItem("player_device_id");
    window.location.reload();
  };

  const origin = mounted && typeof window !== "undefined" ? window.location.origin : "";
  const painelUrl = origin + "/dispositivos";

  return (
    <div className="fixed inset-0 bg-black text-white overflow-hidden">
      {!mounted || !codigo ? (
        <div className="absolute inset-0 grid place-items-center text-white/40">Iniciando…</div>
      ) : !dispositivo ? (
        <PairingScreen codigo={codigo} painelUrl={painelUrl} />
      ) : !dispositivo.playlist_id ? (
        <div className="absolute inset-0 grid place-items-center text-center px-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/40">{dispositivo.nome_tela}</p>
            <h2 className="text-3xl font-medium mt-3 text-white/80">
              Vinculado, aguardando playlist
            </h2>
            <p className="mt-2 text-white/50">O administrador ainda não atribuiu conteúdo.</p>
          </div>
        </div>
      ) : (
        <PlaybackEngine midias={playlistMidias} />
      )}

      <button
        onDoubleClick={reset}
        title="Resetar pareamento (clique duplo)"
        className="absolute top-2 right-2 z-50 h-8 w-8 rounded-full opacity-0 hover:opacity-60 transition-opacity bg-white/10"
      />
    </div>
  );
}