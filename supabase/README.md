# Estrutura remota

As migrations desta versão já foram aplicadas diretamente no projeto Supabase `Obrasyc`.

Não é necessário executar SQL manualmente para testar esta versão do app.

## Catálogo compartilhado de insumos

A carga de 134 insumos de `insumos_turiacu.xlsx` foi aplicada em `public.input_catalog`.
O catálogo fica disponível aos perfis internos das empresas atuais e futuras.
Após a classificação de escopo, o app exibe somente **89 materiais**, filtrando `is_material = true`; os 45 registros fora do escopo permanecem apenas como histórico da importação.
SQL, dados originais e testes desta entrega estão em `sql/`, `seeds/` e `tests/`.
Consulte [a documentação do catálogo](../docs/CATALOGO_INSUMOS.md) para acesso pelo app e detalhes da importação.

## Mescla com o GitHub

A migration `merge_github_materials` também foi aplicada: integra os materiais compartilhados
aos orçamentos com BDI e salva cotações com seus itens em uma transação.
Veja [o registro da mescla e os testes](../docs/MESCLA_GITHUB.md).

## Fornecedores e executivo — 07/11/2026

`sql/suppliers_executive_report.sql` já foi aplicado ao projeto conectado. Em novos ambientes,
execute-o após as migrações de orçamento-base, cotações e idempotência das operações.
Inclui cadastro auditado de fornecedores, seleção por ID e snapshot autorizado do relatório executivo.
Teste transacional: `tests/suppliers_executive_report.sql` (rollback).
Veja [acesso, critérios financeiros e validação](../docs/FORNECEDORES_EXECUTIVO_2026-11-07.md).

## Origem das aquisições — 07/11/2026

`sql/procurement_traceability.sql` aplicado após a migração acima. Preserva a solicitação,
os itens requisitados e a versão orçamentária nas cotações/pedidos. Testes com rollback em
`tests/procurement_traceability.sql`. Veja [o fluxo e seus limites](../docs/RASTREABILIDADE_COMPRAS_2026-11-07.md).


## Permissões por obra e alçadas — 07/11/2026

`sql/project_access_approvals.sql` aplicado após rastreabilidade. Preserva acessos atuais como vínculos explícitos e adiciona limites auditados de aprovação. Novos membros/obras precisam de liberação; alçadas começam desativadas. Teste transacional: `tests/project_access_approvals.sql`. Veja [configuração e limites](../docs/PERMISSOES_ALCADAS_2026-11-07.md).


## Recebimento offline e comparação financeira — 07/11/2026

`sql/receipt_offline.sql` e `sql/financial_comparison.sql` aplicados após permissões/alçadas. Acrescentam metadados offline, snapshot financeiro e reservas auditadas de estoque externo para o orçamento. Teste com rollback: `tests/receipts_financial.sql`. Veja [fluxo, fórmulas, testes e limites](../docs/RECEBIMENTO_FINANCEIRO_2026-11-07.md).


## Equipe e planejamento de compras — 07/11/2026

`sql/team_purchase_planning.sql` aplicado depois das migrações de recebimento offline e comparação financeira. Inclui gestão auditada de usuários pelo Gestor, frentes/centros de custo, responsáveis, prioridades, prazos e solicitação vinculada ao planejamento. Novos planejamentos precisam ser preenchidos pela equipe; não foram criados registros fictícios. Teste transacional: `tests/team_purchase_planning.sql`. Veja [fluxos, papéis e limites](../docs/EQUIPE_PLANEJAMENTO_COMPRAS_2026-11-07.md).


## BDI opcional e padrão da empresa — 07/11/2026

`sql/company_bdi.sql` aplicado após equipe/planejamento. Adiciona padrão de BDI por empresa, aplicação opcional e modos percentual/componentes. O orçamento guarda uma cópia própria e o servidor calcula os totais. Novos ambientes devem aplicar esta migração depois das migrações anteriores de orçamento/permissões, para preservar seus pontos de integração. Teste transacional: `tests/company_bdi.sql`. Veja [uso, compatibilidade e testes](../docs/BDI_OPCIONAL_EMPRESA_2026-11-07.md).


### Qualidade e devoluções — 08/11/2026

Aplicar `sql/receipt_quality.sql` após as migrações de rastreabilidade, permissões/alçadas, recebimento offline e comparação financeira. A migração preserva as funções correntes e acrescenta os pontos de integração. Já aplicada no projeto conectado. Teste reversível: `tests/receipt_quality_flow.sql` (rollback). Não reaplicar versões antigas das funções de compras sobre esta migração. Ver `../docs/VALIDACAO_FLUXO_QUALIDADE_2026-11-08.md`.


### Segurança e recuperação — 08/11/2026

`sql/security_hardening.sql` aplicado após as migrações operacionais. Não sobrescrever as funções atualizadas com versões anteriores. Ações críticas requerem AMR de senha recente e segundo fator quando cadastrado; tokens somente renovados não bastam. Usuários confirmam identidade pelo app. Testes: executar `py scripts/build_security_checks.py` na raiz do projeto e rodar `.expo/security-regressions.sql` via CLI (rollback). O gerador acrescenta claims simuladas recentes exclusivamente às fixtures; não cria tokens de autenticação. Ver `../docs/SEGURANCA_RECUPERACAO_2026-11-08.md` para backup criptografado, restauração isolada e limites.
