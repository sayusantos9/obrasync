# Equipe e planejamento de compras — 07/11/2026

Implementado no app e aplicado ao Supabase conectado: `supabase/sql/team_purchase_planning.sql`, depois de permissões por obra, recebimento offline e comparação financeira.

## Como funciona a comparação

Os cálculos são automáticos. O usuário cadastra/importa o orçamento, registra propostas/pedidos e confirma a compra efetivamente realizada. A comparação usa uma referência por vez e as compras confirmadas para calcular PP, preço médio real, desvio, efeitos de preço/quantidade/combinado, aderência e projeção.

A tela atualiza o snapshot ao abrir, quando mudam compras/estoque/orçamento-base carregados no app e ao retornar ao primeiro plano. Também há Atualizar comparação para buscar lançamentos de outros usuários. Não é uma assinatura em tempo real do banco. Cenários e tolerância são escolhas manuais que provocam recálculo automático. Pesquisa de mercado permanece um fluxo separado; uma oferta encontrada não constitui uma compra confirmada.

Escopo da turma: insumos de materiais/equipamentos. Não foram acrescentadas composições, serviços ou mão de obra. Detalhes de fórmulas, reservas e limites: [recebimento e financeiro](RECEBIMENTO_FINANCEIRO_2026-11-07.md).

## Gestão de usuários

**Gestor → Usuários**, pela barra inferior, pelo painel principal ou em Mais → Usuários da empresa e das obras.

- Lista da empresa ou equipe com acesso à obra selecionada; pesquisa por nome/e-mail e filtros Ativos, Inativos, Todos.
- Cadastro de novos usuários e atalho para as permissões por obra/alçadas.
- Edição de nome, perfil operacional e situação ativa. E-mail é exibido como identificador de login e permanece somente para consulta nesta tela.
- Desativar bloqueia as operações no servidor e preserva os registros e seus responsáveis históricos. Não apaga a conta de autenticação nem documentos existentes.
- Mudança de perfil/desativação revoga vínculos operacionais e alçadas e limpa o vínculo atual de Consulta em Obras. Documentos históricos conservam a identificação original.
- Reativação de usuário não restaura liberações operacionais anteriores. O Gestor precisa concedê-las novamente; Consulta/Cliente precisa ser vinculado em Obras.
- Contas Gestor são protegidas contra mudança de perfil e desativação por essa tela; promoção para Gestor também não está disponível nesse fluxo.
- Um responsável com planejamentos PLANNED precisa ser substituído nos planejamentos antes de mudar de perfil ou ser desativado.
- Escritas de perfil/situação passam pela RPC auditada; atualizações diretas desses campos foram retiradas do papel authenticated. Edições usam updated_at para rejeitar formulário desatualizado.
- Ao atualizar a obra ou retornar ao app, o perfil é consultado novamente; uma conta desativada encerra a sessão local. Chamadas remotas já verificam perfil ativo e acesso à obra.

## Planejamento de compras

**Mais → Planejamento de compras**. Gestor, Engenharia e Compras podem planejar/editar. Obra/Solicitante consulta os itens pelos quais é responsável e pode gerar suas solicitações.

1. Selecione a obra e cadastre códigos/nomes de frentes e centros de custo. É possível editar ou desativar esses cadastros; o histórico é mantido.
2. Planeje um insumo do catálogo. Informe quantidade, frente, centro, responsável ativo com acesso à obra, prioridade, data de necessidade, antecedência e observações.
3. O prazo é calculado automaticamente: **data de necessidade − antecedência em dias corridos**. O painel destaca planejamentos abertos com prazo vencido, considerando o calendário de São Paulo.
4. A estimativa unitária/total vem do orçamento-base vigente ao salvar, pela mesma identidade/unidade do insumo. A referência/revisão fica preservada no registro. Itens sem correspondência continuam sem estimativa; não recebem preço inventado.
5. Gestor, Compras ou o Solicitante responsável podem gerar a solicitação. Engenharia prepara o planejamento e a cotação, respeitando a separação de papéis já existente.
6. A solicitação recebe vínculos estruturados de planejamento, frente, centro de custo, responsável e prazo, além de prioridade e quantidade. Um clique repetido, inclusive por outro gestor, retorna a mesma solicitação.
7. Depois da geração, o planejamento conserva seus dados de origem. A tela mostra o andamento da solicitação e abre sua cotação ou o mapa correspondente. Para uma nova necessidade, crie outro planejamento.

Há filtros de situação, cancelamento auditado de planejamento ainda aberto e exportação Excel com as referências completas. Não é permitido editar um planejamento já solicitado; mudanças posteriores seguem o fluxo da solicitação/aquisição.

## Segurança e verificação

RLS por obra e papel nas novas tabelas. As RPCs validam empresa, perfil, acesso, dimensão ativa, responsável elegível, insumo canônico e orçamento-base. Configuração de acessos, alteração de usuários e planejamento usam bloqueios consistentes por obra para reduzir disputas com mudanças de permissão. A criação de planejamento possui chave estável para não duplicar um envio cujo retorno foi perdido.

- 77 testes locais passaram, incluindo datas de prazo e conteúdo da exportação.
- Testes reais no Supabase com rollback: criação/edição de dimensões, normalização de insumo, prazo/estimativa, referência alterada, permissões por papel, uma solicitação por planejamento, vínculos estruturados, edição/desativação/reativação de usuário, proteção de Gestor, escrita desatualizada, revogação de acesso, alteração de Consulta e auditoria.
- Prévia web em 320 px: lista, filtros, edição de nome, confirmação de desativação, edição de planejamento, prazo, geração de solicitação e navegação vinculada. Backend simulado nessa prévia; validação de dados feita separadamente no Supabase.
- Bundles Android/iOS gerados. Aceite em aparelhos físicos continua necessário.

## Evoluções separadas

Esta entrega inicia o planejamento operacional completo dos campos solicitados e liga-o ao fluxo de aquisição. Distribuição de um item entre várias frentes/centros, limites financeiros por centro, calendário de dias úteis/feriados, notificações push/e-mail, aprovações de planejamento e persistência offline de planejamentos permanecem como extensões. Não há alteração de e-mail/senha de terceiros ou exclusão definitiva de contas nesta tela; a remoção de acesso ocorre por desativação.
