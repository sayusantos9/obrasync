# Expo SDK 58 — 03/11/2026

Atualizado `obrasyncsupabase` para corrigir a incompatibilidade entre o projeto SDK 57
e o Expo Go SDK 58 instalado no celular.

- Expo ~58.0.23, React 19.3.0 e React Native 0.88.1.
- Módulos Expo e bibliotecas nativas alinhados por `expo install --fix`.
- Plugins expo-font e expo-status-bar acrescentados automaticamente ao app.json pelo Expo.
- package-lock.json atualizado; configuração anterior guardada em `.expo/sdk57-backup/`.
- Nenhuma alteração em credenciais ou no banco de dados.

Verificações: `expo install --check` sem divergências, `expo-doctor` com 20/20 verificações
aprovadas, oito testes da aplicação e checagem do catálogo aprovados. Bundles iOS e Android
validados com o novo SDK. Ainda é necessário confirmar o funcionamento no aparelho físico.

Pare o servidor anterior com Ctrl+C. No PowerShell:

```powershell
Set-Location -LiteralPath 'C:\Users\pedro\OneDrive\Desktop\Nova pasta\obrasyncsupabase'
npm start
```

Abra o QR Code novo no Expo Go. A pasta `obrasync-main` é outra cópia e não recebeu esta
atualização nem o novo login. O comando `npm start` do projeto já limpa o cache do Metro.

Referências: [procedimento oficial de atualização](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/)
e [mudanças do SDK 58](https://expo.dev/changelog/sdk-58).
