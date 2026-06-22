export interface Cliente {
  id: string;
  nome_estabelecimento: string;
  contato: string;
  criado_em: string;
}

export interface Dispositivo {
  id: string;
  cliente_id: string;
  nome_tela: string;
  codigo_vinculo: string;
  playlist_id: string | null;
  status_online: boolean;
  ultima_sincronizacao: string;
}

export interface Playlist {
  id: string;
  nome_playlist: string;
  criado_em: string;
}

export type TipoMidia = "video" | "image";

export interface MidiaPlaylist {
  id: string;
  playlist_id: string;
  url_arquivo: string;
  tipo_midia: TipoMidia;
  duracao_segundos: number;
  ordem_exibicao: number;
  nome_arquivo: string;
  tamanho_bytes: number;
}

export interface PendingPlayer {
  codigo: string;
  device_local_id: string;
  criado_em: string;
}