# Reorganização do fluxo do APK

## Entendimento do fluxo correto

1. **Admin** baixa o APK pelo painel de gerenciamento (Lovable web).
2. Copia o `.apk` para um pen drive e instala na TV.
3. Ao abrir o app na TV (rota `/player`), é gerado automaticamente um **código aleatório de 6 dígitos** (único por instalação — se desinstalar e reinstalar, sai um novo código). *Já funciona hoje via `localStorage`.*
4. No painel, em **Dispositivos**, o admin clica "Vincular Novo Terminal", digita o código de 6 dígitos e o terminal fica ligado àquela TV.

A tela `/player` é o que roda **na TV**, então não faz sentido oferecer "Baixar APK" lá. O download é uma ação do **admin**, no painel.

## Mudanças

### 1. `src/routes/player.tsx` + `src/components/player/PairingScreen.tsx`
Remover o QR/alternância "Baixar APK na TV". A tela de pareamento passa a focar no que importa para o operador na frente da TV:
- Código de 6 dígitos em destaque (mantido).
- **Um único QR**, apontando para `/dispositivos` (painel), para o admin abrir pelo celular se quiser.
- Remove o estado `qrIndex`, o array `qrs`, a alternância de 6s e os bullets — fica só um QR estático e limpo.
- Em `player.tsx`, remove a variável `apkUrl` e o prop `apkUrl`.

### 2. `src/routes/dispositivos.tsx` — botão "Baixar APK" no header
Adicionar no `PageHeader.action`, ao lado de "Vincular Novo Terminal":
- Botão **"Baixar APK"** (ícone `Download`, variante `outline`).
- Comportamento:
  - Se `apkDownloadUrl` (do `data-store`) estiver configurado → `window.open(apkDownloadUrl, "_blank")` para iniciar o download direto.
  - Se estiver vazio → abre um `Dialog` curto explicando "Configure a URL pública do APK em Configurações" com um `Link` para `/configuracoes`.
- Também adicionar um pequeno botão secundário "Copiar link do APK" quando configurado (útil para mandar por WhatsApp ao técnico que vai instalar).

### 3. `src/routes/configuracoes.tsx`
Mantém-se como já está (campo de URL pública do APK, preview do QR, botão testar). Pequeno ajuste de copy no topo da seção:
> "Cole aqui o link público do arquivo `.apk` (GitHub Releases, Google Drive `uc?export=download&id=…`, Dropbox `?dl=1`, S3, R2). Esse link é usado pelo botão **Baixar APK** na página de Dispositivos."

### 4. `src/routes/baixar-apk.tsx`
Mantém-se como página de fallback / redirect automático — útil caso alguém compartilhe a URL pública `/baixar-apk` em vez do link direto. Sem alterações.

### 5. `src/components/player/PairingScreen.tsx` — remover import não usado
Após remover a alternância, tirar imports `Download` e `useEffect`/`useState` se não forem mais usados.

## Fora de escopo
- Compilar o `.apk` automaticamente (precisa de Android SDK, não roda no Lovable).
- Hospedar o binário dentro do projeto (precisaria de Lovable Cloud Storage; o usuário hospeda externamente e cola a URL em Configurações).

## Resultado esperado
- TV mostra: código de 6 dígitos grande + 1 QR para o painel. Sem confusão de "baixar APK" na tela da TV.
- Admin tem botão claro **"Baixar APK"** no topo da página Dispositivos — um clique e o download começa.
- Cada nova instalação do APK gera um código novo (comportamento atual preservado).
