import { useEffect, useMemo, useRef, useState } from "react";
import type { MidiaPlaylist } from "@/types/database";

interface Props {
  midias: MidiaPlaylist[];
  paused?: boolean;
  onIndexChange?: (index: number) => void;
  onProgress?: (ratio: number) => void;
  externalIndex?: number;
}

/**
 * Reproduz uma lista de mídias em loop. Vídeos avançam ao terminar; imagens
 * usam duracao_segundos. Renderiza um frame preto fullscreen do contêiner pai.
 */
export function PlaybackEngine({
  midias,
  paused = false,
  onIndexChange,
  onProgress,
  externalIndex,
}: Props) {
  const ordered = useMemo(
    () => [...midias].sort((a, b) => a.ordem_exibicao - b.ordem_exibicao),
    [midias],
  );
  const [index, setIndex] = useState(0);
  const [tick, setTick] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const startedAtRef = useRef<number>(Date.now());

  useEffect(() => {
    if (typeof externalIndex === "number" && externalIndex !== index) {
      setIndex(Math.max(0, Math.min(ordered.length - 1, externalIndex)));
    }
  }, [externalIndex, ordered.length]);

  useEffect(() => {
    onIndexChange?.(index);
    startedAtRef.current = Date.now();
  }, [index, onIndexChange]);

  const current = ordered[index];

  // Image timer
  useEffect(() => {
    if (!current || current.tipo_midia !== "image" || paused) return;
    const ms = Math.max(1, current.duracao_segundos) * 1000;
    const id = setTimeout(() => {
      setIndex((i) => (ordered.length ? (i + 1) % ordered.length : 0));
    }, ms);
    return () => clearTimeout(id);
  }, [current, paused, ordered.length]);

  // Progress ticker
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setTick((t) => t + 1), 250);
    return () => clearInterval(id);
  }, [paused]);

  useEffect(() => {
    if (!current || !onProgress) return;
    let ratio = 0;
    if (current.tipo_midia === "video" && videoRef.current) {
      const v = videoRef.current;
      ratio = v.duration ? v.currentTime / v.duration : 0;
    } else {
      const elapsed = (Date.now() - startedAtRef.current) / 1000;
      ratio = Math.min(1, elapsed / Math.max(1, current.duracao_segundos));
    }
    onProgress(ratio);
  }, [tick, current, onProgress]);

  useEffect(() => {
    if (!videoRef.current) return;
    if (paused) videoRef.current.pause();
    else videoRef.current.play().catch(() => {});
  }, [paused, current?.id]);

  if (!ordered.length) {
    return (
      <div className="absolute inset-0 grid place-items-center bg-black text-white/60">
        <div className="text-center">
          <p className="text-lg font-medium">Playlist vazia</p>
          <p className="text-sm mt-1 text-white/40">Adicione mídias no painel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {current.tipo_midia === "video" ? (
        <video
          ref={videoRef}
          key={current.id}
          src={current.url_arquivo}
          autoPlay
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-contain bg-black"
          onEnded={() =>
            setIndex((i) => (ordered.length ? (i + 1) % ordered.length : 0))
          }
        />
      ) : (
        <img
          key={current.id}
          src={current.url_arquivo}
          alt={current.nome_arquivo}
          className="absolute inset-0 w-full h-full object-contain bg-black animate-fade-in"
        />
      )}
    </div>
  );
}