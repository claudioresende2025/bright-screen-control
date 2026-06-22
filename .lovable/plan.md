# Player de TV + Pré-visualização de Mídia

## 1. Player Web (rota `/player`)

Nova rota pública `src/routes/player.tsx` fora do layout administrativo (sem sidebar, fullscreen preto). Funciona em qualquer Smart TV, Fire TV, Chromecast com navegador ou mini PC.

**Comportamento:**
- Ao abrir pela primeira vez (sem vínculo salvo): gera código de 6 dígitos, salva em `localStorage` (`player_codigo`, `player_device_id`) e exibe tela cheia preta com:
  - Logo/nome do sistema
  - Código grande, monoespaçado, com brilho neon
  - Texto "Acesse o painel e vincule este código"
  - QR Code opcional (lib `qrcode.react`) apontando para a tela de vínculo
  - Indicador de status "Aguardando vínculo..." pulsante
- Polling a cada 5s no `data-store` procurando dispositivo com `codigo_vinculo` correspondente e `vinculado=true`.
- Quando vinculado: troca para o **modo Playback** — carrega a playlist do dispositivo e reproduz em loop:
  - `<video autoplay muted loop={false} onEnded={next}>` para vídeo
  - `<img>` com `setTimeout(next, duracao_segundos * 1000)` para imagem
  - Transição fade entre mídias
  - Re-poll a cada 30s para detectar troca de playlist pelo admin → recarrega lista sem reiniciar a mídia atual
- Atualiza `ultima_sincronizacao` no store a cada heartbeat (a cada 30s).
- Botão oculto canto superior direito (aparece no hover/tap longo) para desvincular/resetar.

**Integração com gestor:** o `VincularTerminalDialog` existente passa a procurar pelo código que o player web gerou (em vez de o admin criar o código). Mantém o mesmo fluxo visual de input OTP.

## 2. APK Android (projeto separado)

Pasta nova `/android-player/` na raiz do projeto, contendo um projeto **Android Studio Kotlin** mínimo com WebView fullscreen apontando para a URL do Player Web publicado.

**Estrutura:**
```text
android-player/
  README.md                  -- instruções de build (Android Studio, gradle, gerar APK assinado, instalar em TV Box)
  build.gradle.kts
  settings.gradle.kts
  gradle.properties
  app/
    build.gradle.kts
    src/main/
      AndroidManifest.xml    -- LEANBACK_LAUNCHER, fullscreen, KEEP_SCREEN_ON, INTERNET
      java/com/midiaindoor/player/
        MainActivity.kt      -- WebView fullscreen, JS+DOM storage, hardware accel, autoplay
        BootReceiver.kt      -- inicia app no boot da TV
      res/
        values/strings.xml   -- PLAYER_URL configurável
        drawable/            -- ícone do app
        layout/activity_main.xml
```

**Características do APK:**
- Imersivo (esconde status/nav bar), tela sempre ligada
- Suporta Android TV (DPAD/Leanback) e tablets/TV Box comuns
- WebView com `mediaPlaybackRequiresUserGesture=false` para autoplay
- Auto-start no boot
- URL do player configurável em `strings.xml` (default: URL publicada do projeto Lovable)

**Não é compilado pelo Lovable** — o usuário abre no Android Studio e gera o APK. README com passo a passo.

## 3. Pré-visualização de Mídia

### 3a. Preview no upload (`UploadDropzone`)
Antes de confirmar o "Adicionar à playlist":
- Após selecionar/arrastar arquivo, cria `URL.createObjectURL(file)` e mostra:
  - Vídeos: player com controles (play/pause/seek), exibe duração detectada e dimensões
  - Imagens: thumbnail grande + slider de duração (3-60s, default 8s)
- Mostra metadados: nome, tamanho (MB), tipo, resolução
- Botões "Cancelar" e "Adicionar à playlist"
- Revoga objectURL ao desmontar/cancelar

### 3b. Preview da Playlist completa
Nova rota `src/routes/playlists.$id.preview.tsx`:
- Renderiza o **mesmo componente de Playback** usado pelo `/player`, em modo simulador
- Frame com moldura de TV (16:9, bordas escuras, cantos arredondados) ocupando o centro
- Sidebar lateral mostrando: mídia atual, próxima, progresso da mídia (barra), índice (3/7), botões "Anterior / Pausar / Próximo"
- Botão "Tela cheia" → expande para fullscreen real do navegador
- Acessível via botão "Preview" no `playlists.$id.tsx` (editor)

## 4. Componentes a criar/alterar

**Criar:**
- `src/routes/player.tsx` — rota pública do player
- `src/routes/playlists.$id.preview.tsx` — simulador de playlist
- `src/components/player/PairingScreen.tsx` — tela de código
- `src/components/player/PlaybackEngine.tsx` — motor de reprodução reutilizado
- `src/components/playlists/MediaPreview.tsx` — preview no upload
- `android-player/**` — projeto Android completo

**Alterar:**
- `src/components/playlists/UploadDropzone.tsx` — integra `MediaPreview`
- `src/routes/playlists.$id.tsx` — botão "Preview"
- `src/components/dispositivos/VincularTerminalDialog.tsx` — texto/UX alinhado ao novo fluxo (admin digita o código que apareceu na TV)
- `src/routes/__root.tsx` — permitir que `/player` e `/playlists/$id/preview` renderizem sem sidebar (check de pathname)
- `src/store/data-store.tsx` — função `vincularPorCodigo(codigo, cliente_id, nome)` e `getDispositivoPorCodigo(codigo)` para o player consultar

## 5. Dependências

- `qrcode.react` (QR code na tela de pareamento)

## 6. Correções incidentais

Hidratação SSR quebrando por `formatDistanceToNow(new Date(timestamp))` com datas mock — vou marcar os componentes afetados com guarda de mount (`useEffect` + estado) ou usar `suppressHydrationWarning` no span do tempo relativo.

## Fora de escopo

- Comunicação real-time via WebSocket (mantém polling simulado)
- Upload real para storage (mantém objectURL local até integrarmos Lovable Cloud)
- Assinatura do APK / publicação na Play Store
