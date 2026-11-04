# Orçamentos — identidade Planengen

Atualização em 04/11/2026 no projeto `obrasyncsupabase`.

- Lista e criação por insumos usam logo Planengen, cabeçalho com voltar, azul-marinho, botões azuis e cartões claros.
- Seletor de obra, catálogo, cadastro de insumo, calendário e BDI acompanham a paleta e as preferências de contraste e tamanho de texto. O BDI usa uma coluna em telas menores ou com texto ampliado.
- Mantidos seleção de insumos, quantidades, cadastro, remoção de itens, cliente opcional, validade, observações, cálculo e salvamento existentes.
- Lista mantém PDF, Excel e arquivamento com justificativa. A ação passou a ser identificada como “Arquivar”. A soma dos documentos é apresentada com aviso de que pode incluir alternativas.
- Removida a duplicação do cabeçalho global nessas duas telas.

Validação: 25 testes existentes aprovados; exportações Expo para iOS e Android concluídas. Prévia web nas larguras 320, 390 e 430; inclusão de 10 unidades de um insumo de R$ 3,50, subtotal R$ 35,00 e total com BDI; envio do formulário e atalhos PDF/Excel conferidos com serviços simulados. Não foram criados orçamentos de teste no banco. Teclado e compartilhamento nativo devem ser conferidos no aparelho.

## Ajustes de navegação e rolagem

- O layout compartilhado permite voltar ao topo após rolar mais de 200 pontos; o botão fica oculto no início e respeita a preferência de reduzir movimento.
- No novo orçamento, o espaçamento e o botão consideram a ausência da barra inferior.
- Barra inferior unificada com azul Planengen em todos os perfis, contraste e texto ampliado. Altura adaptável e rótulos limitados à largura de cada opção.
- Corrigida seleção simultânea de Documentos e Mais no perfil Consulta/Cliente.
- Conferidos retorno ao topo, navegação dos cinco perfis em 320 pixels com texto ampliado/contraste, fluxo simulado de orçamento e exportações. Exportações nativas iOS e Android concluídas.
