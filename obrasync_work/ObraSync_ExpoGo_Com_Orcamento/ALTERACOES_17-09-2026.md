# Alterações — ObraSync

Atualização do protótipo mobile em 17/09/2026.

## Implementado

- Remoção da aba inferior `Mais`; navegação principal agora possui Início, Obra, Materiais e Custos.
- Acesso ao Perfil movido para o cabeçalho da tela inicial.
- Nova tela `Empresa e permissões`, seguindo o controle por empresa, obra e perfil previsto no documento de requisitos.
- Perfis apresentados: Gestor/Master, Orçamentista/Engenharia, Compras/Almoxarifado, Obra/Solicitante e Consulta/Cliente.
- Cadastro demonstrativo e funcional de novos funcionários na tela de permissões.
- Seleção de obra funcional, com busca por nome, cliente ou endereço.
- Obra ativa persistida com AsyncStorage.
- Dashboard, custos, solicitações, estoque e geração de etiquetas passam a usar o contexto da obra selecionada onde aplicável.
- Geração de etiqueta envia o nome da obra ativa ao backend e o PDF impresso/compartilhado identifica a obra selecionada.
- Botão `Adicionar despesa` agora abre um formulário real.
- Despesas novas são salvas localmente, vinculadas à obra ativa e persistidas com AsyncStorage.
- Tela de custos recalcula total realizado, percentual e saldo após novas despesas.
- Alinhamento do indicador/ícone de modo offline corrigido no dashboard e na área do perfil.
- README atualizado.

## Validação realizada

- Verificação de todos os imports relativos do projeto.
- Verificação das constantes de navegação `SCREENS` e `TABS` usadas nos arquivos.
- Não foram encontradas referências de navegação ausentes.

Observação: a instalação completa das dependências no ambiente de edição ficou bloqueada pelo instalador do ambiente, portanto o bundle Expo completo deve ser validado localmente com `npm install` e `npx expo start -c`.

## Correção — aba Orçamento
- Adicionada a aba **Orçamento** na navegação inferior.
- Criada tela dedicada com orçamento previsto, realizado, saldo e percentual executado.
- Orçamento muda conforme a **obra ativa**.
- Incluídos serviços e composições de custo por grupo.
- Incluída ação de importação XLSX/CSV como fluxo demonstrativo.
- Incluída geração e compartilhamento de **PDF do orçamento** usando `expo-print` e `expo-sharing`.
- Atalho do resumo da tela inicial agora abre a aba Orçamento.

## Refatoração de código
- `AppContext.js` reduzido de 145 para 66 linhas.
- Persistência com AsyncStorage centralizada em `usePersistentState`.
- Estado/histórico de navegação extraído para `useAppNavigation`.
- Navegação por telas convertida para mapas de componentes em vez de vários `if`.
- Metadados das abas centralizados em `TAB_ITEMS`.
- Categorias e montagem de despesas centralizadas em `utils/expenses.js`.
- Removida a função específica `openScanner`; telas usam `openScreen(SCREENS.SCANNER)`.
- Removida rota `SCREENS.COSTS` não utilizada.

## Refatoração de código limpo

- Padronização de nomenclatura de funções, handlers, booleanos, coleções e constantes.
- `AddExpenseScreen` migrada para `react-hook-form`, eliminando estados separados para cada campo.
- Componentes reutilizáveis `FormField` e `ChoiceChips` aplicados também em Empresa/Permissões e Solicitação de Material.
- Estilos das telas principais separados da lógica para reduzir declarações `const` de styled-components dentro das telas.
- `AppContext`, navegação e rotas reorganizados com nomes explícitos e funções menores.
- Formatação monetária centralizada em `src/utils/currency.js`.
- Dados de orçamento movidos para `src/data/budgetData.js`.
- Geração/compartilhamento do PDF movida para `src/services/budgetPdfService.js`.
- `.editorconfig` adicionado com indentação de 2 espaços, LF e remoção de espaços finais.
- `CODE_STYLE.md` adicionado com as convenções de código adotadas.
- Sintaxe de todos os arquivos JavaScript validada com TypeScript em modo de parsing (`allowJs`, sem emissão).
