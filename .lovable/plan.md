Plano de correção definitiva:

1. **Confirmar comportamento atual**
   - A rota pública `/player` está respondendo normalmente.
   - A URL atual de download do APK também responde e redireciona para o APK mais recente:
     `https://github.com/claudioresende2025/bright-screen-control/releases/latest/download/signagehub-player.apk`
   - Portanto, o erro persistente provavelmente está dentro do APK/WebView instalado ou em cache/compatibilidade do Android, não na URL pública do site.

2. **Habilitar uso no celular para teste**
   - O player já é uma página web; ele pode funcionar no navegador do celular acessando:
     `https://bright-screen-control.lovable.app/player`
   - Vou ajustar a tela `/player` para ficar correta em celular também, com layout responsivo, código de pareamento legível e instruções compatíveis com teste mobile.
   - Isso não altera o funcionamento em TVs.

3. **Melhorar diagnóstico dentro do APK**
   - Ajustar a tela de erro do app Android para mostrar mais detalhes úteis: URL carregada, código do erro, botão/tentativa de recarregar e orientação para abrir a URL no navegador do celular.
   - Ativar configurações de WebView mais tolerantes para Android TV/TV Box antigos, sem trocar a URL do player.

4. **Manter a URL de download**
   - Não vou alterar a URL de download do APK, pois ela já está ativa:
     `https://github.com/claudioresende2025/bright-screen-control/releases/latest/download/signagehub-player.apk`

5. **Após implementar**
   - Validar `/player` no viewport de celular e desktop.
   - Informar que, para a correção do APK entrar no app instalado, será necessário gerar/baixar a nova versão do APK e reinstalar na TV/celular de teste.