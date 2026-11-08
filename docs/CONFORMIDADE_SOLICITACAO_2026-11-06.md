# Revisão de conformidade do ObraSync em 6 de novembro de 2026

O aplicativo atende parte importante do fluxo por insumos, mas ainda não atende integralmente ao MVP. Após a análise foram implementados importação XLSX/CSV, data-base, revisões, base oficial, mapa de cotações com escolha vinculada ao pedido e anexos privados. Veja `ORCAMENTO_IMPORTACAO_REVISOES.md` e `COTACOES_ANEXOS_2026-11-06.md`. Permanecem recebimento offline, alçadas, notificações e demais lacunas abaixo.

Esta revisão compara o arquivo `Solicitacao_Aplicativo_Mobile_Gestao_Insumos_Aquisicoes (1).docx`, lido diretamente em Downloads, com o código de `obrasyncsupabase`. A análise inicial foi somente leitura. Na implementação posterior autorizada foram adicionados o esquema de revisões/importação e as funções transacionais no Supabase; os registros de teste foram revertidos, sem alterar os orçamentos existentes.

## Premissa de escopo

O usuário informou que o escopo acordado em aula é gestão por insumos, sem mão de obra e serviços. Portanto, cadastro de serviços, decomposição de composições e rastreabilidade de coeficientes por serviço não são contados como pendências desta entrega adaptada. O documento original pede esses recursos: a premissa deve constar da documentação de aceite para não haver divergência com o professor. A restrição não elimina importação, orçamento-base, compras, comparação, estoque, permissões ou relatórios.

## Alterações de interface realizadas nesta revisão

- Alertas recebeu cabeçalho Planengen, seletor de obra, resumo de atenção, indicadores, filtros e cartões. Removido botão sem ação e texto de demonstração. Orçamentos exibidos no alerta são filtrados pela obra selecionada.
- Pedidos e Compras receberam o mesmo padrão de cabeçalho, cores, campos, indicadores, cartões e estados vazios. São entradas do mesmo componente, com títulos conforme a rota; Aprovações abre com o filtro correspondente.
- Busca de pedidos por fornecedor, número e insumo; filtros por aprovação, compra, recebimento parcial/concluído e rejeição. Cartões mostram itens, total e previsão.
- Formulário preserva seleção de insumos do catálogo, custos adicionais e envio ao fluxo existente. Datas DD/MM/AAAA são convertidas para ISO; valores brasileiros são interpretados corretamente; valores negativos, desconto maior que o total e datas inexistentes são bloqueados.
- Operações exibem estado de espera e compra realizada exige confirmação. Trocar de obra limpa o formulário para não enviar itens para a obra errada.

Evidências: `src/screens/AlertsScreen.js`, `PurchasesScreen.js`, `Operations.styles.js`, `src/utils/alerts.js` e `purchasePresentation.js`. A API/RPC de compras existente foi preservada.

## Matriz de atendimento no escopo por insumos

