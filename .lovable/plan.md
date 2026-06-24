## Diagnóstico

A tela preta com "This project is published, but its files are missing" **não é um erro do APK**. O APK está funcionando corretamente — ele apenas abre a WebView em:

`https://bright-screen-control.lovable.app/player`

Essa mensagem vem do servidor de hospedagem da Lovable e significa que a **versão publicada do site está sem os arquivos** (deploy quebrado/expirado). Ou seja, o problema está no site publicado, não no APK nem na URL.

## Causa

Foram feitas várias alterações no projeto (migrations, novos componentes, build do APK) depois da última publicação. O deploy publicado ficou "órfão" — a rota `/player` existe no código atual, mas os arquivos servidos em `bright-screen-control.lovable.app` estão desatualizados/ausentes.

## Correção definitiva

1. **Republicar o projeto Lovable** usando a ferramenta de publish, para que `https://bright-screen-control.lovable.app/player` volte a servir os arquivos corretos da build atual.
2. **NÃO alterar a URL do APK** — continua sendo `https://bright-screen-control.lovable.app/player`, então o APK já instalado nas TVs não precisa ser reinstalado.
3. **Não alterar a URL de download do APK** — permanece `https://github.com/claudioresende2025/bright-screen-control/releases/latest/download/signagehub-player.apk`.
4. Após o republish, validar abrindo `/player` no navegador. Se aparecer a tela de pareamento com código, o APK já voltará a funcionar normalmente em todas as TVs (basta reabrir o app).

## Fora do escopo

- Nenhuma mudança de código, schema, build do APK ou URLs.
- Apenas ação de publicação.

Se aprovado, executo o republish no modo build.