# Prompts para redesenhar as telas do ObraSync

Preparado em 03/11/2026. Inventário: 31 componentes de tela em `src/screens`.
Este documento planeja o redesign; sua criação não modifica as telas.

## Como usar

No Codex com acesso a esta pasta, copie um bloco de prompt por conversa. Cada bloco manda ler o contrato abaixo, portanto não depende da memória da conversa anterior. Se utilizar outra ferramenta sem acesso aos arquivos, forneça também este contrato, os arquivos relevantes e a identidade visual.

Comece pela etapa 00. Depois escolha uma tela por vez. Ordem sugerida: início do solicitante → obras → catálogo → solicitação → estoque/compras/recebimento → orçamento/cotações → telas administrativas e auxiliares. Login já redesenhado pode ficar para revisão final. Engenharia e gestor podem ser trabalhados independentemente após a base visual.

Os números identificam os prompts; não representam dependências obrigatórias. Ao terminar uma tela, mantenha um registro no arquivo de andamento. Execute a etapa 32 ao concluir o conjunto.

## Contrato comum obrigatório para todos os prompts

### Projeto e escopo

- Trabalhe em `C:\Users\pedro\OneDrive\Desktop\Nova pasta\obrasyncsupabase`. Não implemente em `obrasync-main`, que é outra cópia.
- Leia instruções locais aplicáveis, a tela, seus estilos, componentes, contexto, navegação e serviços relacionados antes de editar. O inventário é um ponto de partida: confirme o estado atual.
- O objetivo é mudar o visual e a usabilidade das funções existentes. Preserve regras de negócio, permissões, contratos, cálculos, dados e navegação. Não remova funcionalidades para simplificar o layout.
- Trabalhamos somente com insumos materiais. Não adicione mão de obra, serviços ou equipamentos como novos tipos de insumo. Não apague registros legados para cumprir uma alteração visual.
- Comparação entre orçamento e compra real é uma etapa futura: não a implemente nem invente dados para demonstrá-la.
- Não altere banco, SQL, RLS, autenticação, credenciais ou arquivos .env. Não publique nem faça push. Não substitua mudanças locais de outras etapas.
- Não atualize SDK/dependências por conveniência. A base foi atualizada para Expo SDK 58; confirme as versões atuais. Prefira bibliotecas já instaladas.
- Antes de construir controles, verifique se existe operação real por trás. Documente lacunas encontradas; não simule sucesso, persistência, envio ou aprovação.

### Identidade visual e direção

- Consulte a identidade original em `../obrasync-main/IdentidadeVisualPlanengen`, incluindo manual e aplicações. O nome real da pasta deve ser verificado se ela tiver sido movida.
- Paleta da marca: azul-marinho #010028, azul #0084F4, cinza-claro #EEF0F2 e cinza-escuro #202020. Use branco para superfícies quando necessário e cores semânticas acessíveis para erros/alertas/sucesso.
- Use a logo original sem redesenhar, distorcer ou recortar: asset otimizado em `src/assets/brand/planengen-light.png`. Escolha fundo que garanta contraste.
- Referência implementada: `LoginScreen.js`, `LoginScreen.styles.js` e `docs/LOGIN_PLANENGEN.md`. A home do solicitante tem layout previamente aprovado; harmonize sem perder os fluxos.
- Linguagem visual sóbria de engenharia: hierarquia clara, espaços consistentes, superfícies leves, ícones da biblioteca existente, detalhes arquitetônicos discretos. Evite excesso de cartões decorativos e heróis grandes que escondam a tarefa.
- Não introduza fontes de avaliação sem licença/arquivos disponíveis. Use fontes nativas até haver fonte licenciada fornecida.
- Centralize cores, espaçamento e padrões compartilhados no sistema existente, preservando alto contraste e texto ampliado. Não espalhe valores novos e estilos divergentes por todas as telas.

### Mobile, acesso e navegação

- React Native/Expo para Android e iOS; não entregue uma página HTML como implementação.
- Preserve os cinco perfis: MASTER, ENGINEERING, PURCHASING, REQUESTER e CLIENT. Interface não substitui autorização do servidor; cliente permanece limitado às consultas permitidas.
- Preserve o isolamento por empresa e o contexto da obra. O catálogo compartilhado não deve depender da criação de uma nova empresa para ficar disponível aos usuários autorizados.
- Navegação própria em `src/navigation`: não migre para outro navegador. Confira registry, routes, AppNavigator e hook de navegação.
- Telas internas precisam de retorno funcional conforme o padrão existente. Não duplique cabeçalhos nem barras inferiores. Teste os caminhos de entrada alternativos.
- Considere safe areas, notch, teclado, botão Voltar do Android e rolagem. A ação principal não pode ficar inacessível sob teclado/barra inferior.
- Avalie larguras de 320, 390 e 430 pontos, textos longos e fonte ampliada. Evite alturas rígidas que cortem conteúdo; use alvos de toque confortáveis de aproximadamente 44–48 pontos.
- Use labels de acessibilidade, estados selecionado/desabilitado, ordem de foco coerente e informação que não dependa apenas de cor. Respeite movimento reduzido.
- Cubra carregamento, vazio, erro, sucesso real e bloqueio por permissão onde aplicável. Evite submissão duplicada.

### Dados e limites conhecidos

- Materiais usa catálogo compartilhado, busca, filtros e paginação. Na preparação deste guia havia 134 linhas importadas, das quais 89 eram materiais elegíveis. Não fixe essas contagens na interface; os dados podem mudar.
- Referência de catálogo, estoque, orçamento, cotação e compra são conceitos distintos. Preserve unidades, origem e significado dos preços.
- Parte dos fluxos operacionais ainda usa estado local/demonstração; outras partes usam Supabase. Inspecione cada operação antes de escrever mensagens de sincronização ou salvamento.
- Orçamentos e cotações têm contratos e cálculos existentes. Redesign não autoriza modificar fórmulas, RPCs ou formatos de persistência.
- Aprovações usa tela genérica com conteúdo demonstrativo. Cadastro adicional de empresa possui limitações. Não trate essas lacunas como autorização para ampliar o projeto.

