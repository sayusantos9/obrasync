# Reanálise do ObraSync — 06/11/2026

> Atualização em 07/11: as duas próximas entregas recomendadas abaixo — cadastro de fornecedores e consolidação executiva — foram implementadas. Veja [Fornecedores e executivo](FORNECEDORES_EXECUTIVO_2026-11-07.md) para acesso, regras e validação. Este texto conserva o diagnóstico anterior; avaliação avançada de fornecedores, reservas e custo contábil de movimentos permanecem itens separados.

> Atualização posterior em 07/11: implementados também o vínculo solicitação → rodada → pedido e a preservação do orçamento/itens de origem da aquisição. Veja [Rastreabilidade das compras](RASTREABILIDADE_COMPRAS_2026-11-07.md). O diagnóstico abaixo permanece como registro da revisão inicial.

## Referência e conclusão

Documento conferido novamente: `C:\Users\pedro\Downloads\Solicitacao_Aplicativo_Mobile_Gestao_Insumos_Aquisicoes (1).docx`.

Esta reanálise substitui o diagnóstico de pendências e os números de servidor do relatório `CONFORMIDADE_SOLICITACAO_2026-11-06.md`, que acumulou atualizações de implementações anteriores.

O núcleo por insumos está implementado, mas ainda há atendimento parcial à solicitação. Não é correto considerar o aplicativo integralmente concluído só porque existem as telas e as tabelas. As maiores lacunas são rastreabilidade entre etapas, cadastro operacional de fornecedores, consolidação gerencial, recebimento offline e regras de aprovação/notificação.

**Escopo acordado com o usuário:** materiais e equipamentos/insumos; sem mão de obra, serviços e composições. As exigências de composições e coeficientes por serviço do documento original não entram na lista de desenvolvimento pendente desta entrega adaptada. Essa premissa precisa constar no aceite acadêmico.

## O que já existe

| Recurso | Atendimento atual |
|---|---|
| Empresas, obras, usuários e perfis | Cadastros e controles por perfil/empresa; acesso de Consulta vinculado à obra. Ainda é necessário concluir a matriz de permissões por obra e testar todos os perfis. |
| Catálogo de insumos | Catálogo compartilhado e itens da empresa, códigos, origem e unidades. A ampliação do catálogo não substitui os requisitos do fluxo de compras. |
| Orçamento por insumos | Quantidades, preços, BDI, data-base, revisões com motivo e seleção de orçamento-base oficial. |
| Importação XLSX/CSV | Mapeamento, seleção de aba/cabeçalho, prévia, modelo e relatório de erros; preservação do original por versão. Limitada a insumos já cadastrados, até 2 MB/2.000 linhas. |
| Requisição | Obra, material, quantidade, necessidade, justificativa, anexos e fila offline de requisições. |
| Mapa de cotações | Rodadas com a mesma cesta de insumos, preços, frete, impostos, desconto, validade, prazo e condições; escolha justificada pelo Gestor e geração de pedido aprovado. |
| Pedidos e compras | Aprovação, rejeição e confirmação da compra em etapas distintas. O pedido gerado pela proposta conserva o vínculo com a cotação vencedora. |
| Recebimento e estoque | Recebimento parcial, atualização de saldo, entradas, saídas, consumo e transferências; proteção contra saída acima do saldo. |
| Comparação previsto × realizado | Preço previsto, preço médio ponderado das compras confirmadas, diferenças unitária/percentual, impacto de preço e semáforo; rateio dos adicionais do pedido. |
| Anexos | PDF/JPG/PNG privados em requisições, cotações, pedidos e recebimentos, até 10 MB, com controle de acesso. |
| Relatórios e auditoria | Exportações PDF/XLSX, consultas e histórico de operações. A consolidação executiva ainda é parcial. |
| Interface e acessibilidade | Identidade Planengen e recursos globais de acessibilidade; são melhorias do produto, mas não substituem o aceite funcional do documento. |

