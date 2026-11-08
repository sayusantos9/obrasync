# Usuários e entrada com senha salva — 08/11/2026

## Visual de Usuários

Aplicada a mesma referência do Consulta/Cliente e de Permissões: fundo claro azulado, seletor de obra branco com ícone azul, indicadores em cartão branco com divisórias, destaque em gradiente azul-marinho/ciano, cartões suaves e situação do acesso em azul.

Lista, busca, filtros, edição, proteção das contas Gestor e confirmações existentes foram preservados. A barra inferior continua visível na lista e edição, com Usuários destacado. Nenhuma conta real ou regra de acesso foi alterada para testar o visual.

## Preenchimento de login

A tela agora identifica o usuário como `username` e a senha como senha atual nos hints de preenchimento. No iOS usa `textContentType`; Android/web usam `autoComplete`, com `importantForAutofill` no Android. No cadastro usa hints de nova senha e não inicia login nem cria empresa automaticamente. Referência: [TextInput do React Native](https://reactnative.dev/docs/textinput).

Opção **Entrar com a senha salva**, ativada inicialmente, permite tentativa automática quando o preenchimento é reconhecido. Pode ser desligada; somente esse booleano é persistido no aparelho em `@obrasync:auto-login:v1`. Se a leitura da preferência falhar, a automação fica desligada. Não foram criados armazenamento de senha ou acesso direto ao gerenciador de credenciais.

### Condições

- E-mail válido e senha com ao menos seis caracteres, seguindo a validação que o login já utilizava.
- Inserção/substituição de pelo menos seis caracteres na senha, sem sinal recente de digitação por tecla. Atualização de e-mail próxima da senha também pode completar o par.
- Campos estabilizados por 800 ms, app ativo, modo de login, seletor de perfil fechado e nenhuma tentativa em andamento.
- Uma tentativa por candidato: erro não gera loop; reaplicar os mesmos valores não repete automaticamente. Digitação, exclusão, troca de modo e submissão manual cancelam/consomem o candidato.
- Se não foi escolhido perfil, a entrada por preenchimento usa o perfil real retornado pela conta autenticada no Supabase. Não infere papel pelo endereço de e-mail. Perfil explicitamente selecionado continua sujeito à conferência existente no servidor.
- Botão Entrar e envio pelo teclado continuam disponíveis. O botão manual mantém o fluxo de seleção de perfil existente.

### Limitações práticas

React Native não expõe um evento universal confiável de “gerenciador de senhas terminou de preencher”. Esta é uma detecção conservadora de inserção em bloco, não uma integração nativa com cada fabricante. Colar uma senha completa também pode ter o mesmo comportamento. Um provedor que simule teclas/caracteres, preencha parcialmente ou entregue mudanças muito espaçadas pode exigir o botão Entrar.

É necessário homologar com Samsung Pass/Google Password Manager no S25 e com o preenchimento do iPhone. Expo Go e o aplicativo instalado com pacote próprio podem ter associações diferentes no gerenciador. Não foi afirmado teste em gerenciadores nativos/aparelhos físicos nesta entrega.

## Segurança

Usa a função `login` existente, com validação de credenciais, conta/empresa ativa, perfil e permissões no Supabase. Não altera alçadas ou exigência de segundo fator nas ações críticas. O detector guarda apenas contadores e tempos em memória; a senha permanece no estado transitório do formulário, sem logs ou persistência adicional.

## Verificação

- Quatro testes novos do detector: digitação, preenchimento nas duas ordens, validação do par, tentativa única e cancelamento.
- Prévia da tela real: preenchimento em bloco sem perfil predefinido, erro sem repetição, digitação manual/botão, preferência persistida, cadastro excluído com automação ligada, seletor de perfil aberto, pausa em segundo plano/retorno e layout de 320 px. Eventos nativos e autenticação foram simulados.
- Regressão da tela de Usuários: navegação inferior real, busca, troca de obra, edição e desativação confirmada; layout 320/390 px.
- 97 testes Node aprovados e geração dos bundles Android/iOS.

Capturas e logs locais: `.expo/login-preview/users-redesign-*.png`, `.expo/login-preview/autofill-login-320.png`, `.expo/users-autofill-*.log`.
