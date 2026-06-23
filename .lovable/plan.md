# Plano: Geração e hospedagem do APK do Player

## Realidade técnica (importante)

Lovable é um ambiente de **web app** (React + TanStack Start rodando em Cloudflare Workers). Não existe Android SDK, Gradle ou JDK aqui — então **eu não consigo compilar um arquivo `.apk` dentro deste sandbox**. Qualquer plano que prometa "clica e gera o APK" no chat seria mentira.

O que dá pra fazer de forma profissional e automática:

1. **Transformar o `/player` em um app Android nativo** usando Capacitor (wrapper oficial do Ionic). O APK abre direto na rota `/player` em fullscreen, sem barra de navegador, com permissão de tela cheia e wake-lock.
2. **Compilar o APK automaticamente** via **GitHub Actions** (gratuito, roda no GitHub a cada push em `main`). O workflow publica o `.apk` em **GitHub Releases** com URL pública estável.
3. **Permitir upload manual do APK pelo painel** (Lovable Cloud Storage), pra quando você quiser subir uma versão sem esperar o build — o link público é preenchido automaticamente em Configurações.

Com isso, o botão "Baixar APK" e o QR Code em `/dispositivos` passam a funcionar de ponta a ponta.

---

## O que será feito

### 1. Capacitor — projeto Android nativo

- `bun add @capacitor/core @capacitor/android @capacitor/cli @capacitor/status-bar @capacitor/splash-screen`
- Criar `capacitor.config.ts` apontando `server.url` para a URL publicada do Lovable + path `/player` (modo "live URL", sem precisar fazer `cap copy` a cada deploy do front).
- Criar a pasta `android/` (projeto Gradle mínimo: `AndroidManifest.xml`, `build.gradle`, `MainActivity.kt`, ícones, `strings.xml`). App em fullscreen/landscape, `WAKE_LOCK`, `INTERNET`, orientação livre, `targetSdk 34`.
- Ícone do app + splash gerados a partir de um SVG simples (logo SignageHub).

### 2. GitHub Actions — build automático do APK

- `.github/workflows/build-apk.yml`:
  - Triggers: `push` em `main` + `workflow_dispatch` (botão manual).
  - Steps: checkout → setup JDK 17 → setup Android SDK → `bun install` → `bunx cap sync android` → `./gradlew assembleRelease` (assinado com keystore de debug pra simplificar — instalação por pendrive funciona sem Play Store).
  - Publica o `.apk` como artifact **e** como asset em **GitHub Releases** com tag `v${{ github.run_number }}`, gerando URL pública estável tipo `https://github.com/USER/REPO/releases/latest/download/signagehub-player.apk`.
- README curto em `.github/workflows/README.md` explicando: depois de conectar o GitHub na Lovable (botão GitHub no chat), o workflow roda sozinho; o link `releases/latest/download/...` é o que vai em Configurações.

### 3. Lovable Cloud — upload do APK pelo painel

- Habilitar **Lovable Cloud** (Supabase gerenciado).
- Criar bucket público `apks` via tool (`supabase--storage_create_bucket`, `public: true`).
- Migration: política RLS em `storage.objects` permitindo `INSERT/UPDATE/DELETE` apenas para usuários `authenticated` no bucket `apks`; `SELECT` público.
- Editar `src/routes/configuracoes.tsx`:
  - Adicionar card **"Enviar APK"** com `<input type="file" accept=".apk">`.
  - Função `uploadApk`: faz `supabase.storage.from('apks').upload('signagehub-player.apk', file, { upsert: true })`, pega `getPublicUrl`, salva em `apkDownloadUrl` (store atual) e em `localStorage` (já existente).
  - Mostra tamanho, data de envio e botão "Remover APK".
  - Mantém o campo "URL pública do APK" para quem prefere usar GitHub Releases / Drive / S3.

### 4. Ajustes finos

- `src/routes/baixar-apk.tsx`: continua redirecionando para `apkDownloadUrl`. Adicionar header `Content-Disposition: attachment` não é possível (CDN externo), mas o navegador Android trata `.apk` como download automaticamente.
- `src/routes/dispositivos.tsx`: já tem o botão "Baixar APK" — apenas confirmar que abre a URL nova.
- Mensagem de "APK ainda não publicado" passa a sugerir **dois caminhos**: aguardar build do GitHub Actions ou subir manualmente em Configurações.

---

## Como vai funcionar pra você no dia-a-dia

1. **Primeira vez:** conectar o projeto ao GitHub (botão GitHub no chat da Lovable) → o Actions roda automaticamente → em ~5 min o APK aparece em Releases → o link já está pré-configurado.
2. **Instalar na TV:** painel → Dispositivos → "Baixar APK" → transferir pra pendrive → instalar na TV → app abre e mostra código de 6 dígitos (gerado por install, já funciona).
3. **Vincular TV:** painel → Dispositivos → digitar o código de 6 dígitos da TV.
4. **Atualizar o app:** alterar código → push pra main → GitHub Actions gera novo APK → mesmo link `releases/latest/download/...` serve a versão nova.

---

## Fora de escopo

- Atualização automática over-the-air do APK na TV (precisaria de mecanismo de update no app nativo — pode ser fase 2).
- Assinatura com keystore de produção (vai usar debug keystore — funciona pra sideload por pendrive, **não funciona pra Play Store**).
- Build de APK iOS / outras arquiteturas.

---

## Confirmação necessária

Vou precisar **habilitar Lovable Cloud** (cria projeto Supabase gerenciado, sem custo até os limites do plano free) para o upload pelo painel. Confirma que posso prosseguir com tudo acima?
