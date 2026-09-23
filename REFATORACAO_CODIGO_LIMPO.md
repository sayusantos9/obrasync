# Refatoração de código — ObraSync

Esta versão reorganiza o projeto para facilitar busca, leitura e manutenção sem alterar o objetivo do protótipo.

## Principais mudanças

- Projeto e pasta principal padronizados como `ObraSync`.
- Chaves do AsyncStorage centralizadas em `src/constants/storageKeys.js`.
- Categorias e estilos de despesas centralizados em `src/constants/expenseCategories.js`.
- Dados repetidos de `city` e `address` foram substituídos por `location` nos mocks de obra.
- Etiquetas de estoque reutilizam o nome do material pelo código, evitando repetir nome e código em dois lugares.
- Despesas mock reutilizam a configuração visual da categoria.
- `HomeScreen` foi dividida em componentes menores (`HomeHero`, `HomeMetricCard`, `HomeAlertCard` e `SyncStatusCard`).
- Configurações das ações rápidas, alertas e métricas da Home foram movidas para `src/data/homeData.js`.
- A Home agora trata erro de carregamento do dashboard e permite tentar novamente.
- Navegação passou a importar as telas por um único arquivo `src/screens/index.js`.
- `AlertsScreen` agora está registrada de forma explícita na navegação.
- Rotas de telas genéricas foram mapeadas explicitamente, evitando fallback silencioso para telas erradas.
- O estado de navegação agora usa o nome `currentScreen` em vez de `screen`.
- Funções globais foram renomeadas para deixar a intenção clara, como `submitMaterialRequest` e `syncPendingRequests`.
- `FeatureScreen` teve dados estáticos separados em `src/data/featureData.js` e código morto removido.
- `LabelScreen`, `MaterialsScreen` e `AlertsScreen` tiveram estilos separados da lógica e funções renomeadas para ações mais claras.
- Dados de perfis/permissões foram movidos para `src/data/companyPermissionsData.js`.
- Cálculos da tela de custos foram centralizados em `src/utils/costs.js` e agora usam o orçamento da obra selecionada em vez de valores fixos da primeira obra.
- Tema visual foi reformatado para facilitar manutenção.

## Regra adotada

A tela deve cuidar principalmente de montar a interface. Regras de cálculo ficam em `utils`, configurações em `data/constants`, integrações em `services` e elementos visuais reutilizáveis em `components`.
