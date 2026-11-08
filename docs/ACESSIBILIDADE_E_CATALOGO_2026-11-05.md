# Catálogo e acessibilidade — 05/11/2026

## Catálogo publicado

500 itens ativos no Supabase: 495 materiais e 5 equipamentos. Foram mantidas 96 referências das fontes anteriores e adicionados 404 produtos do catálogo público da Telhanorte. A seleção cobre cimentos/argamassas, estrutura/alvenaria, hidráulica, esgoto, elétrica, fixadores, pintura, impermeabilização, revestimentos, cobertura, ferramentas/consumíveis e EPIs.

181 referências anteriores foram inativadas: duplicados identificados por código de origem/unidade ou descrição normalizada, e registros de mão de obra, serviços e encargos trabalhistas. As linhas continuam no banco para preservar os vínculos históricos. Os serviços de catálogo e orçamento consultam somente os ativos. Novos cadastros manuais oferecem material/equipamento; históricos com outras classificações continuam legíveis.

O banco contém 681 linhas físicas, das quais 500 selecionáveis. Variantes com especificações ou marcas distintas são produtos diferentes. Não se afirma equivalência entre produtos de marcas diferentes.

Os novos preços são referências comerciais coletadas em 05/11/2026, não preços SINAPI ou ORSE e não cotação com entrega no Maranhão. Cada produto possui URL, código da loja, unidade declarada, data e observação. Foram excluídos preços ausentes, produtos indisponíveis, unidades não reconhecidas e multiplicadores de venda diferentes de 1 para evitar conversões ambíguas. Quantidade e valor de linha de referência não representam estoque ou demanda.

Manifesto revisável: `catalog-expansion-2026-11-05.json`. SQL transacional e reaplicável: `supabase/sql/catalog_expansion_2026_11_05.sql`. O SQL aborta se o resultado não tiver exatamente 500 ativos ou incluir tipos fora do escopo. O script de coleta usa snapshot de leitura do banco em `.expo/catalog-before-2026-11-05.json`; o manifesto/SQL preservam o resultado importado.

## Painel de acessibilidade

Configurações → Acessibilidade abre um painel modal com Libras, Voz e Visual. O usuário pode habilitar um atalho lateral, que some durante a digitação. O modal oculta o conteúdo de fundo dos leitores de tela e possui botão de fechar e retorno pelo botão do Android.

- **Libras:** carrega o widget oficial gratuito VLibras em uma WebView, somente após a ação do usuário. O texto pode conter orientações/resumo da tela ou texto digitado/colado. O texto é escapado antes de gerar HTML. A interface informa o processamento externo. O avatar precisa de internet e tradução automática não substitui intérprete humano.
- **Voz:** utiliza `expo-speech` em português, com leitura normal/lenta, recomeçar e parar. Interrompe ao sair da área, fechar o painel ou colocar o app em segundo plano. Não captura automaticamente senhas/formulários. Para leitura de cada elemento da interface, usar TalkBack/VoiceOver.
- **Visual:** contraste, texto ampliado, negrito, espaçamento, redução de movimento, guia de leitura, atalho lateral e opções de avisos. Os ajustes persistem no aparelho. Negrito/espaçamento são aplicados por helpers das telas Planengen/Inventário; não se promete transformar globalmente todas as telas legadas. Reduzir movimento afeta os componentes que consultam a preferência.

Perfis rápidos são combinações de ajustes de leitura, sem alegação de tratamento médico. Restaurar padrão repõe somente as preferências de acessibilidade. Não foram adicionadas opções fictícias de navegação facial, comando de voz, descrição de imagem ou IA.

## Validação e limites

Catálogo verificado no banco remoto após importação. Fluxo visual/voz testado em prévia web com voz simulada. Widget VLibras real carregou o avatar na prévia web sem erros de JavaScript. A voz audível, interação de seleção no tradutor e desempenho do avatar em Android/iPhone físicos precisam de conferência nos aparelhos. WebView depende de conexão e disponibilidade do serviço externo.

