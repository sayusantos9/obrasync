# Destaques compartilhados dos painéis

**Estado atual:** por solicitação do usuário, `ClientHomeScreen.js` foi restaurado integralmente do commit `5de1675`, incluindo seu carrossel original. O arquivo e sua imagem foram conferidos byte a byte contra o Git. O componente compartilhado permanece somente nos outros quatro perfis. As referências ao Cliente abaixo registram a implementação anterior à restauração.

04/11/2026 — reaproveitamento do painel Consulta/Cliente.

O carrossel, os ícones de contexto, a imagem de obra e a apresentação de um título com descrição e acesso foram reunidos em `src/components/home/HomeHighlights.js`. O componente aparece nos painéis Gestor, Orçamentista, Compras, Solicitante e Consulta/Cliente.

| Perfil | Destaques |
| --- | --- |
| Gestor | Equipe, obras e relatórios |
| Orçamentista | Novo orçamento, comparação e pesquisa de preços |
| Compras | Pedidos, recebimentos e pesquisa de preços |
| Solicitante | Solicitação, estoque e consumo |
| Consulta/Cliente | Obras, orçamentos e documentos |

Cada painel mantém seus indicadores e acessos específicos. No Solicitante, o destaque fixo de nova solicitação passou a ser o primeiro banner, evitando dois cartões grandes para a mesma tarefa. A pesquisa de preços é descrita como consulta e registro, sem prometer pesquisa automática.

## Comportamento

- Navegação por gesto horizontal, setas e indicadores. Sem avanço automático.
- Contador do banner atual, controles com área de toque e descrição acessível; banners inativos ocultos dos leitores de tela nativos.
- Largura medida no contêiner e alinhamento corrigido ao redimensionar. Altura acompanha o texto, sem proporção fixa que possa cortar descrições ampliadas.
- Respeita redução de movimento e alto contraste. A foto decorativa é removida no alto contraste.
- Atalhos filtrados pelas permissões existentes. Operações que exigem obra levam à seleção quando não há obra ativa.

## Validação

25 testes existentes aprovados e exportações Expo Android/iOS concluídas. Prévia do componente nas larguras 320/390/430: 15 destinos dos cinco perfis, setas, indicadores, retorno circular, seleção de obra e alto contraste/texto ampliado. Serviços e contexto simulados. Gesto e leitor de tela nativos devem ser conferidos no aparelho.

## Correção de altura no Android

Após relato de um banner ocupando várias telas no Android, removido `flex: 1` do conteúdo do banner. A rolagem horizontal tem altura explícita baseada na maior altura natural medida dos textos e não cresce para preencher a rolagem vertical. Os banners são medidos sem esticamento vertical. A correção atende aos cinco perfis.

Conferido também o painel Cliente completo em 320/390/430, com verificação da altura do carrossel e visualização dos cartões abaixo dele. Repetidas as verificações dos 15 atalhos e exportações Android/iOS. A confirmação em dispositivo físico ainda é necessária.