### Entrega e verificação de cada etapa

- Implemente a tela solicitada; não pare em uma proposta textual. Limite alterações relacionadas ao necessário e registre impactos de componentes compartilhados.
- Execute verificações proporcionais à mudança e scripts relevantes disponíveis. Para mudanças amplas/compartilhadas, use os scripts de teste e exportação iOS/Android existentes, consultando package.json.
- Inspecione visualmente quando houver ambiente de preview disponível. Um bundle exportado comprova compilação, não execução em aparelho. Declare o que foi e o que não foi testado.
- Não adicione testes que apenas repetem estilos. Verifique comportamentos relevantes: navegação, validação, permissões e regressões do fluxo tocado.
- Atualize `docs/ANDAMENTO_REDESIGN.md` (crie se não existir) com etapa, arquivos, decisões visuais, verificações executadas, limitações e próximo passo. Não registre segredos.
- Ao concluir, informe de forma curta o que mudou, arquivos, validação e pendências. Não afirme que todas as telas foram concluídas ao finalizar apenas uma.

## 00 — Base visual compartilhada

```text
No projeto obrasyncsupabase, leia e siga o contrato comum de docs/PROMPTS_REDESIGN_TELAS.md.
Prepare a base visual Planengen para redesenhar as telas gradualmente.
Inspecione src/theme, componentes de layout/ui/formulários, navegação e a nova tela de login.
Defina tokens coerentes de cores, tipografia, espaçamento, bordas e estados, preservando as preferências de acessibilidade.
Aproveite componentes existentes para cabeçalho com voltar, botões, campos, cartões, mensagens e carregamento. Crie abstrações apenas quando houver uso concreto.
Não reescreva todas as telas nesta etapa. Alterações globais de tema devem ser avaliadas nas telas que já o consomem, especialmente contraste de texto/ícones.
Registre a convenção em docs/DESIGN_SYSTEM_PLANENGEN.md e o andamento em docs/ANDAMENTO_REDESIGN.md.
Verifique login, home do solicitante, uma lista e um formulário como amostra. Preserve regras de negócio e navegação.
```

## 01 — Login e cadastro inicial

Arquivo principal: `src/screens/LoginScreen.js` e estilos/componentes utilizados.

```text
No projeto obrasyncsupabase, leia e siga o contrato comum de docs/PROMPTS_REDESIGN_TELAS.md, o design system e o andamento existentes.
Implemente o redesign de login e cadastro inicial, começando por src/screens/LoginScreen.js e suas dependências. Trabalhe apenas nesta tela e nos ajustes compartilhados indispensáveis.
Organize entrada, seleção de perfil, email, senha, ajuda e cadastro inicial em uma experiência clara. Esta tela já recebeu a identidade Planengen: refine a implementação atual, sem descartar seu trabalho.
Preserve os cinco perfis, mostrar/ocultar senha, validações, estados de envio, login e registerCompany. Mantenha os campos do cadastro e a confirmação. O perfil escolhido não concede permissões. Não crie recuperação de senha fictícia.
Inclua os estados e subfluxos existentes desta tela, como modais e formulários internos. Preserve a experiência Android e iOS, acessibilidade e retorno.
Valide os comportamentos afetados, registre evidências e limitações em docs/ANDAMENTO_REDESIGN.md e entregue um resumo dos arquivos alterados.
```

## 02 — Início do solicitante

Arquivo principal: `src/screens/RequesterHomeScreen.js` e estilos/componentes utilizados.

```text
No projeto obrasyncsupabase, leia e siga o contrato comum de docs/PROMPTS_REDESIGN_TELAS.md, o design system e o andamento existentes.
Implemente o redesign de início do solicitante, começando por src/screens/RequesterHomeScreen.js e suas dependências. Trabalhe apenas nesta tela e nos ajustes compartilhados indispensáveis.
Priorize obra ativa, ações de solicitar materiais, obras e insumos, indicadores e Atenção hoje. Harmonize o layout já aprovado com a marca; mantenha a logo Planengen e a leitura rápida em campo.
Preserve seleção de obra, destinos dos atalhos, busca, atualização e dados existentes. Ver todas deve abrir Alertas, com retorno funcional. A seta de voltar ao topo só aparece após rolar para baixo e respeita movimento reduzido. Evite cabeçalho e navegação inferior duplicados.
Inclua os estados e subfluxos existentes desta tela, como modais e formulários internos. Preserve a experiência Android e iOS, acessibilidade e retorno.
Valide os comportamentos afetados, registre evidências e limitações em docs/ANDAMENTO_REDESIGN.md e entregue um resumo dos arquivos alterados.
```

## 03 — Início da engenharia

Arquivo principal: `src/screens/EngineeringHomeScreen.js` e estilos/componentes utilizados.

```text
No projeto obrasyncsupabase, leia e siga o contrato comum de docs/PROMPTS_REDESIGN_TELAS.md, o design system e o andamento existentes.
Implemente o redesign de início da engenharia, começando por src/screens/EngineeringHomeScreen.js e suas dependências. Trabalhe apenas nesta tela e nos ajustes compartilhados indispensáveis.
Crie uma visão de trabalho para engenharia: contexto da obra, orçamento, insumos e ações já disponíveis, com hierarquia clara entre resumo e tarefas.
Inventarie os atalhos reais antes de desenhar. Preserve seleção de obra, navegação, permissões e origem dos indicadores. Não acrescente gráficos ou comparações sem dados disponíveis.
Inclua os estados e subfluxos existentes desta tela, como modais e formulários internos. Preserve a experiência Android e iOS, acessibilidade e retorno.
Valide os comportamentos afetados, registre evidências e limitações em docs/ANDAMENTO_REDESIGN.md e entregue um resumo dos arquivos alterados.
```

