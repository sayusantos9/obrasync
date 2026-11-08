# Fornecedores e relatório executivo — 07/11/2026

Implementadas as duas prioridades indicadas na reanálise de 06/11. As alterações do banco foram aplicadas ao Supabase `innpfmlkbqsgdiynapxb`; não dependem de executar SQL manualmente nesse projeto.

## Onde acessar

- **Mais → Acessos da operação → Fornecedores**. Gestor e Compras cadastram/editam; Engenharia consulta. A lista é da empresa e atende suas obras.
- **Mais → Relatórios → selecionar obra → Relatório executivo**. Disponível para Gestor, Engenharia e Compras. Consulta/Cliente mantém somente seus documentos liberados, sem acesso ao novo snapshot operacional.
- Nova cotação e Novo pedido agora usam seleção de fornecedor cadastrado. O botão de gerenciamento permite abrir o cadastro. Cadastre o parceiro antes de preencher uma proposta/pedido, pois sair do formulário não preserva seu rascunho.

## Fornecedores

Nome/razão social, identificação, pessoa de contato, e-mail, telefone e situação. Nome obrigatório; contatos e identificação opcionais para preservar fornecedores antigos incompletos. A identificação aceita letras/números normalizados e não é uma certificação de validade fiscal.

Busca por nome/documento/contato/e-mail, filtros ativo/inativo/todos e apresentação incremental. Edição usa a data de atualização para detectar cadastro alterado por outra sessão. Nome e documento repetidos são recusados na mesma empresa; identificadores estáveis são usados por cotação/pedido. Cadastros antigos duplicados não foram mesclados automaticamente.

Desativação impede novas propostas e pedidos, inclusive pedidos gerados por escolha de cotação. Documentos históricos permanecem. Registros não são excluídos fisicamente. A edição e criação têm auditoria; gravações diretas autenticadas foram revogadas. RPCs validam empresa, perfil, dados e estado no servidor.

O cadastro não inclui avaliação de desempenho, qualidade ou não conformidades; esses são itens separados da gestão avançada de fornecedores, ainda previstos na reanálise.

## Relatório executivo

`executive_report_snapshot` lê os dados de uma obra autorizada em uma consulta consistente no servidor. Não depende de listas parciais carregadas na interface nem do limite de linhas da API REST. A mesma resposta alimenta tela, PDF e Excel.

Indicadores e critérios:

| Indicador | Regra |
|---|---|
| Base sem BDI | Itens somente da versão oficial vinculada à obra. |
| Base com BDI | Total comercial da versão oficial, separado da base de custos. |
| Comprometido | Todos os pedidos aprovados válidos, incluindo os comprados. |
| Aprovado não comprado | Comprometido menos comprado. |
| Comprado | Aprovação e confirmação de compra, sem cancelados/arquivados. |
| Recebido | Quantidade de cada recebimento × custo da linha do pedido, com rateio dos adicionais. |
| Comprado a receber | Comprado menos recebido. |
| Consumo/saídas estimado | Saídas OUT × média ponderada dos recebimentos da própria obra. Transferência não é consumo. |
| Estoque estimado | Saldo físico × a mesma média de recebimentos. |
| Saldo orçamentário | Base sem BDI menos comprometido, inclusive resultado negativo. |
| Projeção dos insumos | Comprometido + quantidade prevista ainda não contratada × média comprada, ou preço previsto quando não houver compra. |
| Despesas adicionais | Total separado; não é somado automaticamente por poder repetir frete/tributos já lançados nos pedidos. |

**As etapas se sobrepõem e não devem ser somadas.** Não há soma de propostas concorrentes ou revisões no executivo. A listagem documental anterior também deixou de apresentar essas somas como totais de orçamentos/cotações/pedidos.

Valores de estoque e consumo são estimativas gerenciais, não custo histórico contábil de cada saída. Linhas sem preço de recebimento/unidade conciliável aparecem sem valoração e geram aviso; não recebem um preço inventado. Transferências não transportam custo contábil. A projeção atual não considera reservas, que permanecem uma pendência separada.

Sem orçamento-base oficial, os indicadores dependentes da base mostram “Não disponível”, mantendo os valores conhecidos de compras. Não é usado zero ou um orçamento alternativo silenciosamente.

Exportações incluem critérios, versão/data-base, data da consulta, avisos, itens previstos/contratados, pedidos considerados, recebimentos, saldo físico, movimentos e despesas separadas. A saída PDF/Excel usa o mecanismo de compartilhamento existente. CSV/BI e painel web administrativo continuam fora destas duas entregas.

## Arquivos principais

- `supabase/sql/suppliers_executive_report.sql`: migração transacional e reaplicável; executar após migrações de compras/cotações/orçamentos existentes em novos ambientes.
- `src/screens/SuppliersScreen.js`, `src/components/forms/SupplierPicker.js`, `src/services/supplierService.js`, `src/utils/suppliers.js`.
- `src/utils/executiveReport.js`, `src/services/executiveReportService.js`, `src/components/reports/ExecutiveReportPanel.js`, integração em `ReportsScreen.js`.
- `supabase/tests/suppliers_executive_report.sql` e `tests/executiveSuppliers.test.mjs`.

## Validação

- 59 testes locais aprovados, incluindo etapas de compra, rateio, recebimento parcial, projeção, unidade/identidade, exclusão de cancelados/outra obra e cadastro de fornecedores.
- Testes transacionais no Supabase: cadastro, duplicidades, versão desatualizada, ativação/desativação, auditoria, restrições por perfil, pedido por ID, compra, recebimento parcial e snapshot. Todos com rollback.
- Regressão do mapa de cotações/anexos aprovada no Supabase, também com rollback.
- Bundles Android e iOS gerados sem erro.
- Preview com APIs nativas simuladas: cadastro, edição, desativação, busca sem acento, Engenharia sem edição, seleção na cotação, consistência entre tela e exportações, uma logo e largura de 320 px. Inspeção visual das telas e HTML do PDF.

O compartilhamento nativo dos novos relatórios ainda precisa do aceite no aparelho; não foi simulado como se tivesse ocorrido no celular. Nenhum fornecedor/pedido de teste foi mantido no banco. Não houve push para o Git nesta entrega.
