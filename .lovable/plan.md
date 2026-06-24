## Diagnóstico

Há dois problemas separados:

1. **Upload da playlist**
   - O upload atual salva uma URL assinada muito longa no banco e depende do usuário confirmar um preview antes de enviar.
   - Isso torna o fluxo frágil para TV/WebView e pode deixar a impressão de que “clicar para upload não faz nada”, principalmente em mobile ou quando o preview não abre/metadata do vídeo não carrega.
   - A playlist também pode aparecer como “não encontrada” logo após abrir porque a página lê o estado antes da hidratação inicial terminar.

2. **APK/WebView**
   - A URL `/player` responde no navegador, mas o APK pode falhar por compatibilidade do WebView com recursos modernos do bundle publicado, scripts auxiliares injetados e/ou por carregar HTML/JS moderno em WebViews antigos.
   - Limpar cache sozinho não resolve se o WebView instalado no celular/TV for antigo.

## Plano de correção

### 1. Tornar a tela de playlist resiliente
- Adicionar estado de carregamento no `DataProvider`.
- Na rota `/playlists/$id`, mostrar “Carregando playlist…” enquanto os dados iniciais ainda estão sendo carregados.
- Só mostrar “Playlist não encontrada” depois que a hidratação terminar.

### 2. Corrigir o upload para funcionar de forma direta
- Alterar o upload para:
  - aceitar imagens e vídeos por MIME e extensão;
  - enviar imediatamente após selecionar/arrastar o arquivo, sem depender obrigatoriamente do preview;
  - mostrar erro visível se storage ou banco falharem;
  - suportar múltiplos arquivos em fila;
  - limpar o input para permitir reenviar o mesmo arquivo.
- Salvar no banco o **path do arquivo no storage** e não apenas uma URL assinada expirada/frágil.
- Gerar URL assinada fresca no carregamento/reprodução quando necessário.

### 3. Ajustar reprodução para TV
- Resolver URLs de mídia no `PlaybackEngine` antes de renderizar `<img>`/`<video>`.
- Se uma mídia não carregar na TV, exibir um fallback claro e avançar para a próxima, em vez de ficar parada.

### 4. Corrigir APK para WebView antigo
- Ajustar o APK para usar User-Agent Android/WebView padrão, sem sufixo customizado que pode interferir no host.
- Adicionar configurações de compatibilidade do WebView: database/storage, autoplay, mixed content seguro, zoom desativado, viewport estável.
- Melhorar a tela de erro mostrando URL real, código HTTP quando disponível e botão de tentar novamente.
- Remover cache-busting agressivo se ele quebrar navegação/cache de assets; manter limpeza controlada no primeiro carregamento.
- Subir `versionCode/versionName` para forçar instalação da nova versão.

### 5. Publicação/geração do APK
- Garantir que o workflow gere o APK novo com a URL correta `https://bright-screen-control.lovable.app/player`.
- Após implementar, será necessário **publicar/atualizar o app web** e **baixar/reinstalar o novo APK** no celular/TV.