## 04 — Painel do gestor

Arquivo principal: `src/screens/MasterPanelScreen.js` e estilos/componentes utilizados.

```text
No projeto obrasyncsupabase, leia e siga o contrato comum de docs/PROMPTS_REDESIGN_TELAS.md, o design system e o andamento existentes.
Implemente o redesign de painel do gestor, começando por src/screens/MasterPanelScreen.js e suas dependências. Trabalhe apenas nesta tela e nos ajustes compartilhados indispensáveis.
Organize gestão da empresa, equipe, obras e catálogo de insumos em grupos claros, com resumo compacto e atalhos consistentes.
Preserve o acesso aos insumos e as operações exclusivas do MASTER. Use apenas contagens e estados disponíveis. Não exponha empresas ou usuários fora do escopo permitido.
Inclua os estados e subfluxos existentes desta tela, como modais e formulários internos. Preserve a experiência Android e iOS, acessibilidade e retorno.
Valide os comportamentos afetados, registre evidências e limitações em docs/ANDAMENTO_REDESIGN.md e entregue um resumo dos arquivos alterados.
```

## 05 — Início compartilhado: compras e cliente

Arquivo principal: `src/screens/HomeScreen.js` e estilos/componentes utilizados.

```text
No projeto obrasyncsupabase, leia e siga o contrato comum de docs/PROMPTS_REDESIGN_TELAS.md, o design system e o andamento existentes.
Implemente o redesign de início compartilhado: compras e cliente, começando por src/screens/HomeScreen.js e suas dependências. Trabalhe apenas nesta tela e nos ajustes compartilhados indispensáveis.
Redesenhe a tela compartilhada considerando separadamente os perfis Compras/Almoxarifado e Consulta/Cliente. Use componentes comuns, mas priorize ações adequadas a cada perfil.
Verifique no navegador quais perfis usam esta tela. Preserve todos os destinos permitidos. Cliente continua com consulta, sem botões de mutação. Não altere as homes específicas do gestor, engenharia e solicitante por acidente.
Inclua os estados e subfluxos existentes desta tela, como modais e formulários internos. Preserve a experiência Android e iOS, acessibilidade e retorno.
Valide os comportamentos afetados, registre evidências e limitações em docs/ANDAMENTO_REDESIGN.md e entregue um resumo dos arquivos alterados.
```

## 06 — Obras

Arquivo principal: `src/screens/ProjectsScreen.js` e estilos/componentes utilizados.

```text
No projeto obrasyncsupabase, leia e siga o contrato comum de docs/PROMPTS_REDESIGN_TELAS.md, o design system e o andamento existentes.
Implemente o redesign de obras, começando por src/screens/ProjectsScreen.js e suas dependências. Trabalhe apenas nesta tela e nos ajustes compartilhados indispensáveis.
Melhore listagem, busca e seleção de obras e todos os formulários ou painéis de obra que já existirem dentro deste componente. Use cartões compactos com informação relevante.
Mantenha dados e ações reais, seleção ativa e vínculos por empresa. Diferencie selectProject, que pode navegar, de chooseProject, usado em formulários. Não acrescente percentuais ou status artificiais.
Inclua os estados e subfluxos existentes desta tela, como modais e formulários internos. Preserve a experiência Android e iOS, acessibilidade e retorno.
Valide os comportamentos afetados, registre evidências e limitações em docs/ANDAMENTO_REDESIGN.md e entregue um resumo dos arquivos alterados.
```

## 07 — Catálogo de insumos

Arquivo principal: `src/screens/MaterialsScreen.js` e estilos/componentes utilizados.

```text
No projeto obrasyncsupabase, leia e siga o contrato comum de docs/PROMPTS_REDESIGN_TELAS.md, o design system e o andamento existentes.
Implemente o redesign de catálogo de insumos, começando por src/screens/MaterialsScreen.js e suas dependências. Trabalhe apenas nesta tela e nos ajustes compartilhados indispensáveis.
Crie uma experiência de catálogo com busca destacada, filtros organizados, linhas legíveis e detalhes expansíveis para código, unidade, preço e referência disponíveis.
Preserve paginação, busca sem acentos, filtros, estados de carregamento/erro/vazio e catálogo compartilhado entre empresas atuais e futuras. Exiba somente materiais. Não dependa de obra selecionada para consultar o catálogo; preserve a restrição do atalho de estoque por perfil e obra. Não transforme preço de referência em preço de compra real.
Inclua os estados e subfluxos existentes desta tela, como modais e formulários internos. Preserve a experiência Android e iOS, acessibilidade e retorno.
Valide os comportamentos afetados, registre evidências e limitações em docs/ANDAMENTO_REDESIGN.md e entregue um resumo dos arquivos alterados.
```

## 08 — Orçamentos

Arquivo principal: `src/screens/BudgetScreen.js` e estilos/componentes utilizados.

```text
No projeto obrasyncsupabase, leia e siga o contrato comum de docs/PROMPTS_REDESIGN_TELAS.md, o design system e o andamento existentes.
Implemente o redesign de orçamentos, começando por src/screens/BudgetScreen.js e suas dependências. Trabalhe apenas nesta tela e nos ajustes compartilhados indispensáveis.
Melhore consulta de orçamento, seleção de obra, itens, totais, BDI e ações existentes. Dê destaque ao total sem esconder sua composição.
Preserve os componentes de edição e os cálculos existentes, arredondamento, permissões e exportações que a tela realmente oferecer. Não implemente agora comparação entre orçamento e compra real nem invente valores realizados.
Inclua os estados e subfluxos existentes desta tela, como modais e formulários internos. Preserve a experiência Android e iOS, acessibilidade e retorno.
Valide os comportamentos afetados, registre evidências e limitações em docs/ANDAMENTO_REDESIGN.md e entregue um resumo dos arquivos alterados.
```

