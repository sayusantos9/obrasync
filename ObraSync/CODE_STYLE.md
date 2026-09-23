# Padrão de código — ObraSync

## Nomenclatura

- Componentes: `PascalCase` — `AddExpenseScreen`, `FormField`.
- Hooks: prefixo `use` — `useAppNavigation`.
- Funções de ação/domínio: verbo + objeto — `selectProject`, `createExpense`, `submitRequest`.
- Handlers de interface: prefixo `handle` — `handleSubmit`, `handlePress`, `handleChange`.
- Booleanos: prefixos `is`, `has`, `can` ou `should` — `isSaving`, `hasError`.
- Coleções: nomes no plural — `pendingRequests`, `extraExpenses`.
- Refs: sufixo `Ref` — `screenHistoryRef`.
- Constantes de módulo/configuração: `UPPER_SNAKE_CASE` — `STORAGE_KEYS`, `MAX_HISTORY_LENGTH`.
- Evitar nomes vagos como `data`, `item`, `value`, `d`, `x` quando o domínio permite um nome melhor.

## Organização

1. Imports.
2. Constantes do módulo.
3. Funções auxiliares puras.
4. Componente/hook exportado.
5. Estilos no final do arquivo.

## Estado e formulários

- Agrupar campos relacionados em um único objeto de estado.
- Não criar um `useState` para cada campo quando todos pertencem ao mesmo formulário.
- Validação e conversão ficam em utilitários puros, não misturadas ao JSX.
- Componentes repetidos de formulário devem ser reutilizados (`FormField`, `ChoiceChips`).

## JSX

- Um atributo por linha quando o componente possui vários atributos.
- Evitar uma tela inteira em uma única linha.
- Evitar lógica complexa dentro do JSX.
- Preferir retornos antecipados (`return`) a condicionais muito aninhadas.

## Funções

- Funções pequenas e com uma responsabilidade.
- Event handlers devem dizer o que acontece (`handleSubmit`) e não apenas `save` ou `action`.
- Utilitários puros devem descrever o resultado (`parseCurrencyInput`, `validateExpenseForm`).


## `const` e variáveis

- `const` não é um problema por si só; ele deve ser a escolha padrão para valores que não são reatribuídos.
- Evitar vários `const` representando o mesmo conceito fragmentado. Ex.: em formulários, preferir `react-hook-form` a diversos estados independentes.
- Valores derivados simples podem ser calculados diretamente; valores de domínio reutilizados devem ir para utilitários.
- Estilos extensos não devem ficar misturados com a lógica da tela.
- Quando uma tela acumular muitas responsabilidades, extrair componentes por função, não apenas para reduzir linhas artificialmente.