O mapa está em **Mais → Acessos da operação → Mapa de cotações**, para Gestor, Orçamentista/Engenharia e Compras. Também há atalhos nos painéis desses perfis e na tela de Compras.

## Pendências prioritárias

| Prioridade | Pendência | O que precisa ser entregue | Referência |
|---|---|---|---|
| Alta | Rastreabilidade entre necessidade, orçamento e aquisição | Criar rodada a partir da requisição e manter seus itens/vínculos; registrar a versão e o item orçamentário usados na compra. Hoje cotação → pedido existe, mas a cadeia anterior não está completa. | 4.1, 6, 7.2 |
| Alta | Cadastro completo de fornecedores | Tela para consultar/editar documento, contatos e situação, com validações e uso na seleção da cotação. A tabela possui campos, mas o fluxo atual essencialmente localiza/cria fornecedor pelo nome. | 4.1, 7.2 |
| Alta | Relatório executivo consistente | Separar orçamento-base, comprometido, comprado, recebido, consumido, saldo e projeção. Revisões e propostas concorrentes não podem ser interpretadas como custo acumulado da obra. | 5, 7.4 |
| Alta | Recebimento offline | Salvar recebimento localmente, sincronizar sem duplicação e tratar conflitos/erros; definir comportamento dos anexos offline. A fila existente cobre requisições, não recebimentos. | 6.1 |
| Alta | Permissões por obra e alçadas | Completar atribuição operacional de usuários às obras e autorização no servidor; configurar aprovadores/limites por valor, obra, categoria e desvio. Hoje há aprovação simples pelo Gestor. | 6.1, 7.1, 7.4 |
| Média | Notificações efetivas | Enviar push/e-mail de solicitação, aprovação, validade de cotação, entrega e desvio, com preferências e controle de duplicação. Alertas dentro do app não equivalem a esses envios. | 6.1 |
| Média | Estoque e qualidade completos | Reservas e ponto de reposição; quantidade rejeitada, não conformidade, devolução e rastreabilidade estruturada de lote/local. Consumo e transferências já existem. | 6 |
| Média | Comparação financeira completa | Separar efeitos financeiros de preço, quantidade e combinação; indicador de aderência; considerar estoque reservado na necessidade restante e permitir critérios de projeção. | 5 |
| Média | Unidades e importação mais amplas | Conversões aprovadas e controladas; fluxo de cadastro/revisão de insumos desconhecidos na importação; processamento de arquivos grandes sem bloquear a interface. Hoje unidades incompatíveis e itens desconhecidos são bloqueados. | 4.2, 7.1, 7.4 |
| Média | Planejamento de compras | Frentes/centros de custo, prioridade, responsável, prazo de aquisição e vínculo com necessidade e orçamento disponível. | 4.1, 6 |

### Evidências das lacunas mais importantes

- `src/services/reportService.js`: totais de orçamentos e cotações somam os documentos recebidos, inclusive alternativas/revisões; pedidos também são somados sem separar todas as etapas. Isso serve como inventário documental, não como custo executivo consolidado. Não significa que o cálculo de preço real em `comparison.js` use todas as cotações.
- `src/utils/comparison.js`: a necessidade restante é `max(0, quantidade prevista − comprada)`, sem reserva; o impacto calculado é o de preço. Há excesso de quantidade, mas não sua decomposição financeira completa.
- `src/contexts/AppContext.js`: `createReceipt` chama imediatamente a operação remota `RECEIVE`; a persistência de fila está em `src/services/requestQueue.js` para requisições.
- `supabase/sql/quote_rounds.sql`: a escolha grava o pedido vinculado à proposta. A criação da rodada não preenche o vínculo com a requisição, nem fixa no pedido a versão/item do orçamento de origem.
- `src/contexts/AppContext.js`: `createLabel` monta identificador/payload de QR localmente; não persiste um cadastro de etiqueta nessa função. Leitura de QR funcionando não comprova rastreabilidade persistente de lotes.
- `src/utils/permissions.js` e políticas do banco: existem controles reais. Ainda não se deve afirmar segregação operacional completa por obra apenas pela presença de RLS e filtros de interface.

## Outras entregas da solicitação

- **Painel web administrativo:** não comprovado como entrega publicada e homologada. Preview web para desenvolvimento não equivale ao painel solicitado.
- **CSV e base para BI:** exportações atuais cobrem PDF/XLSX; falta a saída CSV/base estruturada documentada para integração.
- **Segurança operacional:** autenticação reforçada para atos críticos, documentação de tratamento/retenção de dados e evidência de restauração de backups ainda não comprovadas. Não foi feita certificação de segurança nesta revisão.
- **Documentação acadêmica:** reunir requisitos e premissas, jornadas, modelo/dicionário de dados, manual, testes e roteiro demonstrável de ponta a ponta. Já existem documentos e testes pontuais; não é necessário recomeçá-los.
- **Avaliação de fornecedores:** histórico de qualidade, atraso, não conformidade e devoluções continua incompleto.

## Recomendações e itens futuros — separados do MVP obrigatório

Os painéis ABC, tendências mensais e cobertura de estoque são apresentados como painéis sugeridos no documento. O simulador de cenários é recomendado. Podem entrar depois das lacunas do fluxo principal.

O documento pede preparação para conectores futuros SINAPI/SICRO e integrações. Não é correto exigir todos esses conectores em produção para considerar entregue o MVP. Da mesma forma, escolher vencedor por item é uma evolução: o mapa atual por lote atende a escolha de fornecedor solicitada, desde que passe pelo aceite funcional.

Pesquisa de preço em lojas é um recurso complementar. Preço anunciado de mercado não substitui o preço de uma compra confirmada no indicador de realizado.

## Verificação desta reanálise

Releitura do DOCX indicado, inspeção do código e consulta **somente leitura** ao projeto Supabase `innpfmlkbqsgdiynapxb`:

- 33 tabelas públicas, todas com RLS habilitada.
- Confirmadas as funções `save_budget_version`, `set_budget_baseline`, `save_comparable_quote`, `award_quote`, `register_operation_attachment`, `procurement_action` e `procurement_action_internal`.
- Bucket `operation-attachments` privado, limite de 10 MB.
- Conferidos campos de obras, fornecedores, cotações e recebimentos, além de políticas selecionadas.

RLS habilitada e funções presentes confirmam implantação do esquema, não provam todos os fluxos/permissões. Não foram alterados dados, feitas migrações ou enviados avisos nesta revisão.

As implementações anteriores tiveram 53 testes automatizados aprovados, testes transacionais/armazenamento e geração de bundles Android/iOS. Esses testes não foram repetidos nesta análise documental. O usuário já informou validação das primeiras entregas; falta consolidar o aceite de ponta a ponta com todos os perfis e aparelhos, sem confundir isso com ausência da implementação.

## Próximas duas entregas recomendadas

1. **Completar fornecedores:** requisito explícito do MVP e base para propostas confiáveis e histórico.
2. **Consolidar o relatório executivo:** usar orçamento-base e distinguir etapas/documentos para demonstrar os indicadores exigidos com valores consistentes.

Na sequência: ligação requisição → rodada → versão orçamentária da compra e recebimento offline. Para aceite, executar o cenário: importar orçamento, selecionar base, requisitar, cotar três fornecedores, aprovar, confirmar compra, receber parcialmente, consumir e conferir comparação/estoque/relatório.


## Atualização — permissões e alçadas (07/11/2026)

Implementados vínculos operacionais por obra, bloqueio RLS/RPC e alçada por aprovador/obra com valor, categoria e desvio unitário. Inclui pedidos e escolha de fornecedor, justificativa e auditoria. Os acessos existentes foram preservados; novas liberações são feitas pelo Gestor em Mais → Permissões e alçadas. Notificações push/e-mail, aprovação multinível e limites acumulados entre pedidos continuam fora desta entrega. Ver [implementação, testes e limites](PERMISSOES_ALCADAS_2026-11-07.md).


## Atualização — recebimento offline e comparação financeira (07/11/2026)

Entregues fila persistida de recebimentos por usuário/empresa, sincronização idempotente e tratamento de conflitos; comparação por insumo/obra com efeitos preço, quantidade e combinado, aderência por valor, cenários e reserva externa conservadora. Há exportação PDF/Excel consistente com o snapshot. Migrações aplicadas no Supabase. Anexos offline, renovação de sessão sem internet, conversão automática de unidades, custeio por lote e condições financeiras descontadas não foram incluídos. Ver [detalhamento e limites](RECEBIMENTO_FINANCEIRO_2026-11-07.md).


## Atualização — equipe e planejamento (07/11/2026)

Implementada lista de usuários por empresa/obra, edição de nome/perfil e desativação auditada, preservando histórico. O Gestor acessa pela aba Usuários. Implementado planejamento de aquisição por insumo com frente, centro de custo, responsável, prioridade, necessidade, antecedência e prazo calculado; gera solicitação idempotente e segue para a cotação vinculada. A comparação financeira já calcula automaticamente os indicadores sobre compras confirmadas e agora acompanha alterações locais de compras/estoque/base e retorno ao primeiro plano. Migração aplicada. Controle financeiro por centro, rateio entre vários destinos, notificações e planejamento offline continuam como evoluções. Ver [detalhes e testes](EQUIPE_PLANEJAMENTO_COMPRAS_2026-11-07.md).


## Atualização — BDI opcional (07/11/2026)

Aplicação do BDI agora é opcional. Novos orçamentos usam o padrão salvo da empresa; na ausência dele, começam sem acréscimo. Percentual e resultado ficam na tela principal e os componentes na configuração avançada. Cada versão mantém sua configuração, inclusive quando o padrão da empresa muda. PDF/Excel respeitam o modo usado. Migração aplicada e histórico de BDI/totais dos orçamentos existentes verificado sem alteração. Ver [detalhes](BDI_OPCIONAL_EMPRESA_2026-11-07.md).


## Atualização — validação e qualidade no recebimento (08/11/2026)

Implementadas quantidades aceitas/rejeitadas, motivo, não conformidade e devolução ao fornecedor com baixa de estoque, proteção contra excesso/duplicação e reabertura para reposição. Devolução não é consumo nem crédito financeiro presumido. Relatórios mostram recebido líquido e histórico de qualidade/devoluções. A migração foi aplicada no Supabase. O fluxo automatizado com cinco perfis, oito suítes SQL e 88 testes foi validado; bundles Android/iOS gerados. **Homologação em aparelhos físicos Android e iPhone segue pendente**, assim como reembolso/encerramento sem reposição, identificação por lote e gestão completa do ciclo da não conformidade. Ver [resultados, regras e roteiro de homologação](VALIDACAO_FLUXO_QUALIDADE_2026-11-08.md).


## Atualização — segurança e recuperação (08/11/2026)

Aplicadas confirmação recente de identidade para ações críticas, checagem de sessão/conta ativa e exigência de segundo fator quando cadastrado. Sessão nativa migrada para SecureStore; nova tela Mais → Segurança e privacidade. Backup criptografado restaurado em PostgreSQL isolado: 78 tabelas/877 registros, hashes, permissões e nove suítes funcionais conferidos. Há verificação de artefato existente sem consultar a origem. Inventário de tratamento e retenção documentado. Não confundir com failover hospedado ou certificação de conformidade: faltam custódia/cópia externa da chave e backup, aprovação corporativa dos prazos/canal de privacidade, homologação física e limpeza manual de pasta temporária bloqueada pela revisão automática. Notificações automáticas foram adiadas expressamente pelo usuário. Ver [segurança e recuperação](SEGURANCA_RECUPERACAO_2026-11-08.md) e [tratamento e retenção](TRATAMENTO_RETENCAO_DADOS_2026-11-08.md).
