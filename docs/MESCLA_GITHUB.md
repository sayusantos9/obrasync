# Mescla do GitHub — 21/10/2026

Projeto integrado: `obrasyncsupabase`.
Origem: https://github.com/sayusantos9/obrasync, `origin/main` no commit `1891850`.
Comparação com a base `b68ed28`; fetch remoto realizado antes da mescla.
Backup anterior em `../obrasync-backup-pre-mescla-20261021` (sem node_modules, caches e .env).
O .env do projeto de trabalho foi preservado. Nenhum commit ou push foi realizado.

## Resultado

- Logo Planengen, SafeAreaProvider e navegação recebidos da equipe.
- Telas de orçamento por insumos, BDI, cotações e relatórios; exportações PDF/Excel.
- Catálogo compartilhado original preservado: 89 materiais para empresas atuais e futuras.
- Editor de orçamento combina o catálogo compartilhado com materiais próprios da empresa.
- Cadastro manual limitado a MATERIAL, com código gerado no banco e preço da empresa.
- Seleção de obra nas telas mantém o formulário aberto.
- Orçamentos gravam e recarregam subtotal, BDI, configuração, total, código e origem do material.
- Cliente do orçamento é opcional; quando vinculado, as políticas existentes controlam sua visualização.
- Cotações gravadas no Supabase em uma transação, recarregadas no login e filtradas pela obra.
- Removidas as opções e mensagens de mão de obra/serviços dos novos fluxos de materiais.
- Corrigido o teste recebido da equipe que importava uma função inexistente.
- Dependências explícitas para área segura e exportação de arquivos, com lockfile atualizado.

## Supabase

No projeto `Obrasyc` (`innpfmlkbqsgdiynapxb`), já existiam campos de BDI em budgets,
input_id/input_code/input_type em budget_items e geração de código em cost_inputs.
Essas alterações foram aproveitadas. A origem/autoria das alterações remotas não é demonstrada
apenas pela inspeção do esquema.

Aplicada a migration `merge_github_materials`, documentada em
`supabase/sql/merge_github_materials.sql`:

- catalog_input_id referencia o catálogo compartilhado sem confundi-lo com cost_inputs.
- Trigger valida material compartilhado e material próprio da empresa do orçamento.
- RPC save_material_quote grava cabeçalho e linhas atomicamente e recalcula o total.
- Funções SECURITY INVOKER, mantendo RLS; RPC sem acesso anônimo.
- Alterações aditivas; nenhuma tabela ou carga original foi removida.

O SQL parte do esquema principal e das tabelas cost_inputs/cost_references já existentes no
projeto remoto. Não é um bootstrap completo de um banco vazio. Não é necessário executá-lo
novamente no projeto conectado.

Os testes SQL usam transações revertidas. Ao final: 89 materiais compartilhados e nenhum
orçamento, cotação ou material próprio de teste persistido.

## Validação executada

- `npm test`: 8 testes passaram (BDI, arredondamento, escopo, recarga dos documentos,
  filtro por obra, validação de cotação, conteúdo HTML e estrutura XLSX).
- `node scripts/check-input-catalog.mjs`: integridade dos 134 registros de origem,
  filtros, busca, paginação, erros e sintaxe passaram.
- `supabase/tests/input_catalog_access.sql`: acesso ao catálogo e proteção contra escrita passaram.
- `supabase/tests/merge_github_materials.sql`: cadastro próprio com código automático,
  orçamento compartilhado/próprio, rejeição de item fora de escopo, cotação atômica e
  isolamento entre empresas passaram.
- `npm run check:ios`: bundle Hermes concluído, 1183 módulos.
- `npm run check:android`: bundle Hermes concluído, 1181 módulos.

## Limites e pendências anteriores à mescla

- Não houve teste de interface em iPhone/Android físico, impressão ou compartilhamento nativo.
  O teste de exportação verifica conteúdo/estrutura; os bundles verificam compilação.
- Compras, solicitações, recebimentos, despesas e estoque ainda têm fluxos locais/demonstrativos
  no contexto original. A mescla preserva esses fluxos e atribui a obra aos novos registros
  locais para os relatórios; não implementa sua persistência completa nem a comparação
  entre orçamento e compra real. Os relatórios desses módulos usam os dados disponíveis
  na sessão; os de orçamento e cotação usam os documentos carregados do banco.
- A tela principal de insumos mantém o catálogo compartilhado. Materiais manuais da empresa
  ficam disponíveis no editor de orçamento.
- Advisor de segurança manteve os avisos anteriores: quatro funções SECURITY DEFINER
  existentes e proteção contra senhas vazadas desativada. Nenhum aviso para as funções novas.
  Referências: [funções expostas](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable)
  e [proteção de senhas](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).
- npm install reportou 17 vulnerabilidades na árvore de dependências (2 moderadas e 15 altas).
  Atualizações amplas ou incompatíveis de Expo/React Native não fazem parte desta mescla.

Para iniciar, execute `npm start` dentro de `obrasyncsupabase` e reabra o app no Expo Go.