## 09 — Criação de orçamento

Arquivo principal: `src/screens/CreateBudgetScreen.js` e estilos/componentes utilizados.

```text
No projeto obrasyncsupabase, leia e siga o contrato comum de docs/PROMPTS_REDESIGN_TELAS.md, o design system e o andamento existentes.
Implemente o redesign de criação de orçamento, começando por src/screens/CreateBudgetScreen.js e suas dependências. Trabalhe apenas nesta tela e nos ajustes compartilhados indispensáveis.
Reorganize o formulário em blocos: contexto, itens de materiais, BDI e revisão. Facilite preencher várias linhas no celular e revisar o total antes de salvar.
Preserve validações, persistência e distinção entre insumo do catálogo compartilhado e insumo próprio da empresa. Não altere fórmulas, IDs, campos de BDI ou regras de arredondamento. Insumos manuais continuam limitados aos perfis autorizados. Nenhuma opção de mão de obra ou serviço.
Inclua os estados e subfluxos existentes desta tela, como modais e formulários internos. Preserve a experiência Android e iOS, acessibilidade e retorno.
Valide os comportamentos afetados, registre evidências e limitações em docs/ANDAMENTO_REDESIGN.md e entregue um resumo dos arquivos alterados.
```

## 10 — Custos

Arquivo principal: `src/screens/CostsScreen.js` e estilos/componentes utilizados.

```text
No projeto obrasyncsupabase, leia e siga o contrato comum de docs/PROMPTS_REDESIGN_TELAS.md, o design system e o andamento existentes.
Implemente o redesign de custos, começando por src/screens/CostsScreen.js e suas dependências. Trabalhe apenas nesta tela e nos ajustes compartilhados indispensáveis.
Melhore leitura dos custos existentes e acesso aos lançamentos, com valores bem alinhados, filtros e resumos apenas quando já suportados.
Inspecione a origem dos dados e preserve operações reais. Não confunda orçamento, despesa e compra. Não introduza comparação financeira nova, dados fictícios ou categorias de mão de obra/serviços. Registre incompatibilidades legadas encontradas sem excluir dados.
Inclua os estados e subfluxos existentes desta tela, como modais e formulários internos. Preserve a experiência Android e iOS, acessibilidade e retorno.
Valide os comportamentos afetados, registre evidências e limitações em docs/ANDAMENTO_REDESIGN.md e entregue um resumo dos arquivos alterados.
```

## 11 — Lançamento de despesa

Arquivo principal: `src/screens/AddExpenseScreen.js` e estilos/componentes utilizados.

```text
No projeto obrasyncsupabase, leia e siga o contrato comum de docs/PROMPTS_REDESIGN_TELAS.md, o design system e o andamento existentes.
Implemente o redesign de lançamento de despesa, começando por src/screens/AddExpenseScreen.js e suas dependências. Trabalhe apenas nesta tela e nos ajustes compartilhados indispensáveis.
Simplifique preenchimento dos campos existentes, destacando valor, contexto da obra, descrição e demais informações realmente suportadas. Garanta teclado e ação de salvar acessíveis.
Preserve tipos, validações, datas, tratamento decimal brasileiro, vínculo com obra e comportamento de gravação. Restrinja novas opções ao escopo de materiais sem apagar registros existentes. Não apresente salvamento local como persistência no Supabase.
Inclua os estados e subfluxos existentes desta tela, como modais e formulários internos. Preserve a experiência Android e iOS, acessibilidade e retorno.
Valide os comportamentos afetados, registre evidências e limitações em docs/ANDAMENTO_REDESIGN.md e entregue um resumo dos arquivos alterados.
```

## 12 — Solicitação de materiais

Arquivo principal: `src/screens/RequestMaterialScreen.js` e estilos/componentes utilizados.

```text
No projeto obrasyncsupabase, leia e siga o contrato comum de docs/PROMPTS_REDESIGN_TELAS.md, o design system e o andamento existentes.
Implemente o redesign de solicitação de materiais, começando por src/screens/RequestMaterialScreen.js e suas dependências. Trabalhe apenas nesta tela e nos ajustes compartilhados indispensáveis.
Projete um formulário claro para solicitar materiais, com identificação da obra, itens, quantidades e demais campos existentes. Mantenha uma revisão legível antes do envio.
Preserve seleção de materiais, unidades, validações, permissões e comportamento offline existente. Diferencie pendência local de envio confirmado. Não prometa sincronização remota sem comprovação no código.
Inclua os estados e subfluxos existentes desta tela, como modais e formulários internos. Preserve a experiência Android e iOS, acessibilidade e retorno.
Valide os comportamentos afetados, registre evidências e limitações em docs/ANDAMENTO_REDESIGN.md e entregue um resumo dos arquivos alterados.
```

## 13 — Lista de cotações

Arquivo principal: `src/screens/QuotesScreen.js` e estilos/componentes utilizados.

```text
No projeto obrasyncsupabase, leia e siga o contrato comum de docs/PROMPTS_REDESIGN_TELAS.md, o design system e o andamento existentes.
Implemente o redesign de lista de cotações, começando por src/screens/QuotesScreen.js e suas dependências. Trabalhe apenas nesta tela e nos ajustes compartilhados indispensáveis.
Melhore listagem e resumo de cotações, identificação de fornecedor, validade, valores e acesso à criação conforme dados disponíveis.
Preserve carregamento por obra, estados vazios/erro, detalhes e ações existentes. Não crie aprovação, envio para fornecedor ou seleção de vencedora se esses fluxos não existirem.
Inclua os estados e subfluxos existentes desta tela, como modais e formulários internos. Preserve a experiência Android e iOS, acessibilidade e retorno.
Valide os comportamentos afetados, registre evidências e limitações em docs/ANDAMENTO_REDESIGN.md e entregue um resumo dos arquivos alterados.
```