| Solicitação | Situação | Evidência e limite |
|---|---|---|
| Empresa, obra, usuário e perfis | Implementado, validar aceite | Telas e AppContext; restrições em `utils/permissions.js`; RLS no servidor. Testes por usuário/obra ainda precisam de execução completa. |
| Catálogo normalizado de insumos | Implementado | `inputCatalogService`, `CostInputEditor`, catálogo compartilhado e insumos da empresa. Códigos e unidades preservados. O catálogo de 500 itens foi preparado por scripts; não é um importador do usuário. |
| Fornecedores | Parcial | Tabela `suppliers`; RPC cria/localiza pelo nome ao criar pedido. Falta cadastro completo com documentos, contatos, avaliação, prazo e ocorrências. |
| Orçamento por insumos e BDI | Implementado; aceite em aparelho pendente | Data-base obrigatória, revisões com motivo, orçamento-base persistido e gravação transacional com recálculo no servidor. Legados continuam sem data-base até criar uma revisão. |
| Importação XLSX/CSV com mapeamento, prévia e erros | Implementado para insumos cadastrados | Seletor de arquivo/aba/cabeçalho, mapeamento, prévia, modelo e relatório de erros. Até 2 MB/2000 linhas; bloqueia desconhecidos, fórmulas, duplicidades e unidade incompatível. Não importa composições. |
| Preservar original e revisões | Implementado para orçamento | Original privado por versão, revisões vinculadas sem sobrescrever itens anteriores e auditoria. Arquivo original pode ser baixado por Gestor/Engenharia. |
| Requisição | Parcial | Obra, insumo, quantidade, necessidade, justificativa e anexos privados implementados. Falta planejamento completo por frentes/prioridade/responsáveis. |
| Cotação | Implementado por lote completo | Rodadas com cesta comum do catálogo, propostas de fornecedores, adicionais, mapa, escolha justificada do Gestor e pedido vinculado. Equivalência técnica é conferida pelo Gestor; não há escolha por item. |
| Pedido, aprovação e compra | Implementado com aprovação simples | Pedido manual ou gerado pela cotação vencedora, aprovação e compra real separadas. Faltam alçadas configuráveis por valor/obra/categoria/desvio. |
| Recebimento parcial e estoque automático | Implementado no fluxo básico | Recebimento por item, estoque automático e anexos privados (fotos/documentos). Faltam quantidade rejeitada, avaliação estruturada de qualidade e fluxo completo de devoluções. |
| Nota fiscal e comprovantes | Upload implementado | Número/referência e arquivos privados PDF/JPG/PNG de até 10 MB vinculados ao recebimento. Aceite do seletor nativo pendente; sem envio offline. |
| Consumo, entradas/saídas e transferências | Parcial | `StockScreen`, `TransfersScreen`, RPC STOCK. Existem verificações de saldo; faltam reservas, perdas discriminadas, reposição mínima e avaliação/devolução a fornecedor. |
| QR Code / código de barras | Implementado | `useScanner`, `ScannerCameraPanel`, etiquetas. Usuário confirmou câmera funcionando antes desta solicitação. A etiqueta gerada pelo AppContext é uma carga QR com fallback de leitura; persistência e rastreabilidade de todas as etiquetas devem ser verificadas no aceite. |
| Previsto × real, média, desvio e semáforo | Implementado por insumo | `utils/comparison.js` e `ComparisonScreen`: compra confirmada, rateio de frete/tributos/desconto, média ponderada, variação e impacto. Usa identidade de catálogo/empresa e unidade. |
| Conversão controlada de unidades | Parcial | Comparações de unidades diferentes ficam separadas/sem referência comparável. Falta catálogo de equivalências aprovado tecnicamente e conversão rastreada. Não há unificação automática de descrições semelhantes. |
| Separar efeitos de preço e quantidade | Parcial | Impacto de preço e quantidade excedente aparecem separados. Falta decomposição financeira explícita de efeito quantidade e efeito combinado. |
| Saldo, projeção e aderência | Parcial | Saldo planejado menos comprado e projeção pela média real. Não desconta reservas; não há escolha de cenários/último preço/média móvel nem índice de aderência ponderado. |
| Painéis e alertas | Parcial | Painéis por perfil, alertas de custos/prazos/aprovações. Não cobre todos os indicadores executivo/ABC/evolução mensal/cobertura e fornecedores descritos. A base oficial agora atualiza a previsão da obra e é selecionada inicialmente na comparação. |
| Notificações push/e-mail | Não implementado como entrega automática | Há alertas calculados no app e tabela `notifications`; não foi encontrado registro de tokens, disparo push/e-mail ou agendamento de vencimentos. |
| Offline | Parcial | `requestQueue`, AsyncStorage, isolamento por empresa/usuário e chave de operação para requisições. Recebimento ainda chama RPC diretamente e não possui fila offline equivalente. |
| Exportação | Parcial | PDF e XLSX de documentos, relatórios e comparação. Não há exportação CSV explícita nem contrato/base dedicada e documentada para Power BI. Correção recente de compartilhamento de PDF ainda requer aceite no Android real. |
| Auditoria e exclusão lógica | Parcial | `operation_audit`, `AuditScreen` e `archive_document`; arquivamento justificado de orçamento/cotação. Não cobre revisão completa de todos os cadastros/edições nem visualização de antes/depois. |
| Segurança, LGPD e backups | Parcial / não comprovado | Auth e RLS existem. Não foi localizada autenticação reforçada para atos críticos, política completa de retenção/consentimento/documentos ou evidência de teste de restauração de backup. RLS habilitada não prova por si só todas as regras. |
| Android/iOS e painel web administrativo | Parcial | App Expo exporta para ambos. Preview web local usado em testes não equivale a painel administrativo publicado e homologado. `package.json` não apresenta a infraestrutura completa de uma entrega web independente. |
| Desempenho e integrações | Parcial | Catálogo paginado e API Supabase; faltam processamento assíncrono de grandes arquivos, relatório de jobs e API/contratos de integração documentados. Conectores SINAPI/SICRO/ERP não foram localizados. |
| Entregáveis acadêmicos | Parcial | Há documentação técnica pontual, testes e guias de telas. Falta consolidar requisitos/premissas, jornadas, modelo e dicionário de dados, modelo de importação, manual único e roteiro de demonstração com evidências de aceite. |

