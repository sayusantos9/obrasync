# Tela inicial — Obra/Solicitante

Referência visual: `NovatelaObraSolicitante.zip` (`screen.png` e `code.html`).
A interface foi adaptada para React Native em `src/screens/RequesterHomeScreen.js`.
Os valores de exemplo da referência foram substituídos pelos dados do contexto do app.

A nova tela é usada somente em Início para o perfil REQUESTER. O cabeçalho Planengen
global fica oculto nessa tela, que já contém sua própria marca e área segura.
A barra inferior usa as cinco rotas existentes, com aparência ajustada somente nessa tela.

## Ações

- Engrenagem: configurações; sino: alertas; usuário: perfil.
- Seletor de obra, detalhes e andamento: tela existente de obras.
- Solicitar material e Materiais: respectivos fluxos existentes.
- Indicadores e avisos: mesmos destinos definidos em `homeData.js`.
- Sincronização: mesma operação do contexto, com bloqueio durante execução.
- Campo de pesquisa: filtra os três atalhos locais; o botão ao lado foca ou limpa a busca.
- Arrastar para baixo atualiza os dados; seta flutuante retorna ao topo e respeita
  a preferência de redução de movimento.

Sem alteração no banco ou na lógica dos documentos. A tela preserva os estados
de ausência de obra, offline, atualização e pendências do contexto atual.
Textos acompanham a preferência de tamanho de fonte do app e a escala do sistema.
Horário, bateria e indicador de início são fornecidos pelo sistema operacional.