## 14 — Criação de cotação

Arquivo principal: `src/screens/CreateQuoteScreen.js` e estilos/componentes utilizados.

```text
No projeto obrasyncsupabase, leia e siga o contrato comum de docs/PROMPTS_REDESIGN_TELAS.md, o design system e o andamento existentes.
Implemente o redesign de criação de cotação, começando por src/screens/CreateQuoteScreen.js e suas dependências. Trabalhe apenas nesta tela e nos ajustes compartilhados indispensáveis.
Organize dados gerais, fornecedor, validade e itens de materiais em seções claras. Use editor de itens confortável no celular e resumo de total.
Preserve validações, payload, RPC e formato de metadados existentes. Mantenha salvamento transacional e tratamento de falhas. Não altere contratos de serviços nem introduza mão de obra ou serviços.
Inclua os estados e subfluxos existentes desta tela, como modais e formulários internos. Preserve a experiência Android e iOS, acessibilidade e retorno.
Valide os comportamentos afetados, registre evidências e limitações em docs/ANDAMENTO_REDESIGN.md e entregue um resumo dos arquivos alterados.
```

## 15 — Compras e pedidos

Arquivo principal: `src/screens/PurchasesScreen.js` e estilos/componentes utilizados.

```text
No projeto obrasyncsupabase, leia e siga o contrato comum de docs/PROMPTS_REDESIGN_TELAS.md, o design system e o andamento existentes.
Implemente o redesign de compras e pedidos, começando por src/screens/PurchasesScreen.js e suas dependências. Trabalhe apenas nesta tela e nos ajustes compartilhados indispensáveis.
Redesenhe lista, detalhes e controles existentes de compras/pedidos, com status legíveis e valores alinhados. Cubra os dois acessos que usam esta tela.
As rotas PURCHASES e ORDERS compartilham este componente: verifique ambas. Preserve criação/consulta e permissões existentes, sem presumir persistência remota. Não invente integração com fornecedores, aprovações ou baixa automática.
Inclua os estados e subfluxos existentes desta tela, como modais e formulários internos. Preserve a experiência Android e iOS, acessibilidade e retorno.
Valide os comportamentos afetados, registre evidências e limitações em docs/ANDAMENTO_REDESIGN.md e entregue um resumo dos arquivos alterados.
```

## 16 — Recebimento

Arquivo principal: `src/screens/ReceiptScreen.js` e estilos/componentes utilizados.

```text
No projeto obrasyncsupabase, leia e siga o contrato comum de docs/PROMPTS_REDESIGN_TELAS.md, o design system e o andamento existentes.
Implemente o redesign de recebimento, começando por src/screens/ReceiptScreen.js e suas dependências. Trabalhe apenas nesta tela e nos ajustes compartilhados indispensáveis.
Organize conferência e registro do recebimento de materiais com identificação, quantidades e ações existentes, incluindo scanner se já conectado.
Preserve validações e efeitos reais sobre o estado. Diferencie quantidade solicitada, recebida e saldo apenas quando os dados suportarem. Não simule recebimento confirmado ou integração com estoque remoto.
Inclua os estados e subfluxos existentes desta tela, como modais e formulários internos. Preserve a experiência Android e iOS, acessibilidade e retorno.
Valide os comportamentos afetados, registre evidências e limitações em docs/ANDAMENTO_REDESIGN.md e entregue um resumo dos arquivos alterados.
```

## 17 — Estoque

Arquivo principal: `src/screens/StockScreen.js` e estilos/componentes utilizados.

```text
No projeto obrasyncsupabase, leia e siga o contrato comum de docs/PROMPTS_REDESIGN_TELAS.md, o design system e o andamento existentes.
Implemente o redesign de estoque, começando por src/screens/StockScreen.js e suas dependências. Trabalhe apenas nesta tela e nos ajustes compartilhados indispensáveis.
Crie uma listagem de estoque fácil de consultar em campo, destacando material, código, unidade, saldo e localização quando disponíveis. Preserve busca e atalhos reais.
Não confunda catálogo de referência com estoque físico. Preserve escopo da obra, permissões, movimentos e estados existentes. Não crie alertas de estoque mínimo sem regra implementada.
Inclua os estados e subfluxos existentes desta tela, como modais e formulários internos. Preserve a experiência Android e iOS, acessibilidade e retorno.
Valide os comportamentos afetados, registre evidências e limitações em docs/ANDAMENTO_REDESIGN.md e entregue um resumo dos arquivos alterados.
```

## 18 — Transferências

Arquivo principal: `src/screens/TransfersScreen.js` e estilos/componentes utilizados.

```text
No projeto obrasyncsupabase, leia e siga o contrato comum de docs/PROMPTS_REDESIGN_TELAS.md, o design system e o andamento existentes.
Implemente o redesign de transferências, começando por src/screens/TransfersScreen.js e suas dependências. Trabalhe apenas nesta tela e nos ajustes compartilhados indispensáveis.
Melhore o formulário de saída/transferência, mostrando o material encontrado, saldo disponível, quantidade e destino com confirmação visual clara.
Preserve busca pelo código, quantidade positiva, bloqueio por saldo insuficiente e destino obrigatório. A implementação atual registra movimento OUT local: não apresente transferência entre duas obras ou atualização remota como concluída sem suporte.
Inclua os estados e subfluxos existentes desta tela, como modais e formulários internos. Preserve a experiência Android e iOS, acessibilidade e retorno.
Valide os comportamentos afetados, registre evidências e limitações em docs/ANDAMENTO_REDESIGN.md e entregue um resumo dos arquivos alterados.
```

## 19 — Scanner

Arquivo principal: `src/screens/ScannerScreen.js` e estilos/componentes utilizados.

