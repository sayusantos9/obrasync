# Catálogo de insumos

Implementação de 21/10/2026 no projeto Supabase Obrasyc (`innpfmlkbqsgdiynapxb`).

## Escopo

A planilha do professor alimenta `public.input_catalog`, uma base compartilhada entre empresas atuais e futuras. Não exige copiar os registros quando uma empresa é criada. As tabelas existentes `cost_inputs` e `cost_references` continuam reservadas para referências específicas da empresa. Nenhuma compra, orçamento ou movimentação de estoque foi criada nesta carga.

O catálogo está disponível para usuários ativos dos perfis MASTER, ENGINEERING, PURCHASING e REQUESTER, vinculados a uma empresa ativa. CLIENT e usuários sem empresa não têm acesso. A política RLS e os privilégios permitem apenas leitura pelo app; usuários de uma empresa não podem alterar a base compartilhada das demais.

## Dados importados

### Escopo corrigido: somente materiais

O app consulta `input_catalog` com `is_material = true`: **89 materiais** (80 classificados na origem e 9 identificados pela descrição). Os demais **45 registros** ficam preservados na base importada, mas fora da listagem do app: 17 de mão de obra, 3 de serviços, 20 de encargos complementares e 5 de equipamentos permanentes. Os dois últimos grupos incluem, respectivamente, `TUR-0132` e `TUR-0134`, sem categoria original.

Os 9 materiais originalmente sem categoria são `TUR-0023`, `TUR-0029`, `TUR-0080`, `TUR-0081`, `TUR-0082`, `TUR-0086`, `TUR-0093`, `TUR-0100` e `TUR-0104`. A categoria original continua preservada; a classificação de escopo é separada. Novas importações precisam de classificação explícita, pois `is_material` tem padrão false.

A migração `materials_only_catalog` foi aplicada no Supabase; cópia em `supabase/sql/materials_only_catalog.sql`. Em reprodução do banco, executar o esquema, a carga original e depois essa migração. A futura comparação orçamento × compra deverá usar apenas os materiais do escopo.

- Arquivo original preservado em `supabase/seeds/insumos_turiacu.xlsx`.
- SHA-256: `AF44D0EFFEDF99F4383BE99E30744F27DF8ED799159E7EFCFEA5E7C81D8F8CD6`.
- 134 linhas: ORSE 52, SBC 8, SEDOP 10, SINAPI 64.
- 2 códigos de origem ausentes e 11 categorias ausentes, mantidos como NULL.
- Identificadores internos `TUR-0001` a `TUR-0134`, sem unificação automática por descrição.
- Quantidades de referência, preços e valores originais preservados como numeric, inclusive quantidades pequenas e valores arredondados da planilha.
- Data-base ausente preservada como NULL. Data de importação não é data-base de preço.
- Quantidade de referência não é saldo de estoque nem demanda total da obra.

## Acesso pelo app

- Gestor: Painel Master → Insumos.
- Engenharia e solicitante: aba Materiais.
- Compras: Estoque → Catálogo de insumos.
- Busca por descrição, código de origem, identificador interno e unidade; filtros de categoria e banco de origem.
- Toque no item para ver quantidade/valor de referência, arquivo e linha de origem.
- Atualize pelo botão de recarregar ou puxando a lista. Falhas de rede têm mensagem e nova tentativa.
- O catálogo pode ser consultado sem selecionar obra. Estoque continua sendo um módulo separado.

## Reprodução e validação

- DDL aplicado via MCP `apply_migration`, nome `shared_input_catalog`; cópia em `supabase/sql/shared_input_catalog.sql`.
- Extração local: `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/extract-input-catalog.ps1 -InputPath supabase/seeds/insumos_turiacu.xlsx`.
- Snapshot extraído: `supabase/seeds/insumos_turiacu.json`.
- Carga SQL aplicada: `supabase/seeds/insumos_turiacu.sql`. Usa conflito por arquivo/linha para não duplicar nem sobrescrever dados. Para uma planilha revisada, revisar a estratégia de versionamento antes de importar.
- Checks locais: `node scripts/check-input-catalog.mjs` (dados, busca, filtros, paginação, erros e sintaxe JSX).
- Checks RLS: `supabase/tests/input_catalog_access.sql`, executados contra os perfis existentes em transação encerrada com ROLLBACK.
- Comparação dos 134 registros do banco com o JSON extraído: zero diferenças.
- Exportação Android concluída com Hermes: 1.140 módulos, bundle gerado em `.expo/catalog-validation`. Esta verificação não substitui o teste visual em um aparelho.
- Exportação iOS concluída com Hermes: 1.142 módulos, bundle gerado em `.expo/catalog-validation-ios`. O catálogo usa a mesma implementação nas duas plataformas. Ainda é necessário validar em iPhone; exportar JavaScript não gera um IPA nem valida todos os recursos nativos.
- Verificações reproduzíveis: `npm run check:ios` e `npm run check:android`. Ambas as plataformas são requisitos para as próximas entregas.

## Próxima etapa

Na integração com orçamento/compras, usar o ID do catálogo para identificar a origem e copiar o preço previsto para a versão do orçamento. O preço do catálogo não deve alterar retroativamente orçamentos já aprovados. Será necessário validar data-base, conversões de unidade e significado das quantidades antes dos cálculos financeiros.

## Observações da verificação

O advisor não apontou problemas na nova tabela. Há alertas existentes em funções SECURITY DEFINER (`create_my_company`, `current_app_role`, `current_company_id`, `has_role`) e na proteção de senhas vazadas; não foram alterados nesta entrega. Referências: [funções expostas](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable), [proteção de senhas](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).
