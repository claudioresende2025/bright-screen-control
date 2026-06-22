## Diagnóstico

O 404 acontece porque `public/downloads/signagehub-player.apk` não existe — Lovable não compila APK Android (precisa do Android SDK / Gradle). O QR aponta para um caminho vazio.

Para o QR "já funcionar" ao ser escaneado, precisamos que ele encode uma **URL pública real do APK** (GitHub Releases, Google Drive com link direto, S3, Dropbox `?dl=1`, etc.). Como o binário precisa ser hospedado fora do Lovable, a solução é deixar essa URL **configurável pelo admin** e cair em uma página de fallback caso ainda não esteja configurada.

## Mudanças

### 1. Persistir URL do APK no `data-store`

- Adicionar `apkDownloadUrl: string` ao estado global (`src/store/data-store.tsx`), com setter `setApkDownloadUrl(url)`.
- Persistir em `localStorage` (`signagehub_apk_url`) para sobreviver a reloads.
- Valor inicial: `""` (vazio → usa fallback).

### 2. Nova rota `/configuracoes` (Configurações)

- Criar `src/routes/configuracoes.tsx` com um card "Player Android (APK)":
  - Input "URL pública do APK" + botão Salvar.
  - Texto de ajuda explicando formatos aceitos (GitHub Releases `…/releases/download/...apk`, Drive `uc?export=download&id=...`, Dropbox `?dl=1`, S3 público).
  - Preview do QR code gerado a partir da URL.
  - Botão "Testar download" (abre em nova aba).
- Adicionar item "Configurações" na `AppSidebar`.

### 3. Nova rota pública `/baixar-apk` (fallback / landing)

- Criar `src/routes/baixar-apk.tsx` — página leve, sem layout admin:
  - Se `apkDownloadUrl` estiver configurada → **redireciona imediatamente** via `<meta http-equiv="refresh" content="0; url=…">` + `window.location.replace()` no `useEffect` (auto-download).
  - Se vazia → mostra mensagem "APK ainda não publicado. Peça ao administrador para configurar a URL do APK em Configurações." com instruções de instalação manual no Android TV.
- Essa rota é a que o QR sempre aponta. Vantagem: a URL impressa no QR é estável (`{origin}/baixar-apk`) mesmo quando o admin troca o link do APK depois.

### 4. Atualizar QR na `PairingScreen`

- Em `src/routes/player.tsx`, trocar `apkUrl` para `${origin}/baixar-apk` (em vez de apontar direto para `/downloads/...apk`).
- Manter a alternância dos 2 QRs (download / painel) que já existe.

### 5. Remover placeholder quebrado

- Excluir `public/downloads/README.md` (não usado mais).

### Arquivos tocados

- editar `src/store/data-store.tsx` (adicionar `apkDownloadUrl` + setter + persistência)
- criar `src/routes/configuracoes.tsx`
- criar `src/routes/baixar-apk.tsx`
- editar `src/components/layout/AppSidebar.tsx` (item de menu)
- editar `src/routes/player.tsx` (apontar QR para `/baixar-apk`)
- remover `public/downloads/README.md`

### Fora de escopo

- Compilar o APK automaticamente (impossível sem Android SDK no runtime).
- Upload do binário dentro do app (exigiria Lovable Cloud Storage — pode ser próximo passo se você quiser).
