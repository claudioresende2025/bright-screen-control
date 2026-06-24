O 404 continua porque a URL testada aponta para `.../releases/download/v1.0.1/signagehub-player.apk`, e essa release já foi criada sem asset. A correção anterior só faz o próximo workflow anexar o APK em uma nova release; ela não preenche a `v1.0.1` existente.

Plano:
1. Ajustar o workflow para falhar explicitamente se o APK não existir antes de publicar a release.
   - Adicionar uma etapa de verificação logo após copiar o APK para `dist/signagehub-player.apk`.
   - Adicionar `fail_on_unmatched_files: true` no `softprops/action-gh-release`.
2. Corrigir o upload de artifact para usar o caminho correto dentro do job com `working-directory: android-player`.
   - O artifact deve apontar para `../dist/signagehub-player.apk`.
   - A release deve continuar usando `dist/signagehub-player.apk`, pois action `uses` roda da raiz do repositório.
3. Atualizar a URL padrão do painel para usar somente o link estável `releases/latest/download/signagehub-player.apk`, não uma versão fixa.
   - Se o navegador tiver salvo localmente a URL antiga `v1.0.1`, o usuário precisará limpar/salvar novamente no painel ou eu posso ajustar o código para trocar automaticamente URLs antigas por `latest`.
4. Depois que esta alteração sincronizar com o GitHub, o push deve disparar o workflow e criar uma nova release com APK anexado. A URL correta para testar será:
   `https://github.com/claudioresende2025/bright-screen-control/releases/latest/download/signagehub-player.apk`

Observação: o link fixo `.../download/v1.0.1/...` continuará 404 enquanto a release `v1.0.1` não receber o asset manualmente. Como você escolheu “Apenas workflow”, o caminho esperado é gerar uma nova release correta, não consertar a release antiga.