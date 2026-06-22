# SignageHub TV Player — APK Android

Player nativo Android para Smart TVs, Android TV, Fire TV e TV Boxes. É um WebView
fullscreen que carrega o **Player Web** do SignageHub publicado (`/player`). Toda a
lógica de pareamento, troca de playlist e reprodução vive no player web — o APK só
entrega tela cheia, autoplay de mídia, "tela sempre ligada" e auto-start no boot.

## Pré-requisitos

- Android Studio (Hedgehog ou superior)
- JDK 17
- Android SDK Platform 34
- Dispositivo de TV com Android 7+ (API 24)

## Configurar a URL do player

Edite `app/src/main/res/values/strings.xml` e troque o valor de `player_url`
pela URL publicada do seu painel SignageHub, por exemplo:

```xml
<string name="player_url">https://meu-projeto.lovable.app/player</string>
```

## Compilar o APK

```bash
cd android-player
./gradlew assembleRelease
```

O APK assinado em modo debug fica em
`app/build/outputs/apk/release/app-release-unsigned.apk`.

Para assinar para distribuir nas TVs (recomendado):

1. Em Android Studio: **Build → Generate Signed Bundle / APK**
2. Selecione **APK**, crie ou escolha um keystore
3. Selecione variant **release**

## Instalar na TV

- **Android TV / Fire TV**: habilite "Fontes desconhecidas" e use `adb install` ou
  um app de file manager.
- **TV Box**: envie o APK por USB / rede e instale com o gerenciador de arquivos.

```bash
adb connect <ip-da-tv>:5555
adb install -r app-release.apk
```

## Comportamento

- Inicia automaticamente no boot da TV (BOOT_COMPLETED).
- WebView fullscreen, sem barra de status / navegação.
- Mantém a tela ligada (`FLAG_KEEP_SCREEN_ON`).
- Autoplay de vídeo habilitado (`mediaPlaybackRequiresUserGesture = false`).
- Suporta DPAD do controle remoto (Leanback launcher).
- O `localStorage` do WebView guarda o código de pareamento — basta abrir o app
  na TV uma vez para o código aparecer.

## Resetar pareamento

No player web, clique duplo no canto superior direito para limpar o
`localStorage` e gerar um novo código.