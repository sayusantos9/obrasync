# Permissões e alçadas — identidade visual e remoção de engrenagens

Referência: painel Consulta/Cliente existente, com azul-marinho, azul/ciano, fundo claro azulado, ícones em caixas suaves e cartões brancos arredondados.

## Tela

- Seletor de obra compacto, com opções abertas apenas ao solicitar a troca.
- Resumo da equipe operacional: acessos liberados, aprovadores com alçada e pessoas sem acesso. Gestor/Cliente/inativos não são contados como operadores liberáveis.
- Cartão de orientação com o tratamento visual dos destaques do Consulta/Cliente. Regras detalhadas podem ser expandidas.
- Busca por nome/perfil, filtros e cartões com situação do acesso e resumo da alçada.
- Editor aberto por pessoa, com switches alinhados, valor/desvio identificados, seleção de categoria e indicação de alterações não salvas.
- Outros perfis separados em uma área de consulta; seus acessos fixos não são apresentados como switches editáveis.

Preservados RPCs, exigência de autenticação recente, limites por obra, perfis autorizados, categoria e auditoria do servidor. Valor zero/inválido e desvio inválido são bloqueados no formulário. Solicitante não envia regra de alçada. O salvamento tem bloqueio contra toques simultâneos.

O fundo opcional adicionado ao layout compartilhado só é usado nesta tela; o padrão das demais telas permanece o mesmo.

## Engrenagens copiadas das referências

Removidos os botões circulares de engrenagem do topo de `ClientHomeScreen` e do cabeçalho compartilhado `PlanengenHeader`. Removidos também seus estilos/imports sem uso. Configurações continua acessível pelo menu Mais e pelos atalhos próprios de configurações. O carrossel e demais elementos do Consulta/Cliente foram preservados.

Essas eram imitações incorporadas ao código. Um controle real desenhado pelo próprio Expo Go pertence ao ambiente de desenvolvimento e não é removido pelo layout React do aplicativo.

## Verificação

- Prévia com componentes reais e backend simulado: troca de obra, contadores, filtros, busca, limite decimal/categoria, valor inválido, Solicitante sem alçada, inativo protegido e bloqueio dos quatro perfis sem autorização para a tela.
- Barra inferior Mais visível usando a política de navegação real. Larguras 390/320 px e edição em tela estreita.
- Consulta/Cliente em 320/390/430 px: ausência da engrenagem do topo, carrossel e atalho de configurações funcionais. Cabeçalho compartilhado de Compras sem engrenagem.
- Suíte existente de 93 testes e bundles Android/iOS. Não foram modificados usuários ou permissões reais no Supabase para testar o visual.

Capturas em `.expo/login-preview/access-redesign-*.png`; detalhes de autorização continuam documentados em `PERMISSOES_ALCADAS_2026-11-07.md` e `SEGURANCA_RECUPERACAO_2026-11-08.md`.
