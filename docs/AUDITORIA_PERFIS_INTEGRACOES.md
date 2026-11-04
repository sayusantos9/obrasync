# Auditoria de perfis e integrações — 03/11/2026

Revisão do código local, não certificação das políticas do servidor. Não há ferramenta MCP Supabase disponível nesta sessão nem CLI Supabase instalada. Não foram utilizadas senhas de usuários nem alteradas credenciais. Integrações remotas precisam ser verificadas com acesso autenticado ao projeto.

## Separação de responsabilidades

| Ação de escrita | Gestor | Engenharia | Compras | Solicitante | Cliente |
|---|---|---|---|---|---|
| Empresas, equipe e obras | Sim | Não | Não | Não | Não |
| Orçamento, insumo próprio e despesa | Sim | Sim | Não | Não | Não |
| Cotação | Sim | Sim | Sim | Não | Não |
| Solicitar material | Sim | Não | Sim | Sim | Não |
| Compra, recebimento, estoque, transferência e etiqueta | Sim | Não | Sim | Não | Não |

Cliente consulta obras/orçamentos/documentos liberados e suas configurações. Cotações compartilhadas por Engenharia e Compras são coerentes com a RPC local save_material_quote, que autoriza ambos. O gestor supervisiona as operações. Não se deve remover esses acessos apenas para tornar os perfis diferentes.

A matriz consolida as restrições já sugeridas pelos botões existentes. O acesso de leitura de perfis internos continua em grande parte compartilhado. Não foi criada segregação nova de visibilidade financeira interna sem uma regra do projeto. Essa decisão precisa ser confirmada pelo responsável; RLS deve garantir o escopo por empresa/obra.

## Integrações encontradas

| Tela/fluxo | Implementação atual | Pendência |
|---|---|---|
| Login, cadastro inicial, usuários | Supabase Auth, RPC create_my_company e Edge Function create-member | Validar implantação, erros e autorização com contas por perfil |
| Obras/empresas/equipe | Tabelas Supabase | Validar RLS por empresa e vínculo do cliente |
| Insumos | input_catalog + cost_inputs | Validar permissões remotas com perfis distintos |
| Orçamentos/BDI | budgets e budget_items | Verificar transações e RLS no servidor |
| Cotações | RPC save_material_quote e tabelas | Conferir migration implantada e exclusões |
| Solicitações e fila offline | Estado local, sem INSERT remoto | Integração ainda não implementada; não é sincronização real |
| Compras e recebimentos | Estado local | Faltam persistência e transações de itens/recebimento |
| Estoque/transferência | Estado local | Faltam movimentações persistentes, concorrência e escopo real por obra |
| Despesas | Estado local | Falta persistência remota |
| QR/etiquetas | Geração local | Não existe vínculo remoto validado da etiqueta |
| Aprovações | Configuração demonstrativa | Fluxo de aprovação ainda não implementado |
| Cadastro adicional de empresa | createCompany sempre lança erro | Multiempresa adicional não implementado; entrada do menu alterada para consultar empresa |
| Configurações/acessibilidade | Estado local/AsyncStorage | Independem do Supabase |

## Correções aplicadas

- Matriz central em utils/permissions.js, guardas nas operações de orçamento, cotações, insumos, despesas, pedidos, recebimentos, solicitações, estoque e etiquetas. Gestão de obras/membros já tinha validação específica.
- Bloqueio de rotas de escrita por perfil e de rotas operacionais para Cliente. Esse bloqueio de interface não substitui RLS.
- Fluxos que acessavam selectedProject.name sem obra agora mostram seleção de obra em vez de falhar.
- Settings do Cliente não oferece alertas operacionais nem simulações de solicitações.
- Solicitações locais recebem projectId e confirmação explícita de que não foram enviadas ao servidor.
- Transferências enviavam direction: OUT, mas o contexto verificava type. Corrigido para reduzir saldo; validação de quantidade finita/positiva, saldo insuficiente e material inexistente. Continua sendo demonstração local.
- Removida a entrada enganosa para cadastrar empresa adicional em Equipe/Permissões; agora abre a consulta da empresa vinculada.

## Limites e próxima etapa necessária

Não foram migrados os módulos locais para o servidor nesta revisão. Fazer isso exige o schema real, relacionamentos, políticas e funções transacionais disponíveis, além de validar sem duplicar registros existentes. Também permanecem indicadores demonstrativos e estoque local compartilhado entre obras; não devem ser usados como controle operacional real.

Com Supabase conectado: inventariar tabelas/colunas/FKs/RLS e Edge Functions; testar leitura/escrita com cada perfil e duas empresas; implementar solicitações, pedidos, recebimentos/estoque e despesas por etapas com transações; testar recarregamento, concorrência, falha de rede e isolamento. Não liberar como produção antes disso.

Verificação local: testes de matriz de permissões, rotas, ausência de obra, entrada/saída/valores inválidos de estoque, mais a suíte existente. Compilação Expo Android/iOS. Não houve teste ponta a ponta contra o Supabase.
