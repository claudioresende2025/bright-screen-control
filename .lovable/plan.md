## Resposta direta

**Não, hoje não funciona assim.** O APK abre o player, gera um código de 6 dígitos e tenta registrar como "pending". Mas todos os dados (clientes, dispositivos, playlists, mídias, pending players) vivem **apenas em memória/localStorage do navegador atual** — não há backend. Resultado: o código que aparece na TV nunca chega no gerenciador aberto em outro dispositivo, e mesmo que o vínculo fosse feito, as mídias da playlist não chegariam até a TV.

Para o fluxo desejado (TV mostra código → admin vincula a uma tela com playlist → vídeos/imagens tocam na TV) é obrigatório um backend compartilhado. Plano abaixo usa Lovable Cloud (já habilitado).

## O que será feito

### 1. Backend — tabelas e storage

Migração SQL criando, no schema `public`, com GRANTs + RLS + policies:

- `clientes` (id, nome, criado_em)
- `playlists` (id, nome, criado_em)
- `midias` (id, playlist_id, url_arquivo, tipo_midia, nome_arquivo, tamanho_bytes, duracao_segundos, ordem)
- `dispositivos` (id, cliente_id, nome_tela, codigo_vinculo unique, playlist_id, status_online, ultima_sincronizacao)
- `pending_players` (codigo pk, device_local_id, criado_em)
- `app_config` (key pk, value) — guarda `apk_download_url`

Bucket de Storage público `midias` para upload de vídeos/imagens.

**Policies (sem login, fase 1 — destravar o fluxo):**
- Leitura pública (`anon`) em `dispositivos`, `playlists`, `midias`, `app_config` — necessário porque o APK não faz login.
- `pending_players`: INSERT/SELECT/DELETE público (código curto de 6 dígitos é o "segredo" temporário).
- `clientes`/`dispositivos`/`playlists`/`midias` escrita pública por enquanto (igual ao comportamento atual do painel, que também não tem auth). Deixo um TODO claro no plano para colocar auth depois.

> Observação de segurança: hoje o painel admin não tem login. Manter o mesmo nível de acesso para não quebrar nada. Se quiser, depois implementamos auth + roles e restringimos escrita a `authenticated`.

### 2. Refatorar `src/store/data-store.tsx`

Substituir o estado em memória por chamadas Supabase + Realtime:

- Hidratar listas (clientes, dispositivos, playlists, midias, pending_players) via `select`.
- Inscrever em `postgres_changes` para refletir mudanças em tempo real (essencial: quando admin vincula código, a TV reage sem refresh).
- Todas as mutações (`criar*`, `vincular*`, `trocarPlaylist*`, `adicionar/removerMidia`, `heartbeat`) viram `insert/update/delete` no Supabase.
- `apkDownloadUrl` passa a vir de `app_config` (em vez de localStorage por dispositivo) — assim o link configurado pelo admin vale para todos os players.

### 3. Upload de mídia

Em `src/routes/playlists.$id.tsx`, trocar o input atual (provavelmente data URL local) por upload pro bucket `midias` via `supabase.storage.from('midias').upload(...)` e gravar a `publicUrl` em `midias.url_arquivo`. Vídeos/imagens passam a ser servidos por URL pública acessível pelo WebView do APK.

### 4. Player (`src/routes/player.tsx`)

- Mantém geração de código de 6 dígitos e device_local_id no `localStorage` da TV.
- `registrarPendingPlayer` agora faz `upsert` no Supabase.
- Em vez de `getDispositivoPorCodigo` em memória, faz `select` + subscribe ao `dispositivos` filtrando por `codigo_vinculo=eq.<codigo>`. Quando aparecer, troca da tela de pareamento para o `PlaybackEngine`.
- Subscribe também em `midias` filtrando por `playlist_id` do dispositivo, para refletir mudanças de conteúdo ao vivo.
- `heartbeat` faz `update` em `dispositivos` a cada 30s.

### 5. Painel `/dispositivos`

Tela de vínculo passa a ler `pending_players` em tempo real (admin vê códigos de TVs aguardando) e o `vincularPorCodigo` faz a transação: cria `dispositivos` com o `codigo`, apaga o `pending_player`. Realtime entrega para a TV.

### 6. APK Android

Nenhuma mudança de código nativo necessária — o WebView já abre `https://bright-screen-control.lovable.app/player`. Só publicar o frontend.

## Fluxo final (depois da correção)

```text
TV liga APK ──► /player gera "428193" ──► INSERT pending_players
                       │
                       ▼ (Realtime)
Admin /dispositivos vê "428193" e clica "Vincular"
        │
        ▼ INSERT dispositivos(codigo_vinculo='428193', cliente, nome_tela)
                       │
                       ▼ (Realtime)
TV detecta dispositivo, sai da tela de código
Admin atribui playlist ──► UPDATE dispositivos.playlist_id
                       │
                       ▼ (Realtime)
TV carrega midias da playlist e PlaybackEngine toca
```

## Fora de escopo (posso fazer depois se pedir)

- Login do painel + RLS por usuário/role.
- Migração dos dados seed atuais.
- Encurtar/rotacionar código de pareamento após uso.
- Cache offline de mídias no APK (hoje requer internet para tocar).