## Critérios de aceite do documento

1. Importar orçamento analítico: equivalente por insumos implementado com validação, prévia e original preservado; aceite do seletor nativo em Android/iOS ainda pendente. Composições permanecem fora do escopo acordado.
2. Consolidar insumo de várias composições: fora do escopo acordado. A consolidação por identidade/unidade existe na comparação, mas não substitui a rastreabilidade por composição do documento original.
3. Compra atualizar média, desvio, impacto e saldo: cálculo implementado; confirmar ponta a ponta com compra/recebimento de demonstração.
4. Impedir comparação incompatível: proteção por identidade/unidade implementada; conversão aprovada ainda falta.
5. Mapa de cotações e aprovação do fornecedor escolhido: implementado por lote completo, com dois fornecedores vigentes, justificativa, auditoria e pedido vinculado aprovado ainda não comprado. Equivalência técnica é avaliada pelo Gestor.
6. Recebimento/estoque/consumo com limite de saldo: fluxo básico implementado; falta aceite completo com recebimento parcial, consumo e tentativas de exceder saldo.
7. Restringir dados e manter histórico: parcial; políticas presentes, cobertura de testes e histórico não são completos.
8. Relatório executivo e exportação consistente: parcial; os relatórios atuais não reúnem todos os indicadores exigidos.

## Prioridades recomendadas

### Prioridade 1 para o aceite do MVP

1. **Implementado:** importador XLSX/CSV por insumos com modelo, mapeamento, validação, prévia, erros e original. Falta aceite em aparelho; processamento de grandes arquivos segue fora desta entrega.
2. **Implementado:** orçamento-base com data-base/revisões, referência comum para previsão da obra e comparação e gravação transacional. Vínculo automático de pedidos ao orçamento ainda pode ser ampliado no fluxo de cotações/compras.
3. **Implementado por lote completo:** mapa comparativo com identidade/unidade/quantidade, escolha do Gestor e pedido vinculado. Escolha por item não incluída.
4. **Implementado:** anexos privados em requisição, cotação, pedido e recebimento, por perfil/empresa/documento, até 10 MB em PDF/JPG/PNG. Sem envio offline; aceite do seletor nativo pendente.
5. Recebimento offline com chave idempotente e tratamento de conflitos, equivalente à fila de requisições.

### Prioridade 2 para completar a gestão solicitada

6. Alçadas configuráveis e notificações push/e-mail reais.
7. Fornecedores completos, reservas, reposição, rejeições/devoluções e avaliação de qualidade/prazo.
8. Efeitos financeiros de quantidade/combinação, aderência e cenários; indicadores ABC/evolução/cobertura.
9. CSV/base BI, painel web administrativo, documentação de API e integrações.
10. Autenticação reforçada, retenção/LGPD, backups com teste de restauração e pacote de documentação/aceite.

## O que foi verificado no servidor

Projeto `innpfmlkbqsgdiynapxb`, consulta somente leitura de `pg_tables`, `pg_policies` e funções públicas: 30 tabelas públicas retornadas com RLS ativa e 65 políticas. Foram confirmadas `procurement_action` e `archive_document`. Existem também tabelas de composições e componentes, mas isso não significa que o app possua o fluxo do documento. A existência de `notifications`, `documents` ou `suppliers` não foi tratada como prova de uma funcionalidade completa.

Não foram criados pedidos de teste no banco, alteradas permissões, feitas migrações, testados backups ou enviados e-mails/push. A revisão de segurança não é uma certificação.

## Verificação das telas alteradas

45 testes automatizados passaram, incluindo datas, valores brasileiros, desconto, status de pedido e critérios de alerta. Preview com dados simulados validou as três rotas, criação de pedido e Alertas em 320 px sem erros de execução. Telas inspecionadas visualmente; exportações Android/iOS verificadas separadamente. Isso não substitui o aceite físico nem teste de escrita com cada perfil no Supabase.
