# Validação do fluxo e qualidade no recebimento — 08/11/2026

## Resultado e limite da validação

Implementados rejeição na conferência, motivo, registro de não conformidade e devolução ao fornecedor. Migração `supabase/sql/receipt_quality.sql` aplicada ao Supabase `innpfmlkbqsgdiynapxb` e teste transacional repetido após implantação. Os cenários de teste usam rollback e não deixam compras, usuários ou movimentações fictícias no banco.

Validação automatizada do fluxo aprovada. **Homologação em Android e iPhone físicos permanece pendente.** Os bundles Expo para as duas plataformas e as prévias responsivas não comprovam câmera, teclado, gestos, compartilhamento nativo ou funcionamento offline em aparelhos reais. Este ambiente Windows não tem aparelho/emulador conectado.

## Evidências executadas

- `npm.cmd test`: 88 testes aprovados, incluindo seis novos testes de qualidade, saldo devolvível, resposta perdida, estoque e relatórios.
- Oito suítes SQL no banco real, em transação desfeita: `company_bdi`, `budget_versions_import`, `procurement_traceability`, `suppliers_executive_report`, `project_access_approvals`, `team_purchase_planning`, `receipts_financial`, `receipt_quality_flow`.
- Teste novo de ponta a ponta: Orçamentista cria orçamento → Gestor define base → Solicitante requisita → Compras registra duas propostas → Gestor escolhe/aprova → Compras confirma compra → Solicitante confere com rejeição → Compras devolve → Solicitante consome → Gestor devolve e registra reposição → comparação/relatório consultam o mesmo snapshot.
- Testadas quantidade acima do saldo, motivo insuficiente, rejeição integral, repetição da chave, atualização atômica de estoque/pedido/requisição, excesso de devolução, falta de estoque físico, escrita direta bloqueada, helper privado, conta inativa e revogação de acesso ocultando registros já existentes.
- Prévia com componentes reais, servidor simulado: cinco perfis, aceitação/rejeição, formulário de devolução, confirmação e largura de 320 px sem transbordamento. Captura em `.expo/login-preview/receipt-quality-320.png`.
- Regressões de interface: BDI/revisão, origem requisição/cotação, alçada/justificativa, fornecedores, PDF/Excel executivo, comparação financeira e restauração/sincronização da fila com o AppProvider real. APIs nativas/banco simulados nessas prévias; autorização real conferida pelas suítes SQL.
- Geração dos bundles Android/iOS com `npm.cmd run check:android` e `npm.cmd run check:ios`.

Logs locais: `.expo/quality-unit-tests.log`, `.expo/quality-sql-tests.log`, `.expo/quality-android.log`, `.expo/quality-ios.log`.

## Perfis

| Perfil | Orçamento | Aprovação | Recebimento | Consumo | Devolução | Executivo |
|---|---|---|---|---|---|---|
| Gestor | Cria/revisa e define base | Decide como Gestor | Sim | Sim | Sim | Sim |
| Orçamentista | Cria/revisa | Somente com alçada delegada válida | Consulta | Não | Não | Sim |
| Compras | Sem escrita | Somente com alçada válida, sem aprovar o próprio pedido | Sim | Sim | Sim | Sim |
| Obra/Solicitante | Sem escrita | Não | Sim | Sim | Não | Não |
| Consulta/Cliente | Sem escrita; documentos compartilhados conforme vínculo | Não | Não | Não | Não | Não; relatórios compartilhados mantêm o escopo próprio |

Perfis operacionais dependem de acesso ativo à obra. Alçadas também verificam valor, categoria, desvio e impedimento de decisão própria. A desativação e a revogação continuam validadas pelo servidor na sincronização.

## Como usar

Em **Recebimento**, selecionar pedido comprado com saldo e preencher por item:

1. Quantidade aceita.
2. Quantidade rejeitada, que não entra no estoque.
3. Motivo obrigatório para rejeição e descrição/código opcional de não conformidade.

A soma aceita + rejeitada não pode superar o saldo ainda pendente. Uma entrega pode ser integralmente rejeitada; nesse caso há conferência registrada, sem linha de estoque com quantidade zero. A rejeição não quita a quantidade contratada: ela continua pendente de entrega. Conferências diferentes podem rejeitar tentativas de entrega do mesmo saldo; não somar rejeições históricas como se fossem uma nova quantidade contratada.

Em **Recebimentos recentes**, Gestor e Compras encontram **Devolver [insumo] ao fornecedor**. Informar quantidade, motivo e, opcionalmente, não conformidade e documento. Anexos continuam vinculados ao recebimento, onde podem ser guardadas as evidências da rejeição/devolução.

## Regras de saldo e histórico

- Aceitação aumenta estoque e quantidade recebida do pedido.
- Rejeição não aumenta nenhum desses saldos.
- Devolução não excede a quantidade aceita naquela entrega menos as devoluções anteriores, nem o estoque físico disponível na obra.
- Estoque reservado continua protegido. Se uma devolução atingir reserva ativa, o servidor bloqueia e exige revisar/liberar a reserva antes da saída.
- Devolução baixa estoque, mantém a quantidade aceita histórica original e reduz a quantidade recebida líquida do pedido. Pedido e requisição voltam a recebimento parcial para aguardar reposição.
- A reposição posterior entra como novo recebimento do mesmo pedido, sem criar nova compra.
- Movimentações de devolução têm `supplier_return_id` e não são classificadas como consumo nos relatórios executivo e financeiro.
- A fila existente guarda também rejeições/devoluções e reutiliza a mesma chave após falha de conexão ou resposta perdida. Não há alteração local definitiva do estoque antes de confirmação do servidor. Anexos continuam online.

Exemplo testado: compra de 10 a R$ 12; aceita 6/rejeita 4; devolve 2; consome 3; devolve 1; recebe reposição de 7. Resultado: comprado R$ 120, recebido líquido 10, consumo 3, estoque 7. Rejeições e devoluções permanecem no histórico.

## Relatórios e limite financeiro

O relatório executivo usa quantidade recebida menos devolvida, com custo rateado do pedido. PDF/Excel incluem qualidade e devoluções separadas. O relatório comum de recebimentos também mostra aceitação, rejeição, motivos e devoluções.

**A devolução implementada é física, com reposição pendente. Não presume crédito fiscal, estorno, cancelamento do saldo contratado ou reembolso.** Comprado e preço real equivalente permanecem calculados sobre a compra confirmada original. Há aviso explícito na comparação financeira; devolução não vira consumo nem economia fictícia. Reembolso/cancelamento financeiro e encerramento sem reposição exigem um fluxo financeiro próprio, ainda não implementado.

O saldo devolvível exibido é o limite histórico daquela entrega; estoque atual, reservas e permissões são revalidados pelo servidor. Não há identificação física por lote/FIFO, portanto não é alegada rastreabilidade de cada unidade individual.

## Homologação restante nos aparelhos

Executar no Android e no iPhone, em uma obra de teste autorizada:

1. Entrar com cada perfil e conferir os acessos da tabela acima, inclusive troca de obra.
2. Criar orçamento, definir base, requisitar, cotar, aprovar e confirmar compra.
3. Receber parcialmente, rejeitar o restante com motivo e confirmar que só o aceito aparece no estoque.
4. Desligar a conexão, registrar conferência/devolução, fechar e reabrir o app, reconectar e confirmar que sincroniza uma única vez.
5. Consumir parte do saldo, devolver outra parte e tentar devolver acima do estoque disponível.
6. Receber reposição e conferir saldo, situação da requisição/pedido e relatório executivo.
7. Abrir e compartilhar PDF/XLSX nos aplicativos nativos e conferir os valores exportados.
8. Conferir teclado, rolagem, acessibilidade por toque e câmera/QR durante o percurso.

Registrar aparelho, versão de sistema, Expo Go/build utilizado, resultado e eventuais capturas. Sem esses resultados, o aceite físico não deve ser marcado como concluído.