Referências consultadas: https://www.sicoob.com.br/ ; https://rybena.com.br/como-usar/ ; https://www.gov.br/governodigital/pt-br/acessibilidade-e-usuario/vlibras ; https://vlibras.gov.br/doc/widget/installation/webpageintegration.html ; https://docs.expo.dev/versions/latest/sdk/speech/

Valida??o conclu?da: 35 testes passaram; exporta??es Android e iOS conclu?das. Consulta autenticada ao cat?logo retornou exatamente 500 ativos, 404 com URL comercial. Abertura e fechamento do painel tamb?m validados na pr?via web.

## Barra global de acessibilidade

Atualizada para uma barra fixa a direita com tres atalhos (Libras, voz, visual), ativa por padrao. Cada atalho abre sua aba diretamente, preservando a tela de origem. A barra pertence ao provedor global e acompanha todos os perfis e telas, incluindo o login. Ao abrir o teclado, reposiciona-se acima dele. Configuracoes oferece Mostrar barra de acessibilidade, salvo no aparelho, sem desligar ajustes visuais. A nova preferencia accessibilityToolbar substitui o antigo atalho opcional. Painel aberto usa os controles internos e volta a mostrar a barra ao fechar.

## Leitura por toque — 06/11/2026

- Removida a exigência de digitar/copiar texto no painel.
- Atalhos Voz e Libras ativam exploração dos textos renderizados: tocar ou deslizar seleciona o trecho. TextInput não registra valores, incluindo senhas.
- Textos nativos e componentes styled de texto usam ReadableText, preservando estilos e encaminhamento de refs. Não houve redesign do painel Consulta/Cliente.
- Camada de exploração impede acionar botões por acidente. Voltar a navegar encerra leitura e libera rolagem/navegação. Alterar tela, desativar barra e colocar app em segundo plano também encerram a exploração.
- Voz: sintetizador local, português brasileiro, velocidade configurável.
- Libras: trecho selecionado abre WebView e é enviado automaticamente a window.vlibras.translateAndPlay quando o avatar está pronto. Internet necessária; indisponibilidade e timeout exibem mensagem. Ponte pública verificada no código distribuído pelo VLibras em vlibras.gov.br/app. Integração depende do serviço externo.
- Limites: textos em imagens, valores dos campos e conteúdo externo não são capturados. Modais nativos de outras telas podem ficar acima da camada global. Não substitui TalkBack/VoiceOver.
- Validação: 35 testes passaram; exportações Android/iOS passaram; teste de interação em React Native Web confirmou toque, arraste, bloqueio de botão, retomada de navegação e envio do texto à ponte VLibras simulada. Avatar real e áudio ainda precisam ser verificados em dispositivo físico.

## Avatar flutuante e coordenadas do toque — 06/11/2026

- Substituído o modal de Libras por FloatingLibras sobre a tela atual, com minimizar/expandir, mover para o outro lado e fechar.
- WebView persistente recebe novos trechos por injeção de JavaScript; não recarrega o avatar a cada seleção. HTML embutido oculta o parágrafo original e dimensiona o contêiner VLibras à janela flutuante.
- Voltar a navegar pausa exploração sem fechar o avatar. Trocar de tela também pausa exploração, preservando o painel.
- Corrigida a mistura entre pageX/pageY e measureInWindow: o ponto local da camada de exploração é convertido pela origem medida dessa mesma camada, considerando deslocamentos de janela/barra de status sem constantes específicas de aparelho.
- Teste de interação web passou para toque/arraste, tradução de novos trechos sem remontagem, navegação com painel presente e controles do painel. 35 testes e exportações Android/iOS passaram. Alinhamento final em aparelhos físicos ainda requer conferência.
- Verificação adicional com serviço real: VLibras carregou no painel flutuante, avatar visível e translateAndPlay disponível. O próprio VLibras pode exibir sua pergunta de consentimento de coleta de dados na primeira abertura.
