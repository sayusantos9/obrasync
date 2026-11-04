# Obra/Solicitante — identidade Planengen

04/11/2026 — tela inicial e Solicitar insumos.

- Tela inicial com logo oficial, saudação, empresa, obra/status em português, progresso e solicitações pendentes na obra. Destaque para nova solicitação e acessos a catálogo, estoque, consumo, obras, alertas e configurações.
- Busca de atalhos, atualização da obra, sincronização da fila e retorno ao topo mantidos. Preferências de contraste, texto e redução de movimento respeitadas. Busca usa o componente compartilhado de tratamento do teclado.
- Indicadores financeiros genéricos foram substituídos por indicadores operacionais. O alerta de solicitações abre Alertas, em vez da área de compras.
- Formulário com obra identificada, campos e calendário na paleta nova, adaptação a telas pequenas, teclado compartilhado e retorno ao topo. Sem cabeçalho duplicado ou espaçamento reservado para uma barra ausente.
- Quantidades decimais preservadas; insumo/unidade/justificativa rejeitam espaços vazios e são aparados antes do envio. Bloqueio imediato de envio concorrente e ausência de obra. Identificador idempotente e fila offline existentes mantidos.
- Retirado botão de foto/documento que não possuía ação. Upload de anexos continua fora da implementação disponível.
- Mensagem de confirmação distingue envio e armazenamento na fila, e orienta a sincronização pela tela inicial ou configurações.

## Validação

25 testes existentes aprovados. Exportações Expo iOS/Android concluídas. Prévia das duas telas em 320/390/430 pixels, rotas operacionais, busca, rejeição de campo vazio, quantidade 2,5, limpeza dos textos, identificador de envio, retorno online/offline e bloqueio sem obra com contraste/texto ampliado. Serviços simulados; nenhum registro de teste criado no Supabase. Teclado e uso offline completo devem ser conferidos no aparelho.
