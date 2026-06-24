## Plano de correção

### 1. Corrigir navegação da página Playlists

- Ajustar o card da playlist para usar navegação programática e evitar que componentes internos/camadas de UI impeçam o clique.
- Após criar uma nova playlist, redirecionar automaticamente para a tela de edição da playlist criada.
- Adicionar tratamento de erro visível no botão de criação, em vez de fechar o modal mesmo se a criação falhar.

### 2. Corrigir upload de vídeos/imagens

- Revisar o fluxo `UploadDropzone -> Storage -> midias` para expor erro real quando o upload falhar.
- Aceitar formatos comuns de imagem/vídeo de forma mais robusta (`jpg`, `jpeg`, `png`, `webp`, `gif`, `mp4`, `webm`, `mov`).
- Permitir seleção múltipla de arquivos de verdade: processar fila de arquivos, não só o primeiro arquivo selecionado.
- Limpar o input após seleção para permitir reenviar o mesmo arquivo.
- Validar se o bucket/registro falhou e manter a playlist aberta para nova tentativa.

### 3. Corrigir o APK/WebView

- O erro do anexo é a página do host dizendo que os arquivos publicados estão ausentes; no navegador a rota atual responde 200, então o APK pode estar carregando um build antigo/cacheado ou uma resposta hospedada anterior.
- Atualizar o APK para forçar carregamento limpo do `/player`: limpar cache/cookies do WebView na inicialização, usar `LOAD_NO_CACHE`, desabilitar cache de DOM onde aplicável e recarregar a URL pública correta.
- Melhorar o tratamento de erros para mostrar a URL realmente carregada, código HTTP quando houver e um botão/toque para tentar novamente.
- Incrementar `versionCode/versionName` para garantir que o celular/TV instale a nova versão por cima.

### 4. Validação

- Testar via browser local a criação de playlist, clique no card e abertura da tela de upload.
- Validar que a URL publicada do player responde corretamente.
- Verificar que a configuração do Android aponta para `https://bright-screen-control.lovable.app/player` e que o novo APK não reutiliza cache antigo.

### Observação importante

Depois da correção do código, será necessário gerar/publicar um novo APK e reinstalar no celular/TV. O APK já instalado não muda automaticamente.

&nbsp;

Me enviar a URL atualizada para o novo download do APK.