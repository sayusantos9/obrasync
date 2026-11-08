# Cotações, anexos e cabeçalho — 06/11/2026

Implementado em `obrasyncsupabase`, com migrações aplicadas no Supabase.

## Logo duplicada

Alertas, Compras, Pedidos e Aprovações exibem somente a marca no cabeçalho azul-escuro. O navegador exibia o cabeçalho antigo acima do cabeçalho próprio das telas. O teste visual agora monta o `AppNavigator` completo e conta as logos. Cotações e Nova cotação também usam a identidade atual.

## Mapa comparativo e pedido vinculado

Em **Cotações → Nova proposta / rodada**, Gestor, Engenharia e Compras podem criar uma rodada ou selecionar uma rodada aberta da obra. Informe fornecedor, validade, entrega, pagamento, especificações, itens e preços. Ao selecionar uma rodada existente, o app copia os mesmos códigos, unidades e quantidades e deixa os preços vazios para preenchimento pelo novo fornecedor.

O servidor valida os insumos, exige a mesma cesta de itens na rodada e calcula o total com frete, tributos adicionais e desconto. Só são aceitos materiais/equipamentos cadastrados. Cotações antigas continuam consultáveis, mas descrições livres não são transformadas automaticamente em identidades equivalentes.

O mapa apresenta preços unitários sem adicionais, total final, prazo, validade, pagamento e observações. Destaca o menor total vigente, incluindo empates. O mapa pode ser exportado em XLSX; propostas individuais em PDF/XLSX, com adicionais discriminados.

O **Gestor** seleciona a proposta, informa justificativa com pelo menos 10 caracteres e confirma **Aprovar escolha e gerar pedido**. A rodada precisa de ao menos dois fornecedores distintos com propostas vigentes. O pedido recebe itens, preços, adicionais, entrega, condições e vínculo à cotação vencedora. Fica **aprovado, mas não comprado**: a confirmação de compra real continua em Compras.

A escolha é auditada, incluindo propostas consideradas. Repetir a mesma chamada retorna o mesmo pedido. Não é possível escolher outro vencedor nem arquivar propostas de uma rodada encerrada. Uma nova negociação exige outra rodada.

Limites: escolha por lote completo, até 500 itens, sem decisão automática por menor preço. Marca, qualidade e equivalência técnica devem ser avaliadas pelo Gestor. Escolha por item e alçadas configuráveis continuam pendentes.

## Anexos privados

Use **Anexos privados → Adicionar arquivo**:

- Em **Solicitar insumos**, na seção “Solicitações enviadas — anexos”, após salvar/sincronizar.
- Em **Cotações**, na seção “Propostas e anexos”.
- Em **Compras/Pedidos**, no cartão do pedido.
- Em **Recebimento**, no cartão do recebimento registrado.

Formatos: PDF, JPG/JPEG e PNG, até 10 MB. O app verifica extensão, assinatura inicial e tamanho; o Storage também limita MIME e tamanho. Essa verificação não equivale a antivírus.

O bucket `operation-attachments` é privado. Os metadados registram empresa, obra, documento, responsável, nome, tamanho e data. A abertura usa URL assinada de 60 segundos; não há link público permanente. Arquivos registrados não podem ser substituídos/apagados pelo cliente do app; outra evidência gera outro registro auditado. Retenção e exclusão administrativa/LGPD são trabalho separado.

| Documento | Quem pode adicionar |
|---|---|
| Solicitação | Gestor, Compras e Solicitante; este último somente nas próprias solicitações |
| Cotação | Gestor, Engenharia e Compras |
| Pedido | Gestor e Compras |
| Recebimento | Gestor, Compras e Solicitante |

Consulta/Cliente não acessa anexos operacionais. Os demais acessos são limitados por empresa, tipo de documento e vínculo à obra. Não há captura de câmera neste fluxo: selecione arquivo existente no aparelho. Anexos exigem internet; solicitações offline precisam ser sincronizadas primeiro. Abertura fora do app depende do visualizador do dispositivo.

## Evidências e validação

- Migrações: `supabase/sql/quote_rounds.sql` e `supabase/sql/operation_attachments.sql`.
- Testes SQL: `supabase/tests/quote_rounds_attachments.sql`, com `ROLLBACK`. Cobrem atomicidade, total, cesta incompatível, dois fornecedores, permissão, escolha idempotente, pedido não comprado, preservação da rodada e isolamento de anexos.
- 53 testes de aplicação passaram, incluindo comparação e validação de arquivos.
- Preview com navegador completo: uma logo nas quatro rotas, criação de proposta com preço editável, escolha justificada, anexos e mapa em 320 px. Seletor de arquivo/servidor simulados nesse preview.
- Teste real de Storage: upload, registro e download íntegro de PDF; URL pública e perfil Cliente bloqueados; exclusão de evidência registrada bloqueada. Arquivo e registros temporários removidos ao final.
- Compilação Android/iOS. Ainda é necessário aceite do seletor/visualizador nativo nos aparelhos físicos.

Próximas prioridades: recebimento offline, alçadas/notificações, fornecedores completos, reservas/devoluções e indicadores restantes. Não foram incluídos mão de obra, serviços ou composições.