```text
No projeto obrasyncsupabase, leia e siga o contrato comum de docs/PROMPTS_REDESIGN_TELAS.md, o design system e o andamento existentes.
Implemente o redesign de scanner, começando por src/screens/ScannerScreen.js e suas dependências. Trabalhe apenas nesta tela e nos ajustes compartilhados indispensáveis.
Refine a experiência de leitura de QR/código, com enquadramento, instrução curta, estados de permissão e resultado claros. Preserve ações existentes.
Mantenha câmera, permissões, tratamento de código inválido, prevenção de leitura repetida e destino do resultado. Teste também permissão negada e retorno. Não use uma câmera simulada como evidência de funcionamento nativo.
Inclua os estados e subfluxos existentes desta tela, como modais e formulários internos. Preserve a experiência Android e iOS, acessibilidade e retorno.
Valide os comportamentos afetados, registre evidências e limitações em docs/ANDAMENTO_REDESIGN.md e entregue um resumo dos arquivos alterados.
```

## 20 — Etiquetas QR

Arquivo principal: `src/screens/LabelScreen.js` e estilos/componentes utilizados.

```text
No projeto obrasyncsupabase, leia e siga o contrato comum de docs/PROMPTS_REDESIGN_TELAS.md, o design system e o andamento existentes.
Implemente o redesign de etiquetas qr, começando por src/screens/LabelScreen.js e suas dependências. Trabalhe apenas nesta tela e nos ajustes compartilhados indispensáveis.
Organize seleção do material, prévia da etiqueta, geração do QR e ações Imprimir/Compartilhar PDF. Preserve área branca e contraste do QR.
Mantenha payload, geração de base64, espera até QR pronto, estados busy, serviços de impressão e compartilhamento. Não altere contratos do scanner. Preserve aviso verdadeiro sobre dados locais/demonstrativos e trate ausência de material/obra.
Inclua os estados e subfluxos existentes desta tela, como modais e formulários internos. Preserve a experiência Android e iOS, acessibilidade e retorno.
Valide os comportamentos afetados, registre evidências e limitações em docs/ANDAMENTO_REDESIGN.md e entregue um resumo dos arquivos alterados.
```

## 21 — Relatórios

Arquivo principal: `src/screens/ReportsScreen.js` e estilos/componentes utilizados.

```text
No projeto obrasyncsupabase, leia e siga o contrato comum de docs/PROMPTS_REDESIGN_TELAS.md, o design system e o andamento existentes.
Implemente o redesign de relatórios, começando por src/screens/ReportsScreen.js e suas dependências. Trabalhe apenas nesta tela e nos ajustes compartilhados indispensáveis.
Redesenhe seleção dos relatórios e ações de exportação, deixando claro qual obra e quais dados serão utilizados. Use estados de geração e falha legíveis.
Preserve exportações reais PDF/Excel, filtros e permissões. Não altere totais, colunas ou fontes dos dados como efeito colateral visual. Não adicione relatórios sem implementação.
Inclua os estados e subfluxos existentes desta tela, como modais e formulários internos. Preserve a experiência Android e iOS, acessibilidade e retorno.
Valide os comportamentos afetados, registre evidências e limitações em docs/ANDAMENTO_REDESIGN.md e entregue um resumo dos arquivos alterados.
```

## 22 — Alertas

Arquivo principal: `src/screens/AlertsScreen.js` e estilos/componentes utilizados.

```text
No projeto obrasyncsupabase, leia e siga o contrato comum de docs/PROMPTS_REDESIGN_TELAS.md, o design system e o andamento existentes.
Implemente o redesign de alertas, começando por src/screens/AlertsScreen.js e suas dependências. Trabalhe apenas nesta tela e nos ajustes compartilhados indispensáveis.
Melhore hierarquia da lista, prioridade e contexto de cada alerta existente. Use cor acompanhada de ícone/texto e mantenha ações claras.
Mantenha seta de voltar visível no cabeçalho, inclusive ao entrar por Ver todas do solicitante. Preserve destinos e dados existentes. Não invente notificações push, marcação como lido ou contagens.
Inclua os estados e subfluxos existentes desta tela, como modais e formulários internos. Preserve a experiência Android e iOS, acessibilidade e retorno.
Valide os comportamentos afetados, registre evidências e limitações em docs/ANDAMENTO_REDESIGN.md e entregue um resumo dos arquivos alterados.
```

## 23 — Aprovações e tela genérica

Arquivo principal: `src/screens/FeatureScreen.js` e estilos/componentes utilizados.

```text
No projeto obrasyncsupabase, leia e siga o contrato comum de docs/PROMPTS_REDESIGN_TELAS.md, o design system e o andamento existentes.
Implemente o redesign de aprovações e tela genérica, começando por src/screens/FeatureScreen.js e suas dependências. Trabalhe apenas nesta tela e nos ajustes compartilhados indispensáveis.
Inspecione as rotas e configurações que ainda usam FeatureScreen e redesenhe seus estados, especialmente Aprovações. Torne conteúdo demonstrativo identificável e leitura consistente.
A rota APPROVALS usa esta tela e há configurações legadas em featureData. Não apresente exemplos fixos como pedidos reais. Não crie botões que aparentem aprovar/rejeitar sem operação existente. Preserve outras utilizações encontradas e registre o que continua demonstrativo.
Inclua os estados e subfluxos existentes desta tela, como modais e formulários internos. Preserve a experiência Android e iOS, acessibilidade e retorno.
Valide os comportamentos afetados, registre evidências e limitações em docs/ANDAMENTO_REDESIGN.md e entregue um resumo dos arquivos alterados.
```

## 24 — Empresas

Arquivo principal: `src/screens/CompaniesScreen.js` e estilos/componentes utilizados.

