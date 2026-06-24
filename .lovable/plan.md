O repositório claudioresende2025/bright-screen-control agora está público. O próximo passo é gerar a primeira release com o APK acessível publicamente.

```text
Fluxo: repo público → trigger workflow → release "latest" → APK público → app funciona
```

## Passos

1. **Confirmar o workflow de build**
   - Verificar `.github/workflows/build-apk.yml`.
   - Garantir que ele cria/actualiza a release `latest` com o asset `signagehub-player.apk`.

2. **Disparar o workflow**
   - Opção A: push de um commit na branch `main`.
   - Opção B: executar manualmente em GitHub Actions → "Build SignageHub Player APK" → Run workflow → Branch `main`.
   - Tempo estimado: ~5 minutos.

3. **Verificar a release**
   - Confirmar que a release `latest` (ex: `v1.0.1`) foi criada em `github.com/claudioresende2025/bright-screen-control/releases`.
   - Confirmar que o asset `signagehub-player.apk` está anexado.

4. **Validar acesso público ao APK**
   - Testar em aba anônima:
     `https://github.com/claudioresende2025/bright-screen-control/releases/latest/download/signagehub-player.apk`
   - Deve iniciar o download sem pedir login.

5. **Validar no app**
   - Verificar QR code na rota `/player`.
   - Verificar botão "Baixar APK" na rota `/dispositivos`.
   - Verificar página `/baixar-apk`.

## Pós-condição

- APK disponível publicamente em URL estável.
- Novos pushes em `main` atualizam automaticamente o mesmo link.
- App pode baixar o APK diretamente na TV sem login.