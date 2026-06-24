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

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function nowISO(offsetMs = 0) {
  return new Date(Date.now() - offsetMs).toISOString();
}

// ---------- Seed ----------
const cli1 = "cli_supermercado";
const cli2 = "cli_academia";
const cli3 = "cli_clinica";

const pl1 = "pl_promocoes";
const pl2 = "pl_institucional";

const seedClientes: Cliente[] = [
  {
    id: cli1,
    nome_estabelecimento: "Supermercado Bom Preço",
    contato: "contato@bompreco.com.br",
    criado_em: nowISO(1000 * 60 * 60 * 24 * 30),
  },
  {
    id: cli2,
    nome_estabelecimento: "Academia Fit Center",
    contato: "gerencia@fitcenter.com.br",
    criado_em: nowISO(1000 * 60 * 60 * 24 * 20),
  },
  {
    id: cli3,
    nome_estabelecimento: "Clínica Vida Saudável",
    contato: "recepcao@vidasaudavel.com.br",
    criado_em: nowISO(1000 * 60 * 60 * 24 * 12),
  },
];

const seedPlaylists: Playlist[] = [
  { id: pl1, nome_playlist: "Promoções da Semana", criado_em: nowISO(1000 * 60 * 60 * 24 * 10) },
  { id: pl2, nome_playlist: "Institucional Geral", criado_em: nowISO(1000 * 60 * 60 * 24 * 6) },
];

const seedDispositivos: Dispositivo[] = [
  {
    id: uid("dev"),
    cliente_id: cli1,
    nome_tela: "Entrada Principal",
    codigo_vinculo: "482193",
    playlist_id: pl1,
    status_online: true,
    ultima_sincronizacao: nowISO(1000 * 60 * 2),
  },
  {
    id: uid("dev"),
    cliente_id: cli1,
    nome_tela: "Corredor de Caixas",
    codigo_vinculo: "739204",
    playlist_id: pl1,
    status_online: true,
    ultima_sincronizacao: nowISO(1000 * 60 * 4),
  },
  {
    id: uid("dev"),
    cliente_id: cli2,
    nome_tela: "Tela Principal — Recepção",
    codigo_vinculo: "118827",
    playlist_id: pl2,
    status_online: true,
    ultima_sincronizacao: nowISO(1000 * 60),
  },
  {
    id: uid("dev"),
    cliente_id: cli2,
    nome_tela: "Sala de Musculação",
    codigo_vinculo: "560341",
    playlist_id: pl2,
    status_online: false,
    ultima_sincronizacao: nowISO(1000 * 60 * 47),
  },
  {
    id: uid("dev"),
    cliente_id: cli3,
    nome_tela: "Sala de Espera",
    codigo_vinculo: "904756",
    playlist_id: pl2,
    status_online: true,
    ultima_sincronizacao: nowISO(1000 * 60 * 7),
  },
];

const img = (id: number) => `https://picsum.photos/seed/sig${id}/600/400`;
const vid = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

const seedMidias: MidiaPlaylist[] = [
  {
    id: uid("md"),
    playlist_id: pl1,
    url_arquivo: img(11),
    tipo_midia: "image",
    duracao_segundos: 10,
    ordem_exibicao: 1,
    nome_arquivo: "promo-frutas.jpg",
    tamanho_bytes: 412_300,
  },
  {
    id: uid("md"),
    playlist_id: pl1,
    url_arquivo: img(12),
    tipo_midia: "image",
    duracao_segundos: 8,
    ordem_exibicao: 2,
    nome_arquivo: "promo-acougue.jpg",
    tamanho_bytes: 388_120,
  },
  {
    id: uid("md"),
    playlist_id: pl1,
    url_arquivo: img(13),
    tipo_midia: "image",
    duracao_segundos: 12,
    ordem_exibicao: 3,
    nome_arquivo: "promo-bebidas.png",
    tamanho_bytes: 524_000,
  },
  {
    id: uid("md"),
    playlist_id: pl1,
    url_arquivo: vid,
    tipo_midia: "video",
    duracao_segundos: 32,
    ordem_exibicao: 4,
    nome_arquivo: "spot-ofertas.mp4",
    tamanho_bytes: 4_812_000,
  },
  {
    id: uid("md"),
    playlist_id: pl2,
    url_arquivo: vid,
    tipo_midia: "video",
    duracao_segundos: 45,
    ordem_exibicao: 1,
    nome_arquivo: "institucional-abertura.mp4",
    tamanho_bytes: 6_200_000,
  },
  {
    id: uid("md"),
    playlist_id: pl2,
    url_arquivo: img(21),
    tipo_midia: "image",
    duracao_segundos: 10,
    ordem_exibicao: 2,
    nome_arquivo: "valores.jpg",
    tamanho_bytes: 298_400,
  },
  {
    id: uid("md"),
    playlist_id: pl2,
    url_arquivo: img(22),
    tipo_midia: "image",
    duracao_segundos: 10,
    ordem_exibicao: 3,
    nome_arquivo: "equipe.jpg",
    tamanho_bytes: 312_900,
  },
  {
    id: uid("md"),
    playlist_id: pl2,
    url_arquivo: vid,
    tipo_midia: "video",
    duracao_segundos: 28,
    ordem_exibicao: 4,
    nome_arquivo: "depoimento-cliente.mp4",
    tamanho_bytes: 5_120_000,
  },
];

