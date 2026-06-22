## Visão Geral

Painel administrativo single-user (você como Admin) para gerenciar TVs de Digital Signage em estabelecimentos parceiros. Inspirado no Climb Player: foco em monitoramento de terminais, vinculação por código de pareamento e gestão de playlists com mídias ordenáveis.

Tudo rodará **mockado em memória** (React Context + estado), mas com tipos/shape idênticos às tabelas Supabase para conexão futura sem refactor.

---

## Estrutura de Navegação

Sidebar fixa à esquerda (dark, colapsável em mobile):

- Dashboard (visão geral + métricas)
- Dispositivos (TVs / Terminais)
- Playlists
- Clientes
- (rodapé) Admin badge

Header superior com título da página atual + ação principal contextual.

---

## Rotas (TanStack Router)

```
src/routes/
  __root.tsx           → SidebarProvider + layout shell dark
  index.tsx            → Dashboard
  dispositivos.tsx     → Grid de terminais
  playlists.tsx        → Lista de playlists
  playlists.$id.tsx    → Editor de playlist (upload + ordenação)
  clientes.tsx         → Lista de clientes
```

Cada rota tem `head()` próprio (title/description).

---

## Telas

### Dashboard (`/`)

- 4 cards de métricas no topo:
  - Total de Terminais
  - TVs Online (badge verde com pulse animation)
  - TVs Offline (badge vermelho)
  - Total de Playlists
- Seção "Atividade Recente": últimas sincronizações dos dispositivos
- Seção "Status por Cliente": mini-tabela agrupando TVs por estabelecimento

### Dispositivos (`/dispositivos`)

- Grid responsivo de cards (3 col desktop, 2 tablet, 1 mobile)
- Cada card:
  - Nome da TV + ícone Monitor
  - Cliente/Local (subtítulo)
  - Status badge (Online verde piscante / Offline cinza)
  - Playlist ativa (com Select inline para troca rápida)
  - "Última sincronização: há X min" (relativo)
  - Menu de ações (editar, remover)
- Botão CTA topo direito: **"Vincular Novo Terminal"**
- Modal de vinculação com campos:
  - Nome do Ponto de Tela (input)
  - Cliente (Select com opção "+ Novo Cliente")
  - Código de Pareamento (6 dígitos, input-otp estilizado)
- Empty state ilustrado quando nenhum terminal cadastrado

### Playlists (`/playlists`)

- Lista/grid de playlists com:
  - Nome
  - Nº de mídias
  - Duração total estimada
  - Dispositivos usando
  - Botão "Editar" → navega a `/playlists/$id`
- Botão "Nova Playlist"

### Editor de Playlist (`/playlists/$id`)

- Header com nome editável da playlist
- Área de upload Drag & Drop (dashed border, ícone Upload)
  - Aceita .mp4, .png, .jpg, .jpeg
  - Mostra barra de progresso simulada por arquivo durante "upload"
- Lista vertical ordenada (reordenação por botões ↑/↓ ou drag handle):
  - Thumbnail (vídeo: frame placeholder / imagem: preview)
  - Ícone tipo (Video / Image)
  - Nome do arquivo + tamanho (KB/MB)
  - Se imagem: input numérico "Duração (s)" inline, default 10
  - Se vídeo: badge "duração do vídeo"
  - Botão remover (Trash)
- Empty state quando playlist vazia

### Clientes (`/clientes`)

- Tabela: Estabelecimento, Contato, Nº de TVs, Criado em, Ações
- Modal criar/editar cliente

---

## Modelo de Dados (TypeScript ↔ Supabase)

`src/types/database.ts` — interfaces espelhando o schema:

```ts
interface Cliente {
  id: string;
  nome_estabelecimento: string;
  contato: string;
  criado_em: string; // ISO
}
interface Dispositivo {
  id: string;
  cliente_id: string;
  nome_tela: string;
  codigo_vinculo: string; // 6 dígitos
  playlist_id: string | null;
  status_online: boolean;
  ultima_sincronizacao: string; // ISO
}
interface Playlist {
  id: string;
  nome_playlist: string;
  criado_em: string;
}
interface MidiaPlaylist {
  id: string;
  playlist_id: string;
  url_arquivo: string;
  tipo_midia: 'video' | 'image';
  duracao_segundos: number;
  ordem_exibicao: number;
  // extras de UI (não persistidos): nome_arquivo, tamanho_bytes
}
```

## Camada de Dados Mockada

`src/store/data-store.tsx` — React Context provedor único:

- Estado in-memory com seed inicial
- Funções CRUD assíncronas (`async` com `setTimeout` simulando latência) com mesma assinatura esperada de chamadas Supabase → troca futura é apenas substituir o corpo das funções por `supabase.from(...)`
- Hook `useData()` exposto

Simulação de status online: a cada ~5s, um job atualiza `ultima_sincronizacao` dos dispositivos online; toggle aleatório controlado para feedback visual realista.

---

## Seed Inicial

3 clientes:

- Supermercado Bom Preço
- Academia Fit Center
- Clínica Vida Saudável

5 dispositivos distribuídos (ex: 2 no supermercado, 2 na academia, 1 na clínica), mix de online/offline.

2 playlists:

- "Promoções da Semana" (3 imagens + 1 vídeo)
- "Institucional Geral" (2 vídeos + 2 imagens)

Mídias com URLs placeholder (picsum/sample videos) para thumbnails.

---

## Design System (dark mode premium)

`src/styles.css` — tokens oklch:

- `--background`: chumbo profundo (~oklch(0.16 0.01 260))
- `--card`: chumbo elevado
- `--foreground`: branco quente
- `--primary`: azul elétrico (~oklch(0.68 0.22 250))
- `--accent-success`: verde neon (~oklch(0.78 0.22 145)) — usado para status online com `animate-pulse`
- `--destructive`: vermelho para offline
- `--border`: cinza translúcido
- Shadows e gradientes sutis em cards

Tipografia: Inter (via `<link>` em `__root.tsx`).

Componentes shadcn usados: Card, Button, Badge, Dialog, Input, Select, Table, Sidebar, Sonner (toasts), Progress, Tabs, DropdownMenu, Input-OTP, Tooltip.

---

## Componentes Reutilizáveis

```
src/components/
  layout/AppSidebar.tsx
  layout/PageHeader.tsx
  dashboard/MetricCard.tsx
  dispositivos/DispositivoCard.tsx
  dispositivos/VincularTerminalDialog.tsx
  dispositivos/StatusBadge.tsx
  playlists/PlaylistCard.tsx
  playlists/MidiaListItem.tsx
  playlists/UploadDropzone.tsx
  clientes/ClienteFormDialog.tsx
  common/EmptyState.tsx
```

---

## Entregáveis Técnicos

1. Tokens de design no `src/styles.css` + fonte Inter
2. Sidebar + shell em `__root.tsx`
3. Tipos e store mockada com seed completo
4. Todas as rotas listadas com componentes finos consumindo o store
5. Modais isolados, toasts em ações (vincular TV, salvar playlist, etc.)
6. Empty states ilustrados em todas as listas
7. Animações sutis (pulse no status online, hover lift nos cards)

**Fora do escopo desta entrega** (pode ser adicionado depois): conexão real Supabase, autenticação, upload real para Storage, websocket de status, APK player.

**Criar APK**

Criar o arquivo APK para que seja instalado no celular e também na TV.