# Usuários — revisão visual e navegação

Tela de Usuários e formulário de edição reorganizados na identidade Planengen: azul-marinho/azul, resumo compacto da equipe, ações de cadastro e acessos, pesquisa, filtros segmentados e cartões com iniciais, perfil, situação e obras vinculadas.

A seleção de empresa/obra e de perfil usa uma lista em painel inferior, evitando empilhar todas as opções na tela principal. Busca considera nome, e-mail e perfil, sem diferenciar acentos. Nomes/e-mails longos e obras com nomes extensos foram conferidos em largura de 320 px.

Ao entrar/sair da edição, a rolagem volta ao início do conteúdo. Nome, perfil, situação, proteção das contas Gestor, confirmação de alteração e validação no servidor foram preservados. Não houve alteração de esquema do Supabase nem de contas reais durante o desenvolvimento.

## Correção da barra inferior

`shouldShowBottomTabs` usa uma lista específica para Gestor. `SCREENS.USERS` constava na lista geral, mas faltava em `MASTER_TAB_SCREENS`. A inclusão mantém as cinco abas visíveis na lista e na edição, com Usuários destacado. O conteúdo já reserva espaço para a barra e para a área segura do aparelho. Durante digitação, a política existente oculta a barra para acomodar o teclado.

## Verificação

- Prévia com `AppNavigator`, `BottomTabs` e política de visibilidade extraída do registro real: barra visível, seleção de Usuários, navegação para Mais e retorno.
- Fluxos de pesquisa, filtro de empresa/obra, edição de nome/perfil, confirmação de desativação, Gestor protegido e bloqueio de acesso de Orçamentista.
- Layout em 390 px e 320 px. Backend simulado nessas prévias; nenhum dado real foi editado.
- Suíte existente de 93 testes aprovada; geração dos bundles Android e iOS.

Capturas locais em `.expo/login-preview/users-redesign-*.png`. A aparência em aparelho físico continua sujeita à homologação do usuário.