```text
No projeto obrasyncsupabase, leia e siga o contrato comum de docs/PROMPTS_REDESIGN_TELAS.md, o design system e o andamento existentes.
Implemente o redesign de empresas, começando por src/screens/CompaniesScreen.js e suas dependências. Trabalhe apenas nesta tela e nos ajustes compartilhados indispensáveis.
Melhore consulta das empresas permitidas, identificação da empresa ativa e ações já disponíveis. Use informações e estados reais.
Preserve isolamento entre empresas e permissões do gestor. Verifique se cadastro/seleção está de fato implementado antes de desenhar uma ação como disponível. Não amplie acesso a outras empresas.
Inclua os estados e subfluxos existentes desta tela, como modais e formulários internos. Preserve a experiência Android e iOS, acessibilidade e retorno.
Valide os comportamentos afetados, registre evidências e limitações em docs/ANDAMENTO_REDESIGN.md e entregue um resumo dos arquivos alterados.
```

## 25 — Cadastro de empresa

Arquivo principal: `src/screens/CreateCompanyScreen.js` e estilos/componentes utilizados.

```text
No projeto obrasyncsupabase, leia e siga o contrato comum de docs/PROMPTS_REDESIGN_TELAS.md, o design system e o andamento existentes.
Implemente o redesign de cadastro de empresa, começando por src/screens/CreateCompanyScreen.js e suas dependências. Trabalhe apenas nesta tela e nos ajustes compartilhados indispensáveis.
Reorganize os campos e orientações existentes em um formulário claro, com validação próxima ao campo e estado de envio.
Verifique a implementação de createCompany: existem limitações relacionadas à empresa criada no cadastro inicial. Não finja sucesso nem remova bloqueios do serviço. Se a operação não for suportada, apresente essa limitação honestamente e reporte a dependência sem implementar backend neste redesign.
Inclua os estados e subfluxos existentes desta tela, como modais e formulários internos. Preserve a experiência Android e iOS, acessibilidade e retorno.
Valide os comportamentos afetados, registre evidências e limitações em docs/ANDAMENTO_REDESIGN.md e entregue um resumo dos arquivos alterados.
```

## 26 — Cadastro de membro

Arquivo principal: `src/screens/CreateMemberScreen.js` e estilos/componentes utilizados.

```text
No projeto obrasyncsupabase, leia e siga o contrato comum de docs/PROMPTS_REDESIGN_TELAS.md, o design system e o andamento existentes.
Implemente o redesign de cadastro de membro, começando por src/screens/CreateMemberScreen.js e suas dependências. Trabalhe apenas nesta tela e nos ajustes compartilhados indispensáveis.
Melhore cadastro da equipe e seleção de perfil, explicando sucintamente o acesso correspondente. Destaque campos obrigatórios e confirmação real.
Preserve autorização MASTER, vínculo da empresa, roles, validações e fluxo atual de criação. Não exponha credenciais, gere permissões extras ou transforme sucesso local em conta remota criada.
Inclua os estados e subfluxos existentes desta tela, como modais e formulários internos. Preserve a experiência Android e iOS, acessibilidade e retorno.
Valide os comportamentos afetados, registre evidências e limitações em docs/ANDAMENTO_REDESIGN.md e entregue um resumo dos arquivos alterados.
```

## 27 — Equipe e permissões

Arquivo principal: `src/screens/CompanyPermissionsScreen.js` e estilos/componentes utilizados.

```text
No projeto obrasyncsupabase, leia e siga o contrato comum de docs/PROMPTS_REDESIGN_TELAS.md, o design system e o andamento existentes.
Implemente o redesign de equipe e permissões, começando por src/screens/CompanyPermissionsScreen.js e suas dependências. Trabalhe apenas nesta tela e nos ajustes compartilhados indispensáveis.
Organize dados da empresa, obra ativa, lista de membros e descrição dos perfis em seções fáceis de consultar. Preserve os atalhos autorizados.
Esta tela consulta membros e descreve permissões: não desenhe controles de edição de acesso que não existam. Preserve ações exclusivas MASTER e os textos alinhados a ROLE_ACCESS/ROLE_LABELS.
Inclua os estados e subfluxos existentes desta tela, como modais e formulários internos. Preserve a experiência Android e iOS, acessibilidade e retorno.
Valide os comportamentos afetados, registre evidências e limitações em docs/ANDAMENTO_REDESIGN.md e entregue um resumo dos arquivos alterados.
```

## 28 — Perfil e menu Mais

Arquivo principal: `src/screens/ProfileScreen.js` e estilos/componentes utilizados.

```text
No projeto obrasyncsupabase, leia e siga o contrato comum de docs/PROMPTS_REDESIGN_TELAS.md, o design system e o andamento existentes.
Implemente o redesign de perfil e menu mais, começando por src/screens/ProfileScreen.js e suas dependências. Trabalhe apenas nesta tela e nos ajustes compartilhados indispensáveis.
Melhore identificação do usuário, empresa, papel e agrupamento dos destinos disponíveis. Dê tratamento claro à saída da conta e demais ações reais.
Preserve destinos por perfil, logout e restrições. Não acrescente edição de dados, upload de foto ou troca de senha sem serviço implementado. Teste o acesso a partir das diferentes barras inferiores.
Inclua os estados e subfluxos existentes desta tela, como modais e formulários internos. Preserve a experiência Android e iOS, acessibilidade e retorno.
Valide os comportamentos afetados, registre evidências e limitações em docs/ANDAMENTO_REDESIGN.md e entregue um resumo dos arquivos alterados.
```

## 29 — Configurações

Arquivo principal: `src/screens/SettingsScreen.js` e estilos/componentes utilizados.

