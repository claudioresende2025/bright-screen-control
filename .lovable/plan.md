## Diagnóstico

A página 404 indica que o arquivo `signagehub-player.apk` não existe na release `v1.0.1` do repositório. Isso acontece porque o workflow do GitHub Actions ainda não rodou com sucesso — sem build, não há APK publicado.

O repositório já está público (ótimo!), mas falta a etapa de **gerar o APK**.

## O que precisa ser feito (passos manuais no GitHub)

Eu não consigo disparar o GitHub Actions a partir do Lovable. Você precisa executar manualmente:

### 1. Abrir a página do workflow
```
https://github.com/claudioresende2025/bright-screen-control/actions/workflows/build-apk.yml
```

### 2. Disparar o build manualmente
- Clique no botão **"Run workflow"** (lado direito)
- Branch: `main`
- Clique em **"Run workflow"** (verde)
- Aguarde ~5 minutos

### 3. Verificar o resultado
- Se ficar **verde** ✅ → vá para a aba **Releases**: `https://github.com/claudioresende2025/bright-screen-control/releases`
- Confirme que existe a release `v1.0.1` com o arquivo `signagehub-player.apk` anexado
- Se ficar **vermelho** ❌ → me envie o log do erro (clique no job que falhou e copie a mensagem) que eu corrijo o workflow

### 4. Testar a URL final
Depois do build verde, abra em aba anônima:
```
https://github.com/claudioresende2025/bright-screen-control/releases/latest/download/signagehub-player.apk
```
Tem que baixar direto, sem pedir login.

## Possíveis causas se o build falhar

- Faltam permissões `contents: write` no workflow (necessárias para criar release)
- Token do GitHub Actions sem permissão de escrita (Settings → Actions → General → Workflow permissions → marcar **"Read and write permissions"**)
- Erro de compilação do Android (vou analisar o log se acontecer)

## Próxima ação

Rode o workflow manualmente conforme passo 2 e me avise:
- ✅ "Build verde" → eu valido o QR code e o botão "Baixar APK" no app
- ❌ "Build falhou" + log do erro → eu corrijo o workflow
