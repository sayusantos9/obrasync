# Tratamento e retenção de dados — ObraSync

Versão operacional de 08/11/2026. Este documento descreve o sistema e propõe os prazos que ainda dependem da empresa responsável. Não constitui certificação de conformidade nem define, por conta própria, a base legal ou prazos legais da empresa.

## Responsabilidades e finalidade

A empresa que cadastra usuários e obras deve designar o responsável pelo tratamento, o canal de atendimento aos titulares e quem autoriza exportações, exclusões e restaurações. Esses responsáveis/canais ainda precisam ser formalmente preenchidos para produção; não existe um contato de privacidade fictício no aplicativo.

Finalidade: administrar acesso por empresa/obra, orçar insumos, planejar e solicitar aquisições, cotar, aprovar, comprar, receber, controlar estoque, comparar custos e manter evidência das operações. Sem finalidade de publicidade ou comercialização dos dados.

A empresa deve documentar a hipótese legal adequada a cada operação, suas obrigações de guarda e eventuais bloqueios de exclusão. Não usar consentimento genérico como justificativa para todo o banco. Referência de organização e medidas: [Guia de Segurança da Informação da ANPD](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-orientativo-sobre-seguranca-da-informacao-para-agentes-de-tratamento-de-pequeno-porte).

## Inventário simplificado

| Categoria | Exemplos | Uso / compartilhamento |
|---|---|---|
| Identificação e acesso | Nome, e-mail, identificador Auth, empresa, perfil, situação e obras autorizadas | Autenticação e autorização via Supabase; Gestor administra a equipe. Senhas não aparecem em consultas da aplicação. |
| Empresa, cliente e fornecedor | Nome/razão social, identificação documental, contato, telefone, e-mail | Identificar as partes das propostas/documentos e permitir contato operacional. Limitar acesso ao necessário. |
| Operação e auditoria | Requisições, orçamento, propostas, pedido, aprovação, valores, quantidades, recebimentos, devoluções e usuário responsável | Executar e comprovar o processo. Relatórios podem revelar dados de contato e valores comerciais. |
| Anexos | Nota, proposta, foto de entrega, evidência de não conformidade | Supabase Storage privado, com URLs temporárias e autorização por operação. Evitar documentos pessoais completos e dados sensíveis sem necessidade. |
| Sessão e segundo fator | Access/refresh token; chave de cadastro TOTP exibida somente durante configuração | Sessão nativa no SecureStore; serviço Supabase Auth verifica senha/TOTP. A chave TOTP não usa o registro de textos da tradução por toque. |
| Preferências e filas locais | Acessibilidade, rascunhos/pendências de solicitação, conferência/devolução e cache de obras/pedidos | Armazenamento privado do aplicativo; sincronização revalida identidade e acesso. Os dados operacionais locais não receberam criptografia adicional nesta entrega. |
| Acessibilidade e serviços externos | Trecho de tela escolhido para Libras; voz do sistema | VLibras recebe o texto selecionado quando a pessoa usa a tradução. Não selecionar informações pessoais/confidenciais para tradução externa. O serviço de voz depende do sistema/voz instalada; não afirmar que toda voz é necessariamente offline. |
| Exportações | PDF e XLSX | Compartilhamento por escolha do usuário. Após exportação para outro aplicativo, o ObraSync não controla cópias ou novos destinatários. |

Infraestrutura utilizada: Supabase para banco, Auth e Storage; sistema Android/iOS para armazenamento seguro da sessão e serviços nativos. Configuração de região, contratos e subprocessadores do provedor precisam ser conferidos pelo responsável da empresa. Não há envio automático de notificações nesta entrega, conforme decisão do usuário.

## Retenção: comportamento efetivo e decisões necessárias

