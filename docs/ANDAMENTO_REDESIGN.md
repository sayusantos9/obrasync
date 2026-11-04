# Andamento do redesign Planengen

## 03/11/2026 — Empresas e Acessibilidade (24 e 30)

- Empresas: identidade Planengen, dados organizados em documento/e-mail/telefone, estado vazio e status baseado em active (antes sempre Ativa). Preservado escopo de consulta da empresa vinculada, sem inventar edição ou novo cadastro.
- Acessibilidade: seis preferências mantidas, agrupadas por leitura/aparência e interação/avisos. Interruptores com nome/hint próprios, sem agrupamento acessível no contêiner que poderia esconder os controles. Textos explicam o alcance real e a necessidade de ativar VoiceOver/TalkBack no sistema.
- Novo componente compartilhado PlanengenScreen para estas duas telas, com logo, retorno, safe areas, texto ampliado e alto contraste. Ajustes de AppNavigator/BottomTabs evitam cabeçalho duplicado e mantêm cores consistentes em Empresas.
- Verificação: 11 testes existentes, exportações Hermes Android/iOS, prévias 320/390/430, retorno, empresa inativa/vazia e acionamento das seis preferências com contexto simulado. Capturas 390 de ambas revisadas visualmente.
- Sem alterações de banco ou contratos. VoiceOver/TalkBack e interação nativa ainda precisam de conferência em aparelho. Nenhuma etapa em andamento.

## Ajuste — destino da aba Mais

- As quatro barras que possuem Mais agora abrem SETTINGS, em vez do antigo PROFILE.
- Configurações incorpora identificação da conta, Alertas, Relatórios, saída com confirmação e os atalhos condicionais de gestão/transferências do menu anterior.
- Barra inferior permanece visível em Configurações também para perfis não gestores. A barra de engenharia, sem Mais, foi preservada.
- Compilação Android e prévia dos controles de configurações verificadas. Conferir navegação no aparelho.

## 03/11/2026 — Configurações (prompt 29)

- SettingsScreen redesenhada com marca Planengen, retorno, atalhos de acessibilidade/cartilha e controles de demonstração agrupados. Cabeçalho e barra inferior ajustados apenas na rota correspondente.
- Corrigida informação antiga de que o app inteiro era local: texto agora distingue cadastros conectados e solicitações locais. Simular offline não representa desconexão real.
- AppContext restaura preferências de acessibilidade do AsyncStorage, valida valores booleanos e preserva ajustes feitos enquanto a leitura inicial estava em andamento. Escritas sequenciais evitam perda de alterações rápidas; falha de armazenamento avisa que o ajuste vale apenas para a sessão.
- Corrigido nome da preferência reduceMotion em MasterPanelScreen e CreateMemberScreen.
- Simulação de sincronização bloqueia chamadas concorrentes e modo offline, evita duplicar IDs, remove somente o lote processado da fila e informa que nenhum dado foi enviado ao servidor. Botão desabilitado com fila vazia, offline ou processamento.
- Verificação: 11 testes existentes passaram; prévia 320/390/430 e texto ampliado/contraste, atalhos e retorno, switch offline e fila vazia; funções reais extraídas do contexto executadas com armazenamento simulado para concorrência, deduplicação, bloqueio offline, atualizações rápidas e restauração. Captura 390 revisada visualmente. Exportações Android/iOS verificadas.
- Sem alteração no Supabase. Sem teste em aparelho físico; conferir VoiceOver/TalkBack, áreas seguras e persistência ao reabrir o Expo Go. AccessibilityScreen e GuideScreen mantêm seu visual anterior.
- Etapa implementada, validação física pendente. Nenhuma outra etapa em andamento.

## 03/11/2026 — Obras (prompt 06)

- Tela e cadastro redesenhados no padrão Planengen. Busca fixa, cards com seleção distinta do status da obra, status traduzidos, estados vazios distintos, atualização ao puxar e formulário em modal com retorno/cancelamento e teclado.
- Correções: orçamento brasileiro (1.200,50), rejeição de valor negativo/inválido e nome vazio, bloqueio de submissão repetida e edição durante envio; busca limpa ao cadastrar para não ocultar a nova obra; dados da obra selecionada reconciliados com a versão nova após atualização.
- createProject agora confere MASTER e cliente ativo disponível antes do envio. Autorização do servidor/RLS continua necessária e não foi modificada. Cliente opcional preservado; formulário explica que o vínculo usa o nome do usuário selecionado.
- Selecionar obra continua levando ao início; chooseProject nos formulários continua sem navegar. Cadastro salva e seleciona a obra, mantendo a lista para consulta.
- Arquivos: ProjectsScreen.js, AppContext.js, utils/projects.js, tests/projects.test.mjs e ajustes locais de cabeçalho/barra em AppNavigator e BottomTabs. Componentes legados ProjectCard/ProjectsScreen.styles não são mais usados por esta tela, sem alteração de outros consumidores.
- Validação: 11 testes passaram, incluindo regressões de moeda, atualização de seleção e busca; exportações Hermes Android/iOS passaram; prévia do componente com dados simulados em 320/390/430, seleção, busca sem acentos, nenhum resultado, campos obrigatórios, payload com cliente e 1200.50, fechamento após sucesso e ausência de cadastro para CLIENT. Capturas da lista e formulário revisadas.
- Limites: nenhuma obra real criada; não houve validação ponta a ponta de RLS/Supabase nem teste em aparelho. Conferir teclado, modal/Voltar do Android, atualização por gesto e safe areas no Expo Go. A revisão cobre lista/cadastro/seleção/atualização, não garante todos os módulos operacionais associados à obra.
- Etapa implementada, validação física pendente; nenhuma etapa em andamento. Próxima sugestão: catálogo de insumos (07).

## 03/11/2026 — Cadastro de usuário (prompt 26)

- Redesenhado `CreateMemberScreen.js` com logo original, cabeçalho com retorno, contexto da empresa, formulário em seção e quatro perfis com descrição e seleção azul.
- Mantido createMember e seu contrato com a função Supabase existente, sem alterações no backend. Preservados confirmação, cadastrar outro e concluir. Mostrar/ocultar senha, validações, proteção contra envio duplicado, bloqueio de campos durante envio, foco entre campos e tratamento do teclado.
- AppNavigator evita cabeçalho duplicado; BottomTabs aplica o padrão Planengen também nesta tela do gestor.
- Verificação: oito testes existentes passaram; exportações Hermes iOS/Android passaram. Prévia do componente com contexto simulado em 320/390/430, validação de obrigatórios, quatro perfis, visibilidade de senha, payload CLIENT, retorno e texto ampliado/contraste. Captura 390 revisada visualmente.
- Nenhum usuário real foi criado durante a validação. Confirmações nativas, teclado, autofill e barra inferior ainda precisam de conferência no aparelho; a prévia isolada não valida esses comportamentos nativos.
- Etapa implementada, validação física pendente. Nenhuma outra tela em andamento. Próxima etapa sugerida continua Obras (06).

## 03/11/2026 — Painel do gestor (prompt 04)

Implementado por solicitação direta, sem executar a etapa global de tema.

- `src/screens/MasterPanelScreen.js`: cabeçalho próprio com logo original e saída explícita; saudação e empresa; indicadores existentes; destaque ao catálogo; lista dos seis demais módulos. Paleta marinho/azul/cinza, detalhes arquitetônicos, texto ampliado e alto contraste. Seta de topo somente após 200 pontos de rolagem, respeitando movimento reduzido.
- `src/navigation/AppNavigator.js`: oculta o cabeçalho global nas duas entradas do painel do gestor para evitar duplicação.
- `src/components/layout/BottomTabs.js`: adapta cores e área segura apenas no painel do gestor, preservando os destinos.
- Mantidos cálculos de contagem, sete atalhos e logout. Nenhuma alteração de Supabase, dependências ou regras de negócio.

### Verificações

- 8 testes existentes passaram.
- Exportação Expo/Hermes iOS e Android concluída.
- Prévia do componente real via React Native Web com contexto simulado: larguras 320/390/430, ausência de overflow horizontal, sete destinos, logout, seta ausente no topo e retorno após rolagem, texto ampliado/contraste. Captura de 390 revisada visualmente.
- A prévia isolada não inclui a barra inferior real nem valida autenticação/backend. Não houve teste em aparelho físico. Conferir safe areas, barra inferior e interação nativa no Expo Go.
- Prévia e verificadores temporários em `.expo/login-preview/*master*`.

### Próximo passo

Painel implementado; validação física pendente. Nenhuma outra etapa em andamento. Próxima etapa sugerida: Obras (prompt 06), após avaliar o painel no celular. A base visual compartilhada (00) permanece pendente; os estilos desta tela estão locais para evitar mudanças imprevistas nas demais telas.
