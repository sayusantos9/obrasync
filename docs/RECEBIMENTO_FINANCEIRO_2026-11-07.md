# Recebimento offline e comparação financeira — 07/11/2026

Implementação no aplicativo e migrações aplicadas ao Supabase conectado: `receipt_offline.sql` e `financial_comparison.sql`, após permissões por obra/alçadas.

## Recebimento offline

Acesso: Mais → Recebimento, nos perfis Gestor, Compras e Obra/Solicitante.

1. Entre com internet e carregue os pedidos da obra antes de ficar offline.
2. Confira as quantidades e a nota/referência. É possível ativar **Guardar recebimentos offline**, ou deixar o app guardar automaticamente quando o envio falhar.
3. O registro é persistido no aparelho antes de qualquer chamada remota. O estoque não é aumentado localmente como se já estivesse confirmado.
4. Com a opção offline desligada, a sincronização tenta enviar enquanto o app está ativo, a cada 30 segundos e ao voltar ao primeiro plano. Também existe **Sincronizar / revalidar**.
5. Se outro recebimento tiver reduzido o saldo, ou se o acesso à obra tiver sido revogado, o registro fica para revisão. O app não reduz quantidades automaticamente.

Cada lançamento conserva a mesma chave de idempotência entre tentativas e reaberturas. Resposta perdida depois de um commit não cria outra entrada. O token do autor é capturado para o envio, evitando trocar o autor caso outra conta entre durante a requisição. A fila é separada por empresa/usuário, e um pedido com pendência local não recebe outro lançamento local até a resolução.

Um lançamento nunca enviado, ou rejeitado sem resultado incerto, pode ser descartado com confirmação. Se houve tentativa cujo resultado é desconhecido, o app impede descarte e pede reconciliação com a mesma chave. Se o acesso foi revogado nesse intervalo, o Gestor precisa restabelecer/verificar o acesso para resolver o envio; não recrie a mesma entrega.

Há cache dos pedidos/obras para restauração offline quando a sessão local continua disponível, com validade de sete dias. Não há primeiro login offline nem renovação de sessão expirada sem internet. A fila persistida continua disponível após um novo login da mesma conta. Desinstalar o app/apagar seus dados remove os registros ainda não sincronizados. A sincronização não executa com o app encerrado. Anexos continuam sendo enviados online, após a confirmação do recebimento.

O servidor mantém a data de recebimento/sincronização e registra separadamente a data informada pelo aparelho (`client_recorded_at`), sem substituir o horário oficial por um relógio local.

## Comparação financeira

Acesso: Gestor ou Orçamentista/Engenharia → Mais → **Previsto × compra real**.

- Snapshot autorizado por obra, com orçamento oficial ou revisão selecionada. Não soma revisões alternativas.
- Valores reais de compras aprovadas e confirmadas, incluindo rateio de frete, tributos adicionais e descontos. Rateio preserva o total e os centavos; não soma unidades heterogêneas como peso de rateio.
- PP, PR ponderado, desvio percentual e impacto do preço na quantidade efetivamente comprada.
- Decomposição: efeito preço = Q prevista × Δ preço; quantidade = PP × Δ quantidade comprada; combinado = Δ preço × Δ quantidade. Itens sem referência ficam separados. Uma diferença negativa durante a execução não é apresentada como economia final.
- Aderência ponderada pelo valor de cada compra: valor dentro da tolerância superior ÷ total comprado. Compras sem referência não entram no numerador; cobertura comparável aparece separadamente. O cálculo por compra evita esconder compras caras dentro de uma média favorável.
- Projeções por média ponderada, última compra, últimas três compras, preço orçamentário ou cenário manual. Cenário permite preço líquido equivalente, quantidade adicional, fornecedor e condição de pagamento, sem gravar pedidos.
- Pedidos aprovados ainda não comprados são considerados compromissos na projeção, sem duplicar a necessidade restante.
- PDF e Excel partem do mesmo relatório, com data-base, revisão, critério, tolerância, efeitos, cenários e detalhamento de compras.

### Estoque reservado e ausência de dupla contagem

Nos detalhes do insumo do orçamento-base oficial, o Gestor/Engenharia pode registrar reserva e motivo; zero libera a reserva. A RPC também autoriza Compras. Reservas são auditadas e não permitem saída/transferência abaixo do saldo reservado enquanto estiverem vinculadas ao orçamento-base vigente.

A cobertura externa comprovável é calculada conservadoramente como `max(0, estoque físico − todos os recebimentos locais)`. Assim, material comprado pela própria obra não é descontado novamente do saldo a contratar. Essa aproximação pode subestimar estoque externo quando há mistura de origens e consumo; não é um controle FIFO/lote.

O saldo é `max(0, previsto − comprado − reserva externa válida)`. O desembolso projetado considera as compras futuras necessárias e os compromissos; o custo projetado também mostra separadamente uma estimativa do valor do estoque externo. Essa estimativa não é tratada como desembolso ou custo contábil confirmado. Reservas antigas deixam de bloquear quando outro orçamento-base passa a vigorar.

## Verificações

- 75 testes locais passaram, incluindo queda após commit, fila persistida, concorrência, conflito, bloqueio de descarte incerto, fórmulas financeiras, rateio, aderência, cenários e reserva sem dupla contagem.
- `supabase/tests/receipts_financial.sql`: testes com rollback no banco aplicado. Reenvio idempotente inclusive após encerramento do pedido, conflito de saldo, integridade do estoque, metadados offline, reserva, liberação, orçamento desatualizado e isolamento por obra.
- Prévia de 320 px: formulários, correção de cenário inválido, PDF/Excel a partir dos mesmos valores e mensagem de recebimento salvo localmente. APIs de exportação simuladas nessa prévia.
- Teste com AppProvider real e backend/armazenamento nativo simulados: restauração do cache, fila após reabertura, resposta perdida sem duplicação e isolamento entre contas.
- Bundles Android/iOS verificados. Ainda é necessário aceite em aparelhos físicos, especialmente alternância de rede, seletor/compartilhamento nativo e restauração de sessão.

## Limites que continuam separados

Conversão de unidades depende de cadastro aprovado e não foi inventada por descrição. BDI e despesas sem vínculo ao insumo ficam fora desta comparação; o executivo continua exibindo despesas separadas. Cenários são simulações da sessão, exportáveis, sem persistência como plano aprovado. Condições de pagamento são documentadas; não há cálculo automático de juros/valor presente. Controle detalhado de lotes, qualidade, rejeições/devoluções, perdas e reservas por frente/serviço permanece como evolução de estoque, dentro do escopo de insumos.
