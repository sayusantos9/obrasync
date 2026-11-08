# Acessibilidade global — 06/11/2026

## Navegação com voz e Libras

A camada transparente que interceptava todos os gestos foi removida. Com voz ou Libras ativos:
- Arrastar continua rolando a tela normalmente.
- Toque curto continua acionando botões e opções.
- Segurar por 450 ms lê/traduz o texto ou o rótulo do botão; não executa a ação do botão.
- Mover o dedo mais de 10 pontos cancela a leitura de texto, permitindo rolagem.
- Leitura continua ativa entre telas. Desativar leitura encerra o modo; o avatar tem seu próprio botão de fechar.
- Campos editáveis preservam o comportamento de edição e não expõem seu valor ao tradutor.

Dois dedos e toque duplo não são reimplementados pelo app. Esses gestos pertencem ao TalkBack/VoiceOver; o painel explica como utilizá-los. A alternativa do app é toque prolongado, evitando uma camada que impeça a rolagem nativa.

## Gerenciador visual

Preferências são validadas por mergeAccessibility e persistidas no AsyncStorage já utilizado pelo AppContext. VisualSettingsContext fornece o estado a todas as telas e modais descendentes, inclusive antes do login.

Painel: seletor de perfis; categorias; grade adaptável (uma coluna abaixo de 350 px); ícones, descrições, estado e controles de intensidade; cores por paleta ou hexadecimal; restaurar cores ou todas as preferências.

Recursos: texto em quatro níveis; espaçamento de letras; altura de linhas; negrito; fonte do sistema; alinhamento; títulos e links destacados; contraste claro/escuro/inversão das cores da interface; saturação alta/baixa/monocromática; cores de texto/fundo/título; máscara e guia; redução de movimento; botões e áreas de toque ampliados; legendas existentes; silêncio dos anúncios automáticos (voz solicitada permanece); velocidade de voz; barra lateral; vibração e avisos.

Perfis: padrão, pessoa idosa, baixa visão, percepção de cores, foco, leitura/dislexia, ambiente calmo, leitura facilitada, facilidade de toque, sensibilidade visual. São combinações ajustáveis de preferências, não tratamento nem garantia para uma condição clínica. Selecionar um perfil limpa os ajustes anteriores.

Não há filtros aplicados a fotografias, logotipos ou avatar, nem escala global da árvore de layout. Cores são ajustadas em propriedades dos componentes. Fonte é ampliada uma única vez no componente de texto. O tamanho de layout de carrosséis considera ampliação sem modificar o visual padrão do painel Consulta/Cliente.

## Componentes para novas telas

Usar ReadableText para textos. Para View, TouchableOpacity, Pressable, TextInput, ScrollView, FlatList, Image, Modal, SafeAreaView e Ionicons, importar as variantes de AccessibleNative. Elas preservam refs, handlers, estado de desabilitado e propriedades originais.

Marcar títulos com accessibilityRole="header" e links com accessibilityRole="link". Dar accessibilityLabel às imagens e botões de ícone. Legendas só usam descrições fornecidas pelo app; não há geração automática. Campos sensíveis não devem aparecer em rótulos de botões.

## Limites explícitos

Não foram simulados recursos de IA, navegação facial, dicionário geral, tradução sem serviço, nem controle do sistema por voz. Cursor ampliado não se aplica ao uso por toque. A opção de fonte de leitura usa a fonte padrão do sistema, não uma fonte terapêutica. A inversão/saturação altera cores sólidas da interface, não fotografias, gradientes externos ou conteúdo do VLibras. Controles internos do VLibras mantêm as preferências do fornecedor.

## Validação

38 testes de domínio passaram, incluindo validação de preferências, perfis, reset, cores e tipografia. Teste de interação com React Native Web confirmou segurar para ler, toque curto para agir, rolagem com voz ativa, alteração de cores/fontes fora das configurações e restauração. Exportações Android e iOS verificadas. Verificação física de gestos, fontes máximas e leitor de tela no S25/iPhone ainda necessária.

## Correções de Libras, exportação e retorno — 06/11/2026

- Removido o aviso de leitura superior quando o avatar está aberto; tocar novamente no atalho ativo desativa a leitura.
- O widget oficial ocupa a área interna do painel; o texto de status fica oculto após o carregamento. Os controles externos de mover/minimizar/fechar ficam abaixo, separados do cabeçalho oficial.
- PDFs recebem base64 do expo-print e são gravados com await File.write no Paths.cache do projeto antes de compartilhar. Relatórios, documentos, orçamentos e etiquetas usam o mesmo serviço. A escrita XLSX também é aguardada antes do compartilhamento.
- Histórico de navegação armazena tela e aba, incluindo entradas feitas por selectTab. Voltar do catálogo retorna à origem; sem histórico, volta ao Início.
- Testes acrescentados para catálogo → estoque → voltar e origem de configuração/atalho; compartilhamento validado com escrita assíncrona e URI do cache, sem usar a URI restrita da impressão. O compartilhamento nativo ainda deve ser conferido no aparelho.
- Validação final desta correção: 40 testes passaram e exportações Android/iOS concluíram. O compartilhamento real via Android depende de teste no aparelho; o teste automatizado confirma bytes/base64, caminho de cache e ordem da escrita/compartilhamento.

## Scanner de QR — 06/11/2026

- Área da câmera com altura explícita de 440 pontos e sem flex dentro da tela rolável; prévia nativa e sobreposição não passam pelos ajustes globais de cor.
- Eventos onCameraReady/onMountError e timeout de inicialização mostram carregamento ou falha com Tentar novamente. Lanterna fica desabilitada até a câmera estar pronta.
- Câmera desmontada ao colocar o app em segundo plano e remontada ao retornar; permissão é consultada novamente ao retornar das configurações e lanterna é desligada.
- Quando canAskAgain=false, botão abre configurações; erros de solicitação são apresentados.
- Trava síncrona evita resultados duplicados de quadros consecutivos do scanner.
- 42 testes passaram. Prévia e leitura com câmera física ainda precisam ser verificadas no aparelho.

### Investigação adicional da prévia escura

Expo Camera ~58.0.14 é incluído no Expo Go (documentação oficial). O indicador de acesso e onCameraReady não comprovam que a prévia está visível.

A montagem agora aguarda onLayout do contêiner, usa largura medida e altura explícita no próprio CameraView em fluxo normal, sem depender de absoluteFill. Removido recorte arredondado/fundo opaco do contêiner de câmera; somente a moldura e os controles ficam na camada absoluta transparente. Adicionado Reiniciar câmera para remontar a sessão sem sair da tela. Esta é uma correção de composição/layout a confirmar no dispositivo; não foi comprovada falha exclusiva do Expo Go ou do S25.
