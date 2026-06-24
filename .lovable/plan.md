# APK universal 32/64 bits

## Contexto

O `signagehub-player` é um app WebView puro (sem código nativo / sem `.so`), então em tese já roda em qualquer arquitetura. Porém o `build.gradle.kts` atual não declara explicitamente as ABIs suportadas e o workflow gera apenas `app-debug.apk` sem garantir que seja "universal". Algumas TV Boxes (especialmente as antigas com Android 7–9 em `armeabi-v7a` / `x86`) rejeitam ou exibem "app não instalado" quando o instalador não reconhece a ABI declarada.

A solução é declarar explicitamente as 4 ABIs (`armeabi-v7a`, `arm64-v8a`, `x86`, `x86_64`) e manter **um único APK universal** publicado com o mesmo nome de arquivo — assim a URL pública não muda:

```
https://github.com/claudioresende2025/bright-screen-control/releases/latest/download/signagehub-player.apk
```

## Alterações

### 1. `android-player/app/build.gradle.kts`
- Em `defaultConfig`, adicionar:
  ```kotlin
  ndk {
      abiFilters += listOf("armeabi-v7a", "arm64-v8a", "x86", "x86_64")
  }
  ```
- Em `android { ... }`, adicionar bloco `splits` desabilitando splits por ABI (garante APK único universal):
  ```kotlin
  splits {
      abi {
          isEnable = false
      }
  }
  ```
- Bump `versionCode` para `3` e `versionName` para `"1.0.2"` para que TVs já pareadas atualizem.

### 2. `.github/workflows/build-apk.yml`
- Sem mudança no nome do artefato (`signagehub-player.apk`) nem na URL.
- Adicionar passo após o build que valida via `unzip -l` que o APK contém entradas para as 4 ABIs *ou* nenhum diretório `lib/` (caso esperado, já que não há código nativo) — apenas log informativo, não falha o build.
- Manter `make_latest: "true"` para que o link `/releases/latest/download/signagehub-player.apk` continue apontando para esta build.

## Resultado esperado

- Mesma URL pública de download.
- Um único APK universal que instala em TV Boxes 32-bit (armv7) e 64-bit (arm64), além de emuladores x86/x86_64 para teste.
- Próxima instalação no celular/TV substitui a versão atual via `versionCode` 3.

## Fora de escopo

- Assinatura release (continua debug-signed, como hoje).
- Mudanças no player web ou no fluxo de pareamento.
