# Teclado e troca de telas no Android

04/11/2026 — relato de campos encobertos e piscadas no Galaxy S25 Ultra.

## Alterações

- Proteção do teclado no navegador raiz com KeyboardAvoidingView e comportamento padding nas duas plataformas. Removido o ajuste exclusivo e aninhado do login.
- KeyboardScrollView compartilhado no login, layout Planengen e formulários antigos baseados em Scroll. Mede o campo focado e a área visível após foco, abertura do teclado ou alteração do layout, rolando somente a sobreposição com margem de 20 pontos.
- A barra inferior fica oculta enquanto o teclado está aberto; navegar fecha o teclado.
- Login mantém a altura de referência do cabeçalho durante a digitação para evitar uma mudança de composição ao abrir o teclado.
- Fundo azul-marinho persistente, estrutura do conteúdo autenticado estável ao mostrar/ocultar a barra e medidas iniciais de safe area disponíveis desde a montagem. Tema memorizado para evitar sua recriação a cada atualização do contexto.
- app.json declara fundo azul-marinho e modo resize para o teclado Android. A configuração nativa deve ser incorporada em uma próxima build; a correção em JavaScript também atende ao uso atual do Expo Go.

O login anterior deixava behavior indefinido no Android. O guia atual do Expo recomenda defini-lo nas duas plataformas, inclusive para Android com desenho de ponta a ponta: [Keyboard handling](https://docs.expo.dev/guides/keyboard-handling/).

## Validação e limites

Exportações Android/iOS concluídas e 25 testes existentes aprovados. Prévia do login em 320/390/430 pixels: seleção dos cinco perfis, senha, falha de autenticação e cadastro com serviços simulados. Regressão do formulário de orçamento aprovada. Medições nativas simuladas conferem rolagem de campo encoberto, ausência de rolagem desnecessária e remoção do listener ao desmontar.

Sem dispositivo Android conectado por ADB nesta sessão. Confirmar no S25 Ultra com teclado Samsung: e-mail/senha, troca de campo com teclado aberto, observações no fim do orçamento/despesa, fechar teclado e alternar telas. A origem exata das piscadas no aparelho ainda exige essa confirmação; os ajustes removem fontes identificadas de mudanças de layout e exposição do fundo.