// ---------- Context ----------
interface DataCtx {
  clientes: Cliente[];
  dispositivos: Dispositivo[];
  playlists: Playlist[];
  midias: MidiaPlaylist[];
  pendingPlayers: PendingPlayer[];

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

const delay = (ms = 120) => new Promise((r) => setTimeout(r, ms));

export function DataProvider({ children }: { children: ReactNode }) {
  const [clientes, setClientes] = useState<Cliente[]>(seedClientes);
  const [dispositivos, setDispositivos] = useState<Dispositivo[]>(seedDispositivos);
  const [playlists, setPlaylists] = useState<Playlist[]>(seedPlaylists);
  const [midias, setMidias] = useState<MidiaPlaylist[]>(seedMidias);
  const [pendingPlayers, setPendingPlayers] = useState<PendingPlayer[]>([]);
  const DEFAULT_APK_URL =
    "https://github.com/claudioresende2025/bright-screen-control/releases/latest/download/signagehub-player.apk";
  const [apkDownloadUrl, setApkDownloadUrlState] = useState<string>(DEFAULT_APK_URL);

  // Hydrate APK url from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("signagehub_apk_url");
    if (saved) setApkDownloadUrlState(saved);
  }, []);

  const setApkDownloadUrl = useCallback((url: string) => {
    setApkDownloadUrlState(url);
    if (typeof window !== "undefined") {
      if (url) localStorage.setItem("signagehub_apk_url", url);
      else localStorage.removeItem("signagehub_apk_url");
    }
  }, []);

  // Simulação de sincronização em tempo real
  useEffect(() => {
    const t = setInterval(() => {
      setDispositivos((prev) =>
        prev.map((d) =>
          d.status_online ? { ...d, ultima_sincronizacao: new Date().toISOString() } : d,
        ),
      );
    }, 8000);
    return () => clearInterval(t);
  }, []);

  const criarCliente: DataCtx["criarCliente"] = useCallback(async (data) => {
    await delay();
    const c: Cliente = { ...data, id: uid("cli"), criado_em: new Date().toISOString() };
    setClientes((p) => [...p, c]);
    return c;
  }, []);

  const atualizarCliente: DataCtx["atualizarCliente"] = useCallback(async (id, data) => {
    await delay();
    setClientes((p) => p.map((c) => (c.id === id ? { ...c, ...data } : c)));
  }, []);

  const removerCliente: DataCtx["removerCliente"] = useCallback(async (id) => {
    await delay();
    setClientes((p) => p.filter((c) => c.id !== id));
    setDispositivos((p) => p.filter((d) => d.cliente_id !== id));
  }, []);

  const vincularDispositivo: DataCtx["vincularDispositivo"] = useCallback(async (data) => {
    await delay(300);
    const d: Dispositivo = {
      id: uid("dev"),
      cliente_id: data.cliente_id,
      nome_tela: data.nome_tela,
      codigo_vinculo: data.codigo_vinculo,
      playlist_id: null,
      status_online: true,
      ultima_sincronizacao: new Date().toISOString(),
    };
    setDispositivos((p) => [...p, d]);
    return d;
  }, []);

  const vincularPorCodigo: DataCtx["vincularPorCodigo"] = useCallback(async (data) => {
    await delay(300);
    // Check pending player with that code
    const pending = pendingPlayers.find((p) => p.codigo === data.codigo);
    if (!pending) {
      throw new Error("Nenhum player aguardando vínculo com esse código");
    }
    const d: Dispositivo = {
      id: pending.device_local_id,
      cliente_id: data.cliente_id,
      nome_tela: data.nome_tela,
      codigo_vinculo: data.codigo,
      playlist_id: null,
      status_online: true,
      ultima_sincronizacao: new Date().toISOString(),
    };
    setDispositivos((p) => [...p, d]);
    setPendingPlayers((p) => p.filter((x) => x.codigo !== data.codigo));
    return d;
  }, [pendingPlayers]);

  const registrarPendingPlayer: DataCtx["registrarPendingPlayer"] = useCallback(
    (codigo, device_local_id) => {
      setPendingPlayers((p) => {
        if (p.some((x) => x.codigo === codigo)) return p;
        return [...p, { codigo, device_local_id, criado_em: new Date().toISOString() }];
      });
    },
    [],
  );

  const removerPendingPlayer: DataCtx["removerPendingPlayer"] = useCallback((codigo) => {
    setPendingPlayers((p) => p.filter((x) => x.codigo !== codigo));
  }, []);

  const getDispositivoPorCodigo: DataCtx["getDispositivoPorCodigo"] = useCallback(
    (codigo) => dispositivos.find((d) => d.codigo_vinculo === codigo),
    [dispositivos],
  );

  const heartbeatDispositivo: DataCtx["heartbeatDispositivo"] = useCallback((id) => {
    setDispositivos((p) =>
      p.map((d) =>
        d.id === id
          ? { ...d, status_online: true, ultima_sincronizacao: new Date().toISOString() }
          : d,
      ),
    );
  }, []);

  const removerDispositivo: DataCtx["removerDispositivo"] = useCallback(async (id) => {
    await delay();
    setDispositivos((p) => p.filter((d) => d.id !== id));
  }, []);

  const trocarPlaylistDoDispositivo: DataCtx["trocarPlaylistDoDispositivo"] = useCallback(
    async (id, playlist_id) => {
      await delay();
      setDispositivos((p) =>
        p.map((d) =>
          d.id === id
            ? { ...d, playlist_id, ultima_sincronizacao: new Date().toISOString() }
            : d,
        ),
      );
    },
    [],
  );

  const criarPlaylist: DataCtx["criarPlaylist"] = useCallback(async (nome) => {
    await delay();
    const pl: Playlist = { id: uid("pl"), nome_playlist: nome, criado_em: new Date().toISOString() };
    setPlaylists((p) => [...p, pl]);
    return pl;
  }, []);

  const renomearPlaylist: DataCtx["renomearPlaylist"] = useCallback(async (id, nome) => {
    await delay();
    setPlaylists((p) => p.map((pl) => (pl.id === id ? { ...pl, nome_playlist: nome } : pl)));
  }, []);

  const removerPlaylist: DataCtx["removerPlaylist"] = useCallback(async (id) => {
    await delay();
    setPlaylists((p) => p.filter((pl) => pl.id !== id));
    setMidias((p) => p.filter((m) => m.playlist_id !== id));
    setDispositivos((p) => p.map((d) => (d.playlist_id === id ? { ...d, playlist_id: null } : d)));
  }, []);

  const adicionarMidia: DataCtx["adicionarMidia"] = useCallback(async (data) => {
    await delay(200);
    const ordem =
      Math.max(0, ...midias.filter((m) => m.playlist_id === data.playlist_id).map((m) => m.ordem_exibicao)) + 1;
    const m: MidiaPlaylist = {
      id: uid("md"),
      playlist_id: data.playlist_id,
      url_arquivo: data.url_arquivo,
      tipo_midia: data.tipo_midia,
      nome_arquivo: data.nome_arquivo,
      tamanho_bytes: data.tamanho_bytes,
      duracao_segundos: data.duracao_segundos ?? (data.tipo_midia === "image" ? 10 : 15),
      ordem_exibicao: ordem,
    };
    setMidias((p) => [...p, m]);
    return m;
  }, [midias]);

  const removerMidia: DataCtx["removerMidia"] = useCallback(async (id) => {
    await delay();
    setMidias((p) => p.filter((m) => m.id !== id));
  }, []);

  const atualizarDuracaoMidia: DataCtx["atualizarDuracaoMidia"] = useCallback(
    async (id, duracao_segundos) => {
      await delay(60);
      setMidias((p) => p.map((m) => (m.id === id ? { ...m, duracao_segundos } : m)));
    },
    [],
  );

  const reordenarMidia: DataCtx["reordenarMidia"] = useCallback(async (id, direcao) => {
    await delay(40);
    setMidias((prev) => {
      const target = prev.find((m) => m.id === id);
      if (!target) return prev;
      const irmas = prev
        .filter((m) => m.playlist_id === target.playlist_id)
        .sort((a, b) => a.ordem_exibicao - b.ordem_exibicao);
      const idx = irmas.findIndex((m) => m.id === id);
      const swapIdx = direcao === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= irmas.length) return prev;
      const a = irmas[idx];
      const b = irmas[swapIdx];
      return prev.map((m) => {
        if (m.id === a.id) return { ...m, ordem_exibicao: b.ordem_exibicao };
        if (m.id === b.id) return { ...m, ordem_exibicao: a.ordem_exibicao };
        return m;
      });
    });
  }, []);

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