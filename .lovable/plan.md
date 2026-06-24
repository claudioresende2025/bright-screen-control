# Publicar o APK do repositório privado

## Situação atual

- Repositório conectado: `claudioresende2025/bright-screen-control` (privado).
- Workflow `.github/workflows/build-apk.yml` já existe e compila o APK a cada push em `main`, salvando como artifact.
- Artifacts do GitHub Actions exigem login → **não servem como URL pública para a TV baixar via pen drive/QR code**.
- Releases de um repositório privado também exigem login para baixar os assets.

Precisamos de uma URL pública e estável. Proponho duas opções — escolha uma:

## Opção A (recomendada): publicar o APK no Lovable Cloud via workflow

O próprio GitHub Actions, ao terminar o build, faz upload do `signagehub-player.apk` para o bucket `apks` do Lovable Cloud. A rota `/api/public/apk` (já existente) gera um signed URL e redireciona — funciona em QR code, navegador da TV e botão "Baixar APK" do painel.

Mudanças:
1. Ajustar `.github/workflows/build-apk.yml` para, após `assembleDebug`, fazer `curl` autenticado para a Storage API do Lovable Cloud, sobrescrevendo `apks/signagehub-player.apk`.
2. Criar dois GitHub Secrets no repositório (passo manual do usuário, eu explico como):
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` *(não disponível no Lovable Cloud — então esta opção exige Opção B como fallback)*

> ⚠️ Como o Lovable Cloud não expõe a service role key, **a Opção A pura não é viável** sem essa chave. Mantenho registrada só para transparência.

## Opção B (recomendada na prática): GitHub Release público + repositório privado

GitHub permite criar uma **Release pública** mesmo em repo privado? **Não** — assets de release seguem a visibilidade do repo. Então as alternativas reais são:

### B1. Tornar o repositório público
- Vantagem: URL estável e gratuita: `https://github.com/claudioresende2025/bright-screen-control/releases/latest/download/signagehub-player.apk`.
- Ajustar workflow para criar/atualizar uma Release `latest` com o APK (action `softprops/action-gh-release`).
- Colar essa URL no campo "URL pública do APK" em `/configuracoes` — pronto.

### B2. Manter privado e fazer upload manual no painel
- Baixar o APK do artifact do Actions (logado no GitHub).
- Subir pelo card "Enviar APK pelo painel" em `/configuracoes` (já implementado, usa bucket `apks` do Lovable Cloud).
- A URL pública passa a ser `/api/public/apk` automaticamente.

## Recomendação

**B1** se você não se importa em tornar o repo público (mais simples, automático).
**B2** se quer manter o código privado (precisa repetir o upload manual a cada nova versão do APK).

## O que eu farei após sua escolha

- **Se B1**: adiciono ao workflow um step `softprops/action-gh-release@v2` com `tag_name: latest`, `files: app/build/outputs/apk/debug/*.apk`, e preencho `apkDownloadUrl` padrão no painel com a URL do release.
- **Se B2**: nada a alterar no código — só te oriento a baixar o artifact e subir em `/configuracoes`.

Qual opção seguimos?
