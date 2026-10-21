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
