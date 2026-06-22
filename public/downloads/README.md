# APK do SignageHub Player

Gere o APK a partir de `/android-player/` (Android Studio → Build → Build APK) e copie o arquivo final para:

```
public/downloads/signagehub-player.apk
```

Esse caminho é servido estaticamente. O QR "Baixar APK na TV" exibido na tela de pareamento aponta para `https://<seu-dominio>/downloads/signagehub-player.apk`.

Enquanto o arquivo real não estiver presente, o QR continuará funcional, mas o download retornará 404.