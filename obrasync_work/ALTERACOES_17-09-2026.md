# Alterações — ObraSync

Atualização do protótipo mobile em 17/09/2026.

## Implementado

- Remoção da aba inferior `Mais`; navegação principal agora possui Início, Obra, Materiais e Custos.
- Acesso ao Perfil movido para o cabeçalho da tela inicial.
- Nova tela `Empresa e permissões`, seguindo o controle por empresa, obra e perfil previsto no documento de requisitos.
- Perfis apresentados: Gestor/Master, Orçamentista/Engenharia, Compras/Almoxarifado, Obra/Solicitante e Consulta/Cliente.
- Cadastro demonstrativo e funcional de novos funcionários na tela de permissões.
- Seleção de obra funcional, com busca por nome, cliente ou endereço.
- Obra ativa persistida com AsyncStorage.
- Dashboard, custos, solicitações, estoque e geração de etiquetas passam a usar o contexto da obra selecionada onde aplicável.
- Geração de etiqueta envia o nome da obra ativa ao backend e o PDF impresso/compartilhado identifica a obra selecionada.
- Botão `Adicionar despesa` agora abre um formulário real.
- Despesas novas são salvas localmente, vinculadas à obra ativa e persistidas com AsyncStorage.
- Tela de custos recalcula total realizado, percentual e saldo após novas despesas.
- Alinhamento do indicador/ícone de modo offline corrigido no dashboard e na área do perfil.
- README atualizado.

## Validação realizada

- Verificação de todos os imports relativos do projeto.
- Verificação das constantes de navegação `SCREENS` e `TABS` usadas nos arquivos.
- Não foram encontradas referências de navegação ausentes.

Observação: a instalação completa das dependências no ambiente de edição ficou bloqueada pelo instalador do ambiente, portanto o bundle Expo completo deve ser validado localmente com `npm install` e `npx expo start -c`.
