# Custos — identidade Planengen

Atualização em 04/11/2026 no projeto `obrasyncsupabase`.

- Custos e Adicionar despesa usam logo, cabeçalho com voltar, cartões claros e paleta azul-marinho/azul Planengen. Rolagem para o topo disponível pelo layout compartilhado.
- Resumo apresenta total realizado, previsto e saldo ou excesso. Percentual real acima de 100% é exibido; somente o preenchimento da barra é limitado. Sem orçamento de referência, não se apresenta um percentual fictício.
- Mantido cálculo central de compras confirmadas mais despesas adicionais. Mantidos os serviços de gravação. Dados exibidos correspondem à obra selecionada.
- Atalhos de comparação, pesquisa de preços, relatórios e nova despesa respeitam as permissões existentes.
- Despesas adicionais são ordenadas por data e todas são exibidas, removendo o corte silencioso dos primeiros 20 registros.
- Formulário adapta valor/data a uma coluna em telas pequenas ou com texto ampliado. Salvamento bloqueado sem conexão e erros retornados pelo serviço são apresentados.

Validação: exportações Expo iOS e Android concluídas; prévia das duas telas em 320, 390 e 430 pixels. Conferidos quatro atalhos, cenário de uso de 125% do orçamento, envio de despesa de R$ 25,50 e bloqueio offline com contraste/texto ampliado. Serviços simulados na prévia; nenhum lançamento de teste gravado no Supabase. Teclado nativo deve ser conferido no aparelho.
