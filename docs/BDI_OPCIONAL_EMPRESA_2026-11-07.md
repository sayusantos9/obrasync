# BDI opcional e padrão da empresa — 07/11/2026

Implementado no app e aplicado ao Supabase conectado, pela migração `supabase/sql/company_bdi.sql`.

## Uso

Gestor e Orçamentista/Engenharia acessam **Mais → Padrão de BDI da empresa**. Configure a aplicação opcional e o percentual, depois salve o padrão. A tela oferece uma prévia com subtotal de R$ 1.000,00.

No novo orçamento, o padrão é carregado automaticamente. A tela mostra normalmente apenas o interruptor, o percentual aplicado e o resultado. Quando a empresa ainda não configurou um padrão, novos orçamentos começam **sem BDI**, com acréscimo zero. Nenhuma alíquota fiscal é escolhida automaticamente.

Em **Configuração avançada do BDI**, é possível escolher:

- Percentual direto: informe uma taxa de 0 a 100%; o cálculo ignora os componentes não utilizados.
- Cálculo pelos componentes: administração central, seguros/garantias, risco, despesas financeiras, lucro, tributos e parâmetros de ISS. A fórmula existente foi preservada, com os componentes definidos pela empresa.

O novo padrão não reaproveita automaticamente os percentuais fiscais do modelo antigo. Nos novos ajustes, campos avançados começam em zero; valores de documentos legados continuam associados aos respectivos documentos.

O orçamento também permite usar novamente o padrão salvo ou salvar sua configuração atual como padrão da empresa. A configuração de cada orçamento pode ser ajustada sem mudar o padrão. Campos desativados/não aplicados não aumentam o total.

## Versões e histórico

Cada versão guarda a configuração canônica completa em `budgets.bdi_config`: aplicação, modo, taxa e componentes. O servidor calcula e grava separadamente a taxa aplicada, o acréscimo e o total, sem confiar nos totais enviados pelo app.

Uma revisão carrega a configuração da versão escolhida, mesmo que o padrão atual da empresa seja outro. Para documentos antigos sem composição de BDI, a revisão reaproveita a taxa que já estava registrada; não inventa componentes. É possível aplicar outro padrão à nova revisão por escolha explícita.

Um carregamento tardio do padrão não substitui alterações já feitas no rascunho nem a configuração escolhida de uma revisão. Alterar o padrão não atualiza registros existentes, bases de obras, compras ou projeções retroativamente.

PDF/Excel mostram os valores da versão exportada. A fórmula por componentes e o demonstrativo de ISS aparecem somente quando esse modo está efetivamente aplicado. Em BDI direto/desativado, a exportação informa a situação e os valores utilizados.

## Servidor e permissões

- Tabela `company_bdi_settings`, com RLS por empresa e leitura para Gestor/Engenharia; alterações somente por RPC autorizada.
- `get_company_bdi` devolve o padrão salvo ou um padrão desativado de versão zero.
- `save_company_bdi` valida e normaliza a configuração, exige a versão lida para evitar sobrescrita concorrente e registra auditoria.
- `save_budget_version` preserva as validações existentes de empresa, perfil, obra, revisão, insumos e arquivo importado, e normaliza o BDI antes de calcular o orçamento.
- Configurações legadas por componentes continuam válidas. Não foram alterados orçamentos antigos nem aplicados percentuais novos automaticamente às empresas.

## Verificação

- 82 testes locais passaram. Cobrem aplicação desligada, percentual direto com vírgula, cálculo legado, snapshot independente do padrão, documentos sem composição e exportações coerentes.
- Testes com rollback no Supabase: padrão desligado, aplicação automática em novo orçamento, alteração do padrão sem mudar histórico, revisão preservada, compatibilidade com componentes, bloqueio de taxa inválida, controle de versão, auditoria e acesso por papel.
- Regressões SQL de importação/versionamento, rastreabilidade, fornecedores/executivo, permissões/alçadas, equipe/planejamento e recebimento/financeiro passaram com a migração nova.
- Prévia web em 320 px: avançado recolhido, aplicação opcional, percentual/componentes, padrão salvo e reutilizado, revisão protegida de carregamento tardio e orçamento com acréscimo zero. Backend simulado nesta prévia; regras de dados verificadas separadamente no Supabase.
- Bundles Android/iOS gerados. Exportação/compartilhamento nativo e uso em aparelho físico ainda precisam de aceite.

Os parâmetros continuam sendo escolhas da empresa. Esta entrega automatiza cálculo e reaproveitamento, sem determinar enquadramento tributário ou percentual obrigatório.
