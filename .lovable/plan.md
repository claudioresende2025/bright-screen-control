## Diagnóstico

O build rodou verde (3m 40s) e o release `v1.0.1` foi criado — mas está **sem nenhum asset** (`"assets": []` confirmado via API do GitHub). Por isso a URL `releases/latest/download/signagehub-player.apk` retorna 404.

**Causa:** mismatch de diretório de trabalho no `.github/workflows/build-apk.yml`.

- O job define `defaults.run.working-directory: android-player`, então o passo "Rename APK" copia o APK para `../dist/signagehub-player.apk` (= `dist/` na raiz do repo). ✅
- Mas a action `softprops/action-gh-release@v2` **não** herda esse `working-directory` — ela roda a partir da raiz do repo. O caminho `../dist/signagehub-player.apk` resolve para **fora** do repositório, o glob não casa com nada, e o release é publicado vazio sem falhar o job.

O APK foi gerado corretamente (já está disponível como **artifact** da workflow run), só não foi anexado ao Release.

## Correção

Em `.github/workflows/build-apk.yml`, ajustar apenas o passo final:

```yaml
- name: Publish to GitHub Releases
  if: github.ref == 'refs/heads/main'
  uses: softprops/action-gh-release@v2
  with:
    tag_name: v1.0.${{ github.run_number }}
    name: SignageHub Player v1.0.${{ github.run_number }}
    body: |
      APK do player Android para Smart TVs / TV Box.

      **Download direto (link estável):**
      https://github.com/${{ github.repository }}/releases/latest/download/signagehub-player.apk

      Cole esse link em **Configurações → URL pública do APK** no painel SignageHub.
    files: dist/signagehub-player.apk   # ← era ../dist/...
    make_latest: "true"
```

Mudança única: `../dist/signagehub-player.apk` → `dist/signagehub-player.apk`.

## Passos após aprovar

1. Eu aplico a alteração no arquivo do workflow.
2. Como o `on: push` filtra `paths: android-player/** | .github/workflows/build-apk.yml`, o próprio commit dispara a build automaticamente (não precisa "Run workflow" manual desta vez).
3. Aguardar ~5 min. Build verde → novo release `v1.0.2` com o APK anexado.
4. Testar em aba anônima:
   ```
   https://github.com/claudioresende2025/bright-screen-control/releases/latest/download/signagehub-player.apk
   ```
   Deve baixar direto.
5. O campo "URL pública do APK" em `/configuracoes` já está com essa URL por padrão (`DEFAULT_APK_URL` em `src/store/data-store.tsx`), então o botão "Baixar APK" em `/dispositivos` e o QR Code passam a funcionar sem mexer no painel.

## Observação

Não vou tocar no release `v1.0.1` atual (conforme sua escolha). Ele fica vazio mas inofensivo — `releases/latest/download/...` vai apontar para o `v1.0.2` assim que a próxima run terminar com `make_latest: true`.
