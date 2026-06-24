import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  Cliente,
  Dispositivo,
  MidiaPlaylist,
  PendingPlayer,
  Playlist,
  TipoMidia,
} from "../types/database";
import { supabase } from "@/integrations/supabase/client";

const APK_CONFIG_KEY = "apk_download_url";
const DEFAULT_APK_URL =
  "https://github.com/claudioresende2025/bright-screen-control/releases/latest/download/signagehub-player.apk";

type DbCliente = {
  id: string;
  nome_estabelecimento: string;
  contato: string;
  criado_em: string;
};
type DbPlaylist = { id: string; nome_playlist: string; criado_em: string };
type DbDispositivo = {
  id: string;
  cliente_id: string;
  nome_tela: string;
  codigo_vinculo: string;
  playlist_id: string | null;
  status_online: boolean;
  ultima_sincronizacao: string;
};
type DbMidia = {
  id: string;
  playlist_id: string;
  url_arquivo: string;
  tipo_midia: string;
  nome_arquivo: string;
  tamanho_bytes: number;
  duracao_segundos: number;
  ordem_exibicao: number;
};
type DbPending = { codigo: string; device_local_id: string; criado_em: string };

const mapCliente = (r: DbCliente): Cliente => ({
  id: r.id,
  nome_estabelecimento: r.nome_estabelecimento,
  contato: r.contato ?? "",
  criado_em: r.criado_em,
});
const mapPlaylist = (r: DbPlaylist): Playlist => ({
  id: r.id,
  nome_playlist: r.nome_playlist,
  criado_em: r.criado_em,
});
const mapDispositivo = (r: DbDispositivo): Dispositivo => ({
  id: r.id,
  cliente_id: r.cliente_id,
  nome_tela: r.nome_tela,
  codigo_vinculo: r.codigo_vinculo,
  playlist_id: r.playlist_id,
  status_online: r.status_online,
  ultima_sincronizacao: r.ultima_sincronizacao,
});
const mapMidia = (r: DbMidia): MidiaPlaylist => ({
  id: r.id,
  playlist_id: r.playlist_id,
  url_arquivo: r.url_arquivo,
  tipo_midia: (r.tipo_midia === "video" ? "video" : "image") as TipoMidia,
  nome_arquivo: r.nome_arquivo,
  tamanho_bytes: Number(r.tamanho_bytes ?? 0),
  duracao_segundos: r.duracao_segundos,
  ordem_exibicao: r.ordem_exibicao,
});
const mapPending = (r: DbPending): PendingPlayer => ({
  codigo: r.codigo,
  device_local_id: r.device_local_id,
  criado_em: r.criado_em,
});

// ---------- Context ----------
interface DataCtx {
  clientes: Cliente[];
  dispositivos: Dispositivo[];
  playlists: Playlist[];
  midias: MidiaPlaylist[];
  pendingPlayers: PendingPlayer[];
  hydrated: boolean;

  criarCliente: (data: Omit<Cliente, "id" | "criado_em">) => Promise<Cliente>;
  atualizarCliente: (id: string, data: Partial<Cliente>) => Promise<void>;
  removerCliente: (id: string) => Promise<void>;

  vincularDispositivo: (data: {
    cliente_id: string;
    nome_tela: string;
    codigo_vinculo: string;
  }) => Promise<Dispositivo>;
  vincularPorCodigo: (data: {
    cliente_id: string;
    nome_tela: string;
    codigo: string;
  }) => Promise<Dispositivo>;
  registrarPendingPlayer: (codigo: string, device_local_id: string) => void;
  removerPendingPlayer: (codigo: string) => void;
  getDispositivoPorCodigo: (codigo: string) => Dispositivo | undefined;
  heartbeatDispositivo: (id: string) => void;
  removerDispositivo: (id: string) => Promise<void>;
  trocarPlaylistDoDispositivo: (id: string, playlist_id: string | null) => Promise<void>;

  criarPlaylist: (nome: string) => Promise<Playlist>;
  renomearPlaylist: (id: string, nome: string) => Promise<void>;
  removerPlaylist: (id: string) => Promise<void>;

  adicionarMidia: (data: {
    playlist_id: string;
    url_arquivo: string;
    tipo_midia: TipoMidia;
    nome_arquivo: string;
    tamanho_bytes: number;
    duracao_segundos?: number;
  }) => Promise<MidiaPlaylist>;
  removerMidia: (id: string) => Promise<void>;
  atualizarDuracaoMidia: (id: string, duracao_segundos: number) => Promise<void>;
  reordenarMidia: (id: string, direcao: "up" | "down") => Promise<void>;

  apkDownloadUrl: string;
  setApkDownloadUrl: (url: string) => void;
}

