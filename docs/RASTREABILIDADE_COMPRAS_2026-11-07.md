# Solicitação, cotação e orçamento de origem — 07/11/2026

Foram implementadas duas entregas relacionadas à rastreabilidade:

1. Solicitação de insumos vinculada à rodada e ao pedido vencedor.
2. Preservação da versão e dos itens do orçamento que deram origem à aquisição.

## Uso no app

- **Solicitar insumos:** selecione pelo código/nome do catálogo. Descrição e unidade são preenchidas e protegidas; quantidade, necessidade e justificativa continuam editáveis. A fila offline preserva os novos identificadores.
- Solicitações antigas ou insumos ainda sem cadastro continuam aceitando descrição textual. Não são associados automaticamente apenas por semelhança do nome.
- **Mais → Mapa de cotações → Nova proposta / rodada → Solicitação de origem:** selecione a solicitação. Também existe **Cotar esta solicitação** nos registros enviados, para Gestor e Compras.
- Se já existe uma rodada para a solicitação, o formulário usa essa rodada. Adicione propostas de outros fornecedores nela.
- Os itens/quantidades da solicitação entram na proposta. Itens antigos em texto exigem associação explícita ao catálogo. Unidade incompatível é recusada; não há conversão automática.
- **Cotações e Compras → Origem da aquisição:** mostra solicitação, orçamento/revisão/data-base e referências dos itens previstos. Pedido gerado pela escolha também mostra a cotação de origem.

Engenharia pode vincular uma solicitação na criação de cotações; não ganha permissão para criar solicitações ou aprovar a compra. Gestor continua aprovando a escolha. As autorizações são verificadas no banco.

## Comportamento no banco

- Solicitações novas com catálogo guardam IDs, código, descrição e unidade canônica. A atualização direta dos dados da solicitação por clientes autenticados foi revogada; o fluxo transacional/idempotente permanece.
- Uma solicitação tem uma rodada vinculada. A rodada compara a cesta completa, não parcelas da necessidade. Propostas mantêm item, unidade e quantidade; preços e condições podem variar.
- A associação explícita de um item legado deve permanecer igual entre fornecedores. Os itens originais da solicitação ficam preservados no snapshot de origem da rodada.
- A primeira proposta de uma nova rodada captura o orçamento-base oficial vigente no servidor. Propostas seguintes e o pedido vencedor herdam essa versão.
- Pedidos manuais capturam a base vigente no momento da criação. Não recebem uma solicitação inventada.
- Referências por item usam identidade do catálogo e unidade, nunca apenas descrição. Preservam código, quantidade e preço previsto sem BDI. Havendo vários itens orçamentários correspondentes, todas as referências são mantidas.
- Alterar a base da obra posteriormente não altera a origem já registrada. Campos de origem do pedido e de suas linhas são protegidos contra alteração.
- Solicitação evolui para **Em cotação → Pedido gerado → Recebida parcialmente → Recebida**, de acordo com a operação vinculada. Cancelamento do pedido é refletido na solicitação.
- Uma falha de validação reverte a operação inteira; não fica uma rodada/associação parcial.

Documentos anteriores à migração não foram preenchidos retroativamente com a base atual. São identificados como legados sem referência histórica. Se não há base, ou o item não consta dela, o app informa a ausência explicitamente; não bloqueia toda compra por esse motivo.

## Exportações

Mapa de cotações inclui solicitação e orçamento/revisão de origem. A cotação exportada identifica a origem; sua planilha inclui referências por item. O executivo ganhou uma aba/tabela de rastreabilidade dos pedidos considerados, separada dos cálculos pela base atual.

## Arquivos e implantação

- Migração aplicada: `supabase/sql/procurement_traceability.sql`, após `suppliers_executive_report.sql` e migrações anteriores de compras/orçamentos/cotações.
- Teste de banco: `supabase/tests/procurement_traceability.sql`.
- Funções puras e testes: `src/utils/procurementTrace.js`, `tests/procurementTrace.test.mjs`.
- Componentes: `CatalogInputPicker`, `QuoteRequestPicker`, `OriginCard`.
- Integração em Solicitar insumos, Nova cotação, Cotações, Compras, navegação e exportações.

## Validação

- 62 testes locais aprovados.
- Bundles Android e iOS gerados sem erro.
- Teste transacional no Supabase aprovado: solicitação canônica; rodada/itens vinculados; rejeição de mudança de quantidade/origem e rodada duplicada; troca da base entre propostas; pedido mantendo a base anterior; pedido manual usando a nova base; recebimento parcial propagando estado; bloqueios por perfil e imutabilidade.
- Regressões de mapa/anexos e fornecedores/executivo aprovadas no banco. Todos os testes de escrita usaram rollback, sem manter dados fictícios.
- Preview com API simulada: origem recebida pela navegação, cesta protegida, associação explícita de legado, envio dos IDs/quantidades e layout em 320 px.
- A validação em aparelho físico continua necessária para aceite; preview não equivale a teste no celular.

## Limites mantidos

Não foram implementadas nesta entrega conversões de unidades, compras fracionadas de uma solicitação em várias rodadas, reabertura de solicitações canceladas, recebimento offline, notificações ou alçadas configuráveis. A referência orçamentária não constitui reserva de verba ou aprovação automática de excesso.
