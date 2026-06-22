## Problema

1. O código **já é gerado com 6 dígitos** no fonte (`player.tsx`, `data-store.tsx`, `VincularTerminalDialog.tsx`). Mas a tela de pareamento (`PairingScreen.tsx`) usa caixas de dígito de largura fixa grande (`w-20` / `w-28`) que **estouram a largura no preview mobile (375px)** — visualmente só aparecem ~4 dígitos, dando a impressão de código curto.
2. O QR Code atualmente aponta apenas para a URL do painel admin. Precisa virar **dois QRs alternados**: um para baixar o APK do player, outro para abrir o painel.

## Mudanças

### 1. `src/components/player/PairingScreen.tsx` — responsivo + 2 QRs

- **Caixas de dígito responsivas:** trocar `h-24 w-20 md:h-32 md:w-28` por escala fluida (`h-14 w-11 sm:h-20 sm:w-16 md:h-32 md:w-28`) com fonte proporcional (`text-3xl sm:text-5xl md:text-7xl`) e gap menor no mobile. Garante que os 6 dígitos caibam em 375px.
- **Layout do container:** trocar `md:grid-cols-[1fr_auto]` por flex-col no mobile para QR ficar abaixo, e reduzir paddings (`px-4 sm:px-8`).
- **Dois QRs com alternância automática a cada 6s:**
  - QR A — rótulo "Baixar APK na TV" → aponta para `${painelUrl}/download/signagehub-player.apk` (URL pública estática).
  - QR B — rótulo "Abrir painel admin" → aponta para `painelUrl` (comportamento atual).
  - Indicador de dots (●○ / ○●) abaixo do card mostrando qual QR está ativo.
  - Implementado com `useState` + `setInterval` (cleanup no unmount).

### 2. `src/routes/player.tsx` — passar URL do APK

- Calcular `apkUrl` a partir de `window.location.origin` (ex.: `${origin}/downloads/signagehub-player.apk`) e passar como prop `apkUrl` para `PairingScreen`.

### 3. `public/downloads/signagehub-player.apk` (placeholder)

- Não é possível compilar APK no Lovable. Criar um README em `public/downloads/README.md` explicando que o arquivo `.apk` deve ser gerado a partir de `/android-player/` (Android Studio → Build → APK) e copiado manualmente para `public/downloads/signagehub-player.apk`. Enquanto o arquivo real não existe, o QR ainda funciona — apenas dá 404 ao baixar, que é o comportamento esperado até o usuário fazer o build.

### Arquivos tocados

- editar `src/components/player/PairingScreen.tsx`
- editar `src/routes/player.tsx`
- criar `public/downloads/README.md`

### Fora de escopo

- Hospedar/gerar o `.apk` automaticamente (requer Android SDK, fora do runtime).
- Mudar lógica de geração de código (já está correta com 6 dígitos).
