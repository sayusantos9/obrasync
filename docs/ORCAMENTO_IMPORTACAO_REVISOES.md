# Importação e revisões do orçamento por insumos

Implementado em 06/11/2026 em `obrasyncsupabase`. Migração aplicada no Supabase do projeto.

## Usar no aplicativo

Gestor/Master e Orçamentista/Engenharia: abra **Orçamentos → Criar novo orçamento**, selecione a obra e informe objeto e **data-base dos preços**. A validade é um campo separado e opcional.

### Importar uma planilha

1. Em **Importar orçamento**, baixe o modelo se necessário. A segunda aba contém os códigos e unidades do catálogo disponíveis para consulta.
2. Selecione XLSX ou CSV, escolha a aba e informe a linha do cabeçalho.
3. Mapeie código, unidade, quantidade e preço unitário. A base/origem é opcional quando o código completo identifica um único insumo; obrigatória para desambiguar códigos iguais de bancos diferentes.
4. Confira a prévia. Se houver erros, exporte o relatório, corrija o arquivo e selecione-o novamente. Não há descarte silencioso de linhas com erro.
5. Confirme **Usar no orçamento**. Isso substitui os itens do rascunho, mediante confirmação. Os itens continuam editáveis.
6. Confira BDI e totais e salve. O original fica vinculado à versão e pode ser baixado na lista de orçamentos por Gestor e Engenharia.

Limites: 2 MB, 2000 linhas de dados e 50 colunas por aba. Fórmulas nas colunas mapeadas devem ser convertidas em valores. Códigos devem ser preservados como texto; zeros à esquerda formatados em XLSX também são reconhecidos. CSV deve usar UTF-8. Não há conversão automática de unidade nem cadastro automático de códigos desconhecidos. Cadastre o insumo antes ou use seu código completo do catálogo. Preço zero é aceito somente quando informado; célula vazia é erro. Duplicidades devem ser consolidadas na planilha. Apenas materiais e equipamentos são aceitos, conforme o escopo acordado.

### Criar uma revisão

Em **Criar novo orçamento → Escolher versão anterior**, selecione uma versão da mesma obra. Os itens, BDI e identificação são copiados para o rascunho. Informe o motivo da revisão e confira a data-base. Salvar cria outra versão; não sobrescreve os itens nem os preços anteriores. A numeração da revisão é sequencial dentro da família, inclusive quando a revisão parte de uma versão mais antiga.

O arquivo original pertence à versão em que foi importado. Uma revisão sem nova importação referencia a versão anterior; consulte-a para baixar o original. Alterações manuais posteriores à importação não modificam o arquivo preservado.

### Definir a referência da obra

Somente o **Gestor/Master** pode usar **Definir como orçamento-base**, na lista de orçamentos. Após confirmação, essa versão passa a determinar a previsão financeira da obra e a seleção inicial em **Previsto × compra**. É possível selecionar outra versão na comparação para uma análise temporária, sem trocar a base oficial. Revisões não são somadas à previsão.

Orçamentos antigos não receberam datas inventadas: crie uma revisão com data-base para utilizá-los como referência. O orçamento-base ativo não pode ser arquivado; primeiro escolha outro. A base não seleciona automaticamente itens de pedidos nem implementa o mapa de cotações, que permanece uma pendência separada.

## Persistência e acesso

- `save_budget_version`: valida perfil, empresa, obra, cliente, catálogo, unidade, quantidades e BDI. Recalcula os totais no servidor e grava documento, itens, original e auditoria na mesma transação.
- `set_budget_baseline`: permite somente ao Gestor definir uma versão válida da mesma obra e registra a troca em `operation_audit`.
- `budgets`: data-base, versão de origem, família, número e motivo da revisão. As gravações diretas de orçamento/itens pelo cliente foram revogadas; o app usa RPC.
- `projects.baseline_budget_id`: referência persistida, com proteção contra vínculo incompatível e alteração manual do total em desacordo com a base.
- `budget_import_files`: original em base64, nome, aba, linha de cabeçalho e mapeamento. Tabela com RLS; leitura restrita a Gestor/Engenharia da empresa. O original não é carregado nas consultas usuais da lista.
- Migração reproduzível: `supabase/sql/budget_versions_import.sql`.

## Validação e limites de aceite

Testes automatizados de importação cobrem decimais brasileiros, código com zeros, preço vazio/zero, unidade, duplicidades, origem ambígua, fórmulas, CSV e XLSX real. Teste SQL transacional em `supabase/tests/budget_versions_import.sql` verifica revisão, totais, base, arquivamento bloqueado, reversão em erro, permissões por perfil e RLS do original. Os dados de teste são desfeitos por `ROLLBACK`.

Fluxo de interface verificado em preview local com seletor de arquivo e servidor simulados: importar, conferir, criar revisão, salvar original e definir base, incluindo largura de 320 px. Compilação Android/iOS e testes automatizados executados. O seletor nativo de arquivos e o compartilhamento do original ainda precisam de aceite em aparelhos físicos.

O processamento é local e limitado; não há fila de processamento de planilhas grandes. O documento original pede composições/serviços, excluídos pelo escopo acordado. Este importador atende orçamento por insumos, não importação genérica de composições.

Dependências: `expo-document-picker` compatível com SDK 58; SheetJS 0.20.3 obtido pela [distribuição oficial](https://docs.sheetjs.com/docs/getting-started/installation/nodejs/). O seletor copia o arquivo para o cache antes da leitura, conforme [documentação do Expo](https://docs.expo.dev/versions/latest/sdk/document-picker/).
