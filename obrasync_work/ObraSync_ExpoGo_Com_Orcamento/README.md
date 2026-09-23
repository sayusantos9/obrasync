# ObraSync

Protótipo mobile multiplataforma em React Native + Expo para gestão de obras, insumos, compras, recebimentos, estoque e custos. O mesmo código roda em Android e iOS.

## Requisitos

- Node.js 20 ou mais recente
- Aplicativo Expo Go instalado no celular
- Celular e computador conectados à mesma rede Wi-Fi

## Executar no Expo Go

```bash
npm install
npx expo start
```

Abra o Expo Go no Android ou iPhone e leia o QR Code exibido no terminal. No iPhone, o QR Code também pode ser lido pelo aplicativo Câmera. Se a rede local bloquear a conexão, execute:

```bash
npx expo start --tunnel
```

## Executar o backend de QR Codes

O backend fica na pasta `backend` e deve ser iniciado em outro terminal:

```bash
cd backend
npm install
npm run dev
```

A API será aberta na porta `3333`. Para o iPhone ou Android acessar o servidor do computador, copie o arquivo de configuração e informe o IPv4 da sua máquina:

```powershell
Copy-Item .env.example .env
```

Conteúdo do arquivo `.env`:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.10:3333
```

Use `ipconfig` no Windows para confirmar o IPv4. O celular e o computador precisam estar na mesma rede Wi-Fi. Depois de alterar o `.env`, reinicie o Expo:

```powershell
npx.cmd expo start -c
```

### Endpoints disponíveis

- `GET /health`: verifica se a API está funcionando.
- `POST /api/labels`: cadastra uma etiqueta e gera seu QR Code.
- `GET /api/labels`: lista as etiquetas cadastradas.
- `GET /api/labels/:id`: consulta os dados depois da leitura.
- `GET /api/labels/:id/qrcode.png`: fornece o QR Code em PNG.

## O que já funciona

- Dashboard com a nova identidade visual do ObraSync
- Navegação inferior fixa: Início, Obra, Materiais e Custos
- Busca de materiais
- Scanner real pela câmera para QR Code e códigos de barras
- Geração de etiquetas internas com QR Code válido
- Backend Node.js responsável pelo cadastro e geração dos QR Codes
- Impressão da etiqueta pelo sistema do Android ou iOS
- Geração e compartilhamento da etiqueta em PDF
- Tela de custos em cartões e listas, sem gráficos
- Cadastro funcional de despesas com atualização do total realizado
- Seleção funcional de obra ativa, persistida no aparelho
- Tela de Empresa e permissões com perfis de acesso e cadastro demonstrativo de funcionários
- Lista de obras, alertas, pedidos, aprovações e estoque
- Ícones coloridos com significado visual por categoria
- Ações rápidas para solicitações, cotações, scanner e estoque
- Formulário com `react-hook-form` e `useController`
- Simulação de chamadas assíncronas com `async/await`
- Modo offline e fila local usando AsyncStorage
- Sincronização simulada de solicitações
- Tema e componentes reutilizáveis com Styled Components
- Layout responsivo para diferentes tamanhos de celulares Android e iPhone
- Ícone próprio do aplicativo para iOS, Android e web

## Identidade visual

- Ameixa: estrutura, cabeçalhos e navegação
- Amarelo-obra: ações principais e progresso
- Verde: operações concluídas e resultados positivos
- Vermelho-tijolo: alertas e desvios de orçamento
- Marfim: fundo principal e melhor conforto de leitura

## Etiquetas e rastreabilidade

As opções de etiqueta ficam nos fluxos de **Recebimento** e **Estoque**. O aplicativo envia os dados ao backend, que cria um identificador único, salva o registro e devolve o QR Code. A etiqueta pode ser impressa, compartilhada em PDF e lida novamente pela câmera para consultar o servidor.

Ao abrir o scanner pela primeira vez, permita o acesso à câmera. O leitor aceita etiquetas do ObraSync, QR Codes externos e os principais formatos de código de barras usados por fornecedores.

## Plataformas

- Android: Expo Go, emulador ou build posterior com EAS
- iOS: Expo Go, simulador no macOS ou build posterior com EAS
- Identificadores configurados para as duas plataformas em `app.json`

## Estrutura

```text
src/
  assets/
    app/          ícones e imagens usados pelo Expo
  components/
    common/       componentes reutilizáveis de interação
    layout/       cabeçalhos e navegação inferior
    ui/           elementos visuais básicos
  contexts/       estado global e regras compartilhadas
  data/           dados demonstrativos
  hooks/          hooks personalizados
  navigation/     navegador e nomes centralizados das rotas
  screens/        telas do aplicativo
  services/       funções assíncronas e acesso a dados
  theme/          cores, espaçamentos e tokens visuais
backend/
  data/            armazenamento JSON demonstrativo
  src/
    controllers/   entrada e saída das requisições
    repositories/  persistência das etiquetas
    routes/        endpoints HTTP
    services/      validação e geração dos QR Codes
```

O backend utiliza um arquivo JSON para demonstrar a persistência. Em produção, o repositório poderá ser substituído por PostgreSQL ou outro banco sem alterar as rotas e os controladores.

## Orçamento

A navegação inferior possui uma aba **Orçamento** vinculada à obra ativa. Nela é possível visualizar previsto, realizado, saldo, serviços/composições e gerar/compartilhar um relatório em PDF. O protótipo também apresenta o fluxo de importação XLSX/CSV previsto nos requisitos.

