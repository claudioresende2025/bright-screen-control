
-- =========================================================================
-- 1) CLIENTES
-- =========================================================================
CREATE TABLE public.clientes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_estabelecimento TEXT NOT NULL,
  contato TEXT NOT NULL DEFAULT '',
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clientes TO anon, authenticated;
GRANT ALL ON public.clientes TO service_role;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clientes_public_all" ON public.clientes FOR ALL USING (true) WITH CHECK (true);

-- =========================================================================
-- 2) PLAYLISTS
-- =========================================================================
CREATE TABLE public.playlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_playlist TEXT NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.playlists TO anon, authenticated;
GRANT ALL ON public.playlists TO service_role;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "playlists_public_all" ON public.playlists FOR ALL USING (true) WITH CHECK (true);

-- =========================================================================
-- 3) MIDIAS
-- =========================================================================
CREATE TABLE public.midias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  url_arquivo TEXT NOT NULL,
  tipo_midia TEXT NOT NULL CHECK (tipo_midia IN ('image','video')),
  nome_arquivo TEXT NOT NULL,
  tamanho_bytes BIGINT NOT NULL DEFAULT 0,
  duracao_segundos INTEGER NOT NULL DEFAULT 10,
  ordem_exibicao INTEGER NOT NULL DEFAULT 1,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_midias_playlist ON public.midias(playlist_id, ordem_exibicao);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.midias TO anon, authenticated;
GRANT ALL ON public.midias TO service_role;
ALTER TABLE public.midias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "midias_public_all" ON public.midias FOR ALL USING (true) WITH CHECK (true);

-- =========================================================================
-- 4) DISPOSITIVOS
-- =========================================================================
CREATE TABLE public.dispositivos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  nome_tela TEXT NOT NULL,
  codigo_vinculo TEXT NOT NULL UNIQUE,
  playlist_id UUID REFERENCES public.playlists(id) ON DELETE SET NULL,
  device_local_id TEXT,
  status_online BOOLEAN NOT NULL DEFAULT true,
  ultima_sincronizacao TIMESTAMPTZ NOT NULL DEFAULT now(),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_dispositivos_cliente ON public.dispositivos(cliente_id);
CREATE INDEX idx_dispositivos_codigo ON public.dispositivos(codigo_vinculo);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dispositivos TO anon, authenticated;
GRANT ALL ON public.dispositivos TO service_role;
ALTER TABLE public.dispositivos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dispositivos_public_all" ON public.dispositivos FOR ALL USING (true) WITH CHECK (true);

-- =========================================================================
-- 5) PENDING PLAYERS (TVs aguardando vínculo)
-- =========================================================================
CREATE TABLE public.pending_players (
  codigo TEXT NOT NULL PRIMARY KEY,
  device_local_id TEXT NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pending_players TO anon, authenticated;
GRANT ALL ON public.pending_players TO service_role;
ALTER TABLE public.pending_players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pending_players_public_all" ON public.pending_players FOR ALL USING (true) WITH CHECK (true);

-- =========================================================================
-- 6) APP_CONFIG
-- =========================================================================
CREATE TABLE public.app_config (
  key TEXT NOT NULL PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_config TO anon, authenticated;
GRANT ALL ON public.app_config TO service_role;
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "app_config_public_all" ON public.app_config FOR ALL USING (true) WITH CHECK (true);

INSERT INTO public.app_config(key, value) VALUES
  ('apk_download_url', 'https://github.com/claudioresende2025/bright-screen-control/releases/latest/download/signagehub-player.apk')
ON CONFLICT (key) DO NOTHING;

-- =========================================================================
-- 7) REALTIME
-- =========================================================================
ALTER TABLE public.clientes        REPLICA IDENTITY FULL;
ALTER TABLE public.playlists       REPLICA IDENTITY FULL;
ALTER TABLE public.midias          REPLICA IDENTITY FULL;
ALTER TABLE public.dispositivos    REPLICA IDENTITY FULL;
ALTER TABLE public.pending_players REPLICA IDENTITY FULL;
ALTER TABLE public.app_config      REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.clientes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.playlists;
ALTER PUBLICATION supabase_realtime ADD TABLE public.midias;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dispositivos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pending_players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.app_config;
