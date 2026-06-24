# Plano: Repositório público + APK via GitHub Releases

## Objetivo
Tornar o APK do SignageHub Player acessível por uma URL pública fixa para que o QR code e os botões "Baixar APK" na aplicação funcionem sem login.

## Contexto
- O repositório `claudioresende2025/bright-screen-control` está atualmente **privado** no GitHub.
- A aplicação já aponta para a URL de release pública:
  `https://github.com/claudioresende2025/bright-screen-control/releases/latest/download/signagehub-player.apk`
- O workflow `.github/workflows/build-apk.yml` já está configurado para criar/atualizar uma release `latest` com o arquivo `signagehub-player.apk` a cada push na `main`.
- Enquanto o repo for privado, essa URL exige autenticação e não funciona no painel/TV.

## Passos

### 1. Alterar visibilidade do repositório no GitHub
- Acessar `github.com/claudioresende2025/bright-screen-control`
- Ir em **Settings → General → Danger Zone → Change repository visibility**
- Selecionar **Make public** e confirmar.

### 2. Verificar o workflow de build
- Confirmar que `.github/workflows/build-apk.yml`:
  - Compila o APK na branch `main`.
  - Usa `softprops/action-gh-release@v2` (ou similar) para criar a release `latest`.
  - Anexa o arquivo com nome exato `signagehub-player.apk`.
- Se necessário, ajustar o workflow para garantir que o nome do asset continue sendo `signagehub-player.apk` e a tag/tagname seja `latest`.

### 3. Disparar o primeiro build público
- Fazer push para `main` (ou rodar o workflow manualmente em GitHub Actions → "Build SignageHub Player APK" → Run workflow).
- Aguardar a conclusão (~5 min).
- Verificar em **Releases** que aparece `latest` com o asset `signagehub-player.apk`.

### 4. Validar a URL na aplicação
- Abrir a URL `https://github.com/claudioresende2025/bright-screen-control/releases/latest/download/signagehub-player.apk` em aba anônima para confirmar que faz download sem autenticação.
- Testar o QR code na rota `/player` e o botão "Baixar APK" em `/dispositivos`.

## Pós-condição
- Repositório público.
- URL do APK acessível sem login.
- Novos pushes na `main` atualizam automaticamente o APK na mesma URL.