```text
No projeto obrasyncsupabase, leia e siga o contrato comum de docs/PROMPTS_REDESIGN_TELAS.md, o design system e o andamento existentes.
Implemente o redesign de configurações, começando por src/screens/SettingsScreen.js e suas dependências. Trabalhe apenas nesta tela e nos ajustes compartilhados indispensáveis.
Organize configurações, acessibilidade, cartilha e controles de demonstração em grupos legíveis. Diferencie preferências reais de simulações.
Preserve os controles existentes. Revise textos legados que dizem que todo o app é local: confira cada serviço e descreva corretamente o uso misto de Supabase e fluxos locais. Simular offline/sincronização não deve parecer sincronização real. Não implemente backend.
Inclua os estados e subfluxos existentes desta tela, como modais e formulários internos. Preserve a experiência Android e iOS, acessibilidade e retorno.
Valide os comportamentos afetados, registre evidências e limitações em docs/ANDAMENTO_REDESIGN.md e entregue um resumo dos arquivos alterados.
```

## 30 — Acessibilidade

Arquivo principal: `src/screens/AccessibilityScreen.js` e estilos/componentes utilizados.

```text
No projeto obrasyncsupabase, leia e siga o contrato comum de docs/PROMPTS_REDESIGN_TELAS.md, o design system e o andamento existentes.
Implemente o redesign de acessibilidade, começando por src/screens/AccessibilityScreen.js e suas dependências. Trabalhe apenas nesta tela e nos ajustes compartilhados indispensáveis.
Redesenhe as opções de acessibilidade com títulos claros, descrição curta e estado perceptível, usando os próprios ajustes durante a avaliação.
Preserve preferências e persistência existentes. Alto contraste, texto ampliado e movimento reduzido devem ser respeitados pela tela e pelos componentes compartilhados. Não prometa leitor de tela, vibração ou recursos que o código não implemente.
Inclua os estados e subfluxos existentes desta tela, como modais e formulários internos. Preserve a experiência Android e iOS, acessibilidade e retorno.
Valide os comportamentos afetados, registre evidências e limitações em docs/ANDAMENTO_REDESIGN.md e entregue um resumo dos arquivos alterados.
```

## 31 — Cartilha de uso

Arquivo principal: `src/screens/GuideScreen.js` e estilos/componentes utilizados.

```text
No projeto obrasyncsupabase, leia e siga o contrato comum de docs/PROMPTS_REDESIGN_TELAS.md, o design system e o andamento existentes.
Implemente o redesign de cartilha de uso, começando por src/screens/GuideScreen.js e suas dependências. Trabalhe apenas nesta tela e nos ajustes compartilhados indispensáveis.
Melhore a leitura da ajuda com seções curtas por tarefa/perfil e hierarquia visual consistente. Revise exemplos para o escopo de materiais.
Preserve conteúdo útil, retorno e referências aos fluxos disponíveis. Corrija instruções desatualizadas com base no código. Não descreva funcionalidades futuras como disponíveis nem acrescente links ou botões sem destino.
Inclua os estados e subfluxos existentes desta tela, como modais e formulários internos. Preserve a experiência Android e iOS, acessibilidade e retorno.
Valide os comportamentos afetados, registre evidências e limitações em docs/ANDAMENTO_REDESIGN.md e entregue um resumo dos arquivos alterados.
```

## 32 — Revisão integrada de todas as telas

```text
No projeto obrasyncsupabase, leia docs/PROMPTS_REDESIGN_TELAS.md, docs/DESIGN_SYSTEM_PLANENGEN.md e docs/ANDAMENTO_REDESIGN.md.
Faça a revisão integrada do redesign. Compare o inventário atual de src/screens com o registro de etapas e a navegação, incluindo modais, formulários internos e rotas que compartilham componentes.
Confira os cinco perfis, barras inferiores, cabeçalhos, retorno, seleção de obra, isolamento por empresa e restrições do cliente.
Padronize inconsistências visuais restantes sem alterar regras de negócio. Confira marca, legibilidade, estados vazios/erro/carregamento, texto ampliado, contraste, teclado e safe areas.
Verifique especialmente: retorno de Alertas por Ver todas; seta de topo ausente quando já no topo; catálogo apenas de materiais; totais/BDI intactos; mensagens honestas de operações locais.
Execute verificações pertinentes disponíveis, incluindo npm test, checagem de catálogo e exportações Android/iOS se os scripts ainda existirem. Faça inspeção visual e de navegação onde o ambiente permitir.
Não declare teste em aparelho sem realizá-lo. Registre defeitos e limitações remanescentes. Não publique, altere Supabase ou implemente a comparação financeira futura.
Atualize o andamento distinguindo concluído, parcialmente validado e pendente.
```

## Prompt de retomada quando uma conversa acabar

```text
Continue o redesign do ObraSync em obrasyncsupabase.
Leia docs/PROMPTS_REDESIGN_TELAS.md, docs/DESIGN_SYSTEM_PLANENGEN.md e docs/ANDAMENTO_REDESIGN.md, quando existirem, e confira o estado atual dos arquivos.
Retome a última etapa explicitamente registrada como em andamento, preservando alterações prontas. Se nenhuma estiver em andamento, execute a próxima etapa pendente indicada no registro.
Antes de editar, confira o que já está implementado para não repetir ou desfazer trabalho. Se não houver registro suficiente para identificar a etapa, peça apenas essa informação.
Siga o contrato comum, valide a parte alterada e atualize o registro com um ponto exato de retomada. Não avance para todas as telas de uma vez.
```

## Cobertura do inventário

Todos os 31 arquivos *Screen.js encontrados na preparação possuem um prompt acima.
Login inclui o cadastro inicial; formulários e modais internos pertencem ao prompt da sua tela.
PURCHASES e ORDERS são cobertos pelo prompt de compras. APPROVALS é coberto pela tela genérica.
As homes específicas e a home compartilhada estão contempladas separadamente.
Componentes globais e navegação são tratados na base visual e na revisão integrada.
Se novas telas forem adicionadas, atualize este inventário antes da revisão final.