const Ctx = createContext<DataCtx | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [midias, setMidias] = useState<MidiaPlaylist[]>([]);
  const [pendingPlayers, setPendingPlayers] = useState<PendingPlayer[]>([]);
  const [apkDownloadUrl, setApkDownloadUrlState] = useState<string>(DEFAULT_APK_URL);

  // ---------- Hydrate + Realtime ----------
  useEffect(() => {
    let active = true;

    (async () => {
      const [cli, pls, mid, disp, pend, cfg] = await Promise.all([
        supabase.from("clientes").select("*").order("criado_em", { ascending: true }),
        supabase.from("playlists").select("*").order("criado_em", { ascending: true }),
        supabase.from("midias").select("*"),
        supabase.from("dispositivos").select("*"),
        supabase.from("pending_players").select("*"),
        supabase.from("app_config").select("*").eq("key", APK_CONFIG_KEY).maybeSingle(),
      ]);
      if (!active) return;
      if (cli.data) setClientes(cli.data.map(mapCliente));
      if (pls.data) setPlaylists(pls.data.map(mapPlaylist));
      if (mid.data) setMidias(mid.data.map(mapMidia));
      if (disp.data) setDispositivos(disp.data.map(mapDispositivo));
      if (pend.data) setPendingPlayers(pend.data.map(mapPending));
      if (cfg.data?.value) setApkDownloadUrlState(cfg.data.value);
    })();

    const channel = supabase
      .channel("data-store")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "clientes" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setClientes((p) => [...p.filter((x) => x.id !== (payload.new as DbCliente).id), mapCliente(payload.new as DbCliente)]);
          } else if (payload.eventType === "UPDATE") {
            setClientes((p) => p.map((x) => (x.id === (payload.new as DbCliente).id ? mapCliente(payload.new as DbCliente) : x)));
          } else if (payload.eventType === "DELETE") {
            setClientes((p) => p.filter((x) => x.id !== (payload.old as DbCliente).id));
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "playlists" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setPlaylists((p) => [...p.filter((x) => x.id !== (payload.new as DbPlaylist).id), mapPlaylist(payload.new as DbPlaylist)]);
          } else if (payload.eventType === "UPDATE") {
            setPlaylists((p) => p.map((x) => (x.id === (payload.new as DbPlaylist).id ? mapPlaylist(payload.new as DbPlaylist) : x)));
          } else if (payload.eventType === "DELETE") {
            setPlaylists((p) => p.filter((x) => x.id !== (payload.old as DbPlaylist).id));
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "midias" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setMidias((p) => [...p.filter((x) => x.id !== (payload.new as DbMidia).id), mapMidia(payload.new as DbMidia)]);
          } else if (payload.eventType === "UPDATE") {
            setMidias((p) => p.map((x) => (x.id === (payload.new as DbMidia).id ? mapMidia(payload.new as DbMidia) : x)));
          } else if (payload.eventType === "DELETE") {
            setMidias((p) => p.filter((x) => x.id !== (payload.old as DbMidia).id));
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "dispositivos" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setDispositivos((p) => [...p.filter((x) => x.id !== (payload.new as DbDispositivo).id), mapDispositivo(payload.new as DbDispositivo)]);
          } else if (payload.eventType === "UPDATE") {
            setDispositivos((p) => p.map((x) => (x.id === (payload.new as DbDispositivo).id ? mapDispositivo(payload.new as DbDispositivo) : x)));
          } else if (payload.eventType === "DELETE") {
            setDispositivos((p) => p.filter((x) => x.id !== (payload.old as DbDispositivo).id));
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pending_players" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setPendingPlayers((p) => [...p.filter((x) => x.codigo !== (payload.new as DbPending).codigo), mapPending(payload.new as DbPending)]);
          } else if (payload.eventType === "UPDATE") {
            setPendingPlayers((p) => p.map((x) => (x.codigo === (payload.new as DbPending).codigo ? mapPending(payload.new as DbPending) : x)));
          } else if (payload.eventType === "DELETE") {
            setPendingPlayers((p) => p.filter((x) => x.codigo !== (payload.old as DbPending).codigo));
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "app_config", filter: `key=eq.${APK_CONFIG_KEY}` },
        (payload) => {
          const row = payload.new as { key: string; value: string } | null;
          if (row?.value !== undefined) setApkDownloadUrlState(row.value || "");
        },
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  // ---------- Mutations ----------
  const setApkDownloadUrl = useCallback(async (url: string) => {
    setApkDownloadUrlState(url);
    await supabase.from("app_config").upsert({ key: APK_CONFIG_KEY, value: url, atualizado_em: new Date().toISOString() });
  }, []);

  const criarCliente: DataCtx["criarCliente"] = useCallback(async (data) => {
    const { data: row, error } = await supabase
      .from("clientes")
      .insert({ nome_estabelecimento: data.nome_estabelecimento, contato: data.contato })
      .select()
      .single();
    if (error || !row) throw error ?? new Error("Falha ao criar cliente");
    const c = mapCliente(row as DbCliente);
    setClientes((p) => [...p.filter((x) => x.id !== c.id), c]);
    return c;
  }, []);

  const atualizarCliente: DataCtx["atualizarCliente"] = useCallback(async (id, data) => {
    const { error } = await supabase.from("clientes").update(data).eq("id", id);
    if (error) throw error;
  }, []);

  const removerCliente: DataCtx["removerCliente"] = useCallback(async (id) => {
    const { error } = await supabase.from("clientes").delete().eq("id", id);
    if (error) throw error;
  }, []);

  const vincularDispositivo: DataCtx["vincularDispositivo"] = useCallback(async (data) => {
    const { data: row, error } = await supabase
      .from("dispositivos")
      .insert({
        cliente_id: data.cliente_id,
        nome_tela: data.nome_tela,
        codigo_vinculo: data.codigo_vinculo,
        status_online: true,
        ultima_sincronizacao: new Date().toISOString(),
      })
      .select()
      .single();
    if (error || !row) throw error ?? new Error("Falha ao vincular dispositivo");
    const d = mapDispositivo(row as DbDispositivo);
    setDispositivos((p) => [...p.filter((x) => x.id !== d.id), d]);
    return d;
  }, []);

  const vincularPorCodigo: DataCtx["vincularPorCodigo"] = useCallback(async (data) => {
    const { data: pending } = await supabase
      .from("pending_players")
      .select("*")
      .eq("codigo", data.codigo)
      .maybeSingle();
    if (!pending) throw new Error("Nenhum player aguardando vínculo com esse código");

    const { data: row, error } = await supabase
      .from("dispositivos")
      .insert({
        cliente_id: data.cliente_id,
        nome_tela: data.nome_tela,
        codigo_vinculo: data.codigo,
        device_local_id: pending.device_local_id,
        status_online: true,
        ultima_sincronizacao: new Date().toISOString(),
      })
      .select()
      .single();
    if (error || !row) throw error ?? new Error("Falha ao vincular");
    await supabase.from("pending_players").delete().eq("codigo", data.codigo);
    const d = mapDispositivo(row as DbDispositivo);
    setDispositivos((p) => [...p.filter((x) => x.id !== d.id), d]);
    setPendingPlayers((p) => p.filter((x) => x.codigo !== data.codigo));
    return d;
  }, []);

  const registrarPendingPlayer: DataCtx["registrarPendingPlayer"] = useCallback(
    (codigo, device_local_id) => {
      // Upsert; ignore failure if dispositivo already exists for that code
      void supabase
        .from("pending_players")
        .upsert({ codigo, device_local_id }, { onConflict: "codigo" })
        .then(({ error }) => {
          if (error) console.warn("registrarPendingPlayer", error.message);
        });
    },
    [],
  );

  const removerPendingPlayer: DataCtx["removerPendingPlayer"] = useCallback((codigo) => {
    void supabase.from("pending_players").delete().eq("codigo", codigo);
  }, []);

  const getDispositivoPorCodigo: DataCtx["getDispositivoPorCodigo"] = useCallback(
    (codigo) => dispositivos.find((d) => d.codigo_vinculo === codigo),
    [dispositivos],
  );

  const heartbeatDispositivo: DataCtx["heartbeatDispositivo"] = useCallback((id) => {
    void supabase
      .from("dispositivos")
      .update({ status_online: true, ultima_sincronizacao: new Date().toISOString() })
      .eq("id", id);
  }, []);

  const removerDispositivo: DataCtx["removerDispositivo"] = useCallback(async (id) => {
    const { error } = await supabase.from("dispositivos").delete().eq("id", id);
    if (error) throw error;
  }, []);

  const trocarPlaylistDoDispositivo: DataCtx["trocarPlaylistDoDispositivo"] = useCallback(
    async (id, playlist_id) => {
      const { error } = await supabase
        .from("dispositivos")
        .update({ playlist_id, ultima_sincronizacao: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    [],
  );

  const criarPlaylist: DataCtx["criarPlaylist"] = useCallback(async (nome) => {
    const { data: row, error } = await supabase
      .from("playlists")
      .insert({ nome_playlist: nome })
      .select()
      .single();
    if (error || !row) throw error ?? new Error("Falha ao criar playlist");
    const pl = mapPlaylist(row as DbPlaylist);
    setPlaylists((p) => [...p.filter((x) => x.id !== pl.id), pl]);
    return pl;
  }, []);

  const renomearPlaylist: DataCtx["renomearPlaylist"] = useCallback(async (id, nome) => {
    const { error } = await supabase.from("playlists").update({ nome_playlist: nome }).eq("id", id);
    if (error) throw error;
  }, []);

  const removerPlaylist: DataCtx["removerPlaylist"] = useCallback(async (id) => {
    const { error } = await supabase.from("playlists").delete().eq("id", id);
    if (error) throw error;
  }, []);

  const adicionarMidia: DataCtx["adicionarMidia"] = useCallback(async (data) => {
    const ordem =
      Math.max(0, ...midias.filter((m) => m.playlist_id === data.playlist_id).map((m) => m.ordem_exibicao)) + 1;
    const { data: row, error } = await supabase
      .from("midias")
      .insert({
        playlist_id: data.playlist_id,
        url_arquivo: data.url_arquivo,
        tipo_midia: data.tipo_midia,
        nome_arquivo: data.nome_arquivo,
        tamanho_bytes: data.tamanho_bytes,
        duracao_segundos: data.duracao_segundos ?? (data.tipo_midia === "image" ? 10 : 15),
        ordem_exibicao: ordem,
      })
      .select()
      .single();
    if (error || !row) throw error ?? new Error("Falha ao salvar mídia");
    const m = mapMidia(row as DbMidia);
    setMidias((p) => [...p.filter((x) => x.id !== m.id), m]);
    return m;
  }, [midias]);

  const removerMidia: DataCtx["removerMidia"] = useCallback(async (id) => {
    const { error } = await supabase.from("midias").delete().eq("id", id);
    if (error) throw error;
  }, []);

  const atualizarDuracaoMidia: DataCtx["atualizarDuracaoMidia"] = useCallback(
    async (id, duracao_segundos) => {
      const { error } = await supabase.from("midias").update({ duracao_segundos }).eq("id", id);
      if (error) throw error;
    },
    [],
  );

  const reordenarMidia: DataCtx["reordenarMidia"] = useCallback(async (id, direcao) => {
    const target = midias.find((m) => m.id === id);
    if (!target) return;
    const irmas = midias
      .filter((m) => m.playlist_id === target.playlist_id)
      .sort((a, b) => a.ordem_exibicao - b.ordem_exibicao);
    const idx = irmas.findIndex((m) => m.id === id);
    const swapIdx = direcao === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= irmas.length) return;
    const a = irmas[idx];
    const b = irmas[swapIdx];
    await Promise.all([
      supabase.from("midias").update({ ordem_exibicao: b.ordem_exibicao }).eq("id", a.id),
      supabase.from("midias").update({ ordem_exibicao: a.ordem_exibicao }).eq("id", b.id),
    ]);
  }, [midias]);

  const value = useMemo<DataCtx>(
    () => ({
      clientes,
      dispositivos,
      playlists,
      midias,
      pendingPlayers,
      criarCliente,
      atualizarCliente,
      removerCliente,
      vincularDispositivo,
      vincularPorCodigo,
      registrarPendingPlayer,
      removerPendingPlayer,
      getDispositivoPorCodigo,
      heartbeatDispositivo,
      removerDispositivo,
      trocarPlaylistDoDispositivo,
      criarPlaylist,
      renomearPlaylist,
      removerPlaylist,
      adicionarMidia,
      removerMidia,
      atualizarDuracaoMidia,
      reordenarMidia,
      apkDownloadUrl,
      setApkDownloadUrl,
    }),
    [
      clientes,
      dispositivos,
      playlists,
      midias,
      pendingPlayers,
      criarCliente,
      atualizarCliente,
      removerCliente,
      vincularDispositivo,
      vincularPorCodigo,
      registrarPendingPlayer,
      removerPendingPlayer,
      getDispositivoPorCodigo,
      heartbeatDispositivo,
      removerDispositivo,
      trocarPlaylistDoDispositivo,
      criarPlaylist,
      renomearPlaylist,
      removerPlaylist,
      adicionarMidia,
      removerMidia,
      atualizarDuracaoMidia,
      reordenarMidia,
      apkDownloadUrl,
      setApkDownloadUrl,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useData() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useData deve ser usado dentro de DataProvider");
  return ctx;
}

// ---------- Utils ----------
export function formatarTamanho(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function tempoRelativo(iso: string) {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const s = Math.floor(diff / 1000);
  if (s < 60) return `há ${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `há ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `há ${h}h`;
  const d = Math.floor(h / 24);
  return `há ${d}d`;
}