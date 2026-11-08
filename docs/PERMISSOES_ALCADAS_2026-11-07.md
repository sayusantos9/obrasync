# Permissões por obra e alçadas — 07/11/2026

Implementado no app e aplicado ao Supabase conectado.

## Acesso no aplicativo

Gestor → Mais → **Permissões e alçadas**. Selecione a obra, libere o membro e salve o cartão desse usuário. Para Engenharia/Compras, também é possível ativar a alçada, definir valor máximo por pedido, maior desvio unitário permitido (%) e categoria (todas, materiais ou equipamentos).

Gestor conserva acesso administrativo às obras da própria empresa. Consulta/Cliente continua dependendo do vínculo no cadastro de Obras. Solicitante pode receber acesso, mas não alçada de aprovação. Usuários inativos não recebem novos vínculos.

Os acessos operacionais existentes foram convertidos em vínculos explícitos, somente na primeira execução da migração. **Novos usuários e novas obras precisam de liberação do Gestor.** Não foram criadas delegações automáticas. Alterações de acesso ficam na auditoria.

O app atualiza os dados ao retornar ao primeiro plano e permite atualizar a obra. Uma tela já carregada pode continuar mostrando dados antigos até a atualização; as novas chamadas ao servidor já respeitam a revogação. Dados já baixados/offline não são apagados remotamente.

## Aprovações

- Pedidos/Compras mostra a avaliação da alçada e exige justificativa de pelo menos 10 caracteres para aprovar/rejeitar.
- O mapa de cotações permite a escolha por Gestor, Engenharia e Compras; o servidor avalia o pedido resultante antes de registrar a escolha. Uma escolha negada não deixa pedido parcial.
- Valor inclui frete, impostos adicionais e desconto. O desvio considera o maior aumento unitário perante a referência orçamentária preservada na origem, distribuindo os adicionais proporcionalmente ao valor dos itens.
- Sem orçamento de origem/referência suficiente, quantidade acima da previsão, categoria incompatível, valor/desvio excedido ou autoria própria da solicitação/proposta/pedido: encaminhar ao Gestor.
- Pedidos mistos exigem categoria Todas. O Gestor pode autorizar exceções, sempre com justificativa.
- A decisão grava responsável, data, justificativa, métricas e regra aplicada em snapshot/auditoria. Mudanças posteriores nas regras não apagam decisões anteriores.
- Alterações de alçada e decisões são serializadas por obra e os limites são recalculados no servidor, evitando aprovação com regra antiga carregada na tela.

## Proteção de dados

RLS restritiva por obra complementa as regras de empresa/perfil. As rotinas privilegiadas de orçamento, base, cotações, compras, estoque, origem, relatório executivo, arquivamento, pesquisa de preços e anexos também verificam o vínculo. Transferência exige acesso tanto à origem quanto ao destino. O catálogo e os fornecedores continuam compartilhados dentro da empresa.

Arquivos: `supabase/sql/project_access_approvals.sql`, `supabase/tests/project_access_approvals.sql`.
Aplicar a migração depois de `procurement_traceability.sql`. Ela preserva as funções existentes por pontos de integração verificados. Não reaplique versões antigas dessas funções depois desta migração.

## Validação

- 62 testes locais passaram; bundles Android e iOS gerados.
- Testes SQL com rollback: limites exatos, valor excedido, desvio excedido, categoria, autoria própria, revogação, dados filhos, arquivos/relatórios, arquivamento, transferência, ausência de baseline, exceção do Gestor, auditoria e escolha delegada de fornecedor.
- Regressões transacionais de importação/versionamento de orçamento, mapa de cotações/anexos, fornecedores/executivo e rastreabilidade passaram com a nova migração.
- Prévia web de 320 px: configuração de acesso, valor decimal brasileiro, categoria, usuário Solicitante sem alçada e bloqueio de rota para Engenharia. API simulada nesta prévia; regras de banco testadas separadamente no Supabase.
- Não substitui validação manual em aparelhos físicos.

## Limites desta entrega

Uma alçada por pessoa/obra, aplicada ao pedido inteiro. Não implementa cadeia de vários aprovadores, substitutos por férias, aprovação parcial de itens, limites acumulados por período nem detecção de fracionamento entre pedidos. Essas extensões continuam possíveis; não são apresentadas como já prontas.