| Dado | Comportamento implementado | Regra operacional / decisão |
|---|---|---|
| Sessão nativa | Armazenada por partes no SecureStore; migração remove a cópia anterior do AsyncStorage após gravação protegida. Logout remove o item de sessão. | Usar bloqueio do aparelho. O comportamento de backup/desinstalação do keychain depende do sistema. No web, a sessão segue o armazenamento do navegador; não alegar proteção equivalente ao keychain. |
| Cache de recebimentos | Validade de 7 dias. Cache vencido é removido **na próxima leitura**, não por processo contínuo com o app fechado. | Não confundir vencimento do cache com exclusão de documentos do servidor. |
| Filas offline | Conservadas até confirmação da sincronização ou descarte explícito permitido. Resposta ambígua impede descarte que possa duplicar operação. | Não apagar pendências automaticamente por idade. Gestor/usuário devem reconciliar aparelhos desativados e filas em conflito. |
| Perfis | Desativação revoga acesso online e preserva histórico. | Rever acessos imediatamente na saída da equipe. Exclusão/anonimização exige analisar vínculos e obrigações de guarda. Desativar não equivale a apagar Auth ou históricos. |
| Operações, auditoria e anexos | Sem expurgo automático por prazo. Arquivamento lógico preserva evidência; anexos seguem o contexto da operação. | A empresa deve aprovar prazo por classe documental, marco de contagem e bloqueios legais antes de produção. Proposta de governança: revisão anual de necessidade; não inventar um prazo legal único para todos os documentos. |
| Backups administrativos verificados | Criptografados. Script conserva pelo menos os dois últimos verificados; em novas execuções bem-sucedidas, remove os demais verificados com mais de 30 dias, conferindo caminho e hash antes. | A retenção é executada quando o script roda, não por agendamento já instalado. Artefatos sem verificação não contam como recuperação válida e exigem revisão administrativa. |
| Chave de recuperação | Separada do backup e protegida com DPAPI para a conta Windows. | Exportar uma cópia offline, guardar separada e controlar quem acessa. Não eliminar a chave enquanto existirem backups que dependam dela. |
| Exportações e arquivos de terceiros | Fora do controle após compartilhar. | Definir pasta autorizada e destinatários, limitar cópias e removê-las quando cessar a finalidade. |

**Pendência real:** ainda não há política corporativa aprovada de prazos legais, canal de privacidade nomeado ou rotina automatizada de anonimização/exclusão de históricos. Esses pontos precisam de decisão da empresa; esta implementação não apaga registros financeiros para simular conformidade.

## Atendimento ao titular e exclusão

1. Receber a solicitação no canal designado pela empresa e confirmar a identidade sem pedir dados excessivos.
2. Localizar registros de cadastro, obras, documentos, anexos e exportações sob controle da empresa.
3. Corrigir dados incorretos; suspender acesso quando necessário. Avaliar exclusão, anonimização ou retenção justificada, incluindo vínculos contábeis/contratuais e bloqueios aplicáveis.
4. Registrar decisão, responsável, data e justificativa. Não prometer exclusão imediata de todos os documentos ao desativar um usuário.
5. Registrar as exclusões aprovadas para reaplicá-las se um backup anterior for restaurado. Os backups continuam sujeitos à sua janela de retenção e ao controle de acesso.

O roteiro é administrativo; não foi criada uma tela que efetue exclusão irrestrita em cascata.

## Incidentes e operação segura

- Revogar sessões/credenciais afetadas, desativar acessos necessários e preservar evidências. Ações críticas verificam sessão existente, quando o JWT a identifica, e autenticação recente; as demais consultas continuam sujeitas à expiração normal de JWT e às regras de perfil/obra.
- Apurar dados/titulares atingidos e cumprir as providências aplicáveis junto aos responsáveis, titulares e autoridade. Não foi emitido parecer jurídico nem fixado um prazo universal neste documento.
- Não gravar senhas, tokens, chaves de API ou chaves TOTP em logs, chamados ou capturas. Não colocar `.env`, dumps, `.obsbackup`, `.dpapi` ou chaves no Git.
- Substituir credenciais de demonstração antes de produção. Configuração de política de senha, monitoramento central e recuperação administrativa de MFA precisam ser validados no provedor; a confirmação recente não substitui senha forte.
- Fazer revisão periódica de acessos e restaurações. Backups devem ter cópia fora deste computador e chave de recuperação separada; a cópia externa ainda precisa ser providenciada pelo administrador.
