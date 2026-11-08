# Pesquisa direta de precos

Consulta Potiguar e Telhanorte sem OpenAI ou API paga. Pesquisa geral cobre apenas essas lojas. Obramax apresentou bloqueio e Atacadao nao foi identificado com seguranca.

Selecionar insumo, orcamento-base opcional, quantidade, CEP e pagamento. Ajustar a descricao para busca, escolher loja, abrir a fonte e conferir produto e embalagem. Confirmar equivalencia permite comparar subtotal por embalagens inteiras com o orcamento. Embalagens desconhecidas exigem revisao manual. Frete, estoque, CEP e pagamento nao sao confirmados pela consulta publica.

## Ativacao

Executar supabase/sql/automatic_market_search.sql no SQL Editor e publicar a funcao na pasta do app:

    npx.cmd supabase login
    npx.cmd supabase link --project-ref SEU_PROJECT_REF
    npx.cmd supabase functions deploy market-search

Nao precisa configurar OPENAI_API_KEY nem OPENAI_SEARCH_MODEL. Os secrets antigos nao sao utilizados. A funcao valida sessao, perfil ativo, empresa e obra, e limita 20 tentativas por usuario/dia UTC. Hospedagem sujeita as cotas normais do Supabase.

## Limites e verificacao

Preco de referencia, sem garantia de entrega no CEP ou disponibilidade. Condicoes de Pix, variante e promocao precisam ser conferidas na loja. Produtos semelhantes podem nao ser equivalentes. Comparacao exige confirmacao humana e embalagem conhecida. Revisar e registrar oferta preserva o fluxo manual sem alterar compras ou orcamentos.

Adaptadores: HTML publico Potiguar (preco visivel, nunca pixel de publicidade) e catalogo publico VTEX Telhanorte. Dominios fixos, sem URLs arbitrarias, redirecionamentos ou contorno de CAPTCHA. Timeout 12s por loja, resposta ate 3MB, duas consultas paralelas na pesquisa geral. Sites podem mudar ou bloquear a rede do Supabase: nesse caso mostrar indisponibilidade por loja e permitir cadastro manual.

Consulta real local em 05/11/2026 retornou produtos com precos nas duas lojas. Publicacao e SQL remoto ainda precisam ser aplicados. Nao ha validacao em producao.

## Publicacao em 05/11/2026

SQL aplicado e market-search publicada no projeto do app. Consulta autenticada remota retornou ofertas reais da Potiguar. CLI autenticado; nao depende de chave da OpenAI.
