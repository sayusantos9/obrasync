# Segurança e recuperação — 08/11/2026

## Entrega

Notificações automáticas foram retiradas do escopo por solicitação do usuário. Não foram instalados serviço de e-mail, push ou agendamento de notificações.

Migração `supabase/sql/security_hardening.sql` aplicada no Supabase conectado. A tela **Mais → Segurança e privacidade** segue a identidade Planengen e está disponível para os cinco perfis.

### Ações críticas

O servidor exige confirmação de senha nos últimos 15 minutos e código de segundo fator, quando cadastrado para:

- Alterar acessos/alçadas e administrar usuários.
- Definir orçamento-base, decidir aprovação e escolher cotação vencedora.
- Confirmar compra, devolver ao fornecedor e arquivar documento.
- Alterar o padrão de BDI da empresa.

Renovação de token (`token_refresh`) não vale como nova confirmação. Conta/empresa inativa é bloqueada. Quando o JWT identifica a sessão, o servidor verifica se ela ainda existe no Auth. Usuário com segundo fator verificado deve apresentar nível `aal2`.

O app abre confirmação de identidade quando o servidor recusa explicitamente por esse motivo. A repetição usa os mesmos argumentos e só ocorre após conferir que a conta não mudou. Cancelar não executa a ação. Erro de rede não é interpretado como autorização para repetir uma mutação. Perfil, vínculo da obra, impedimento de decisão própria e alçadas continuam validados separadamente.

A sincronização em segundo plano não abre uma caixa de senha inesperada: a fila sinaliza a necessidade de confirmação, oferece acesso à tela de segurança e pode ser revalidada depois. A mesma chave de operação é preservada para evitar duplicações.

### Sessão nativa e MFA

Sessão nativa migrada de AsyncStorage para `expo-secure-store`, com gravação por partes abaixo do limite por valor, publicação final do manifesto e remoção da cópia legada após gravação protegida. Falha no meio da gravação mantém a sessão anterior. No web, não se alega proteção equivalente ao keychain.

A tela permite cadastrar, validar e remover autenticador TOTP. Para remover fator ativo, a interface solicita senha e código; o Auth continua sendo responsável pela validação. A chave de cadastro não entra no registro de textos usado pela tradução por toque. Senhas e códigos digitados não são persistidos pelo formulário.

Referências: [claims AMR do Supabase](https://supabase.com/docs/guides/auth/jwt-fields), [MFA e níveis de garantia](https://supabase.com/docs/guides/auth/auth-mfa), [armazenamento seguro do Expo](https://docs.expo.dev/versions/latest/sdk/securestore/).

## Recuperação comprovada

Foi criado backup lógico real e restaurado em **PostgreSQL local isolado**, escutando apenas em `127.0.0.1`, com senha temporária aleatória. O banco hospedado não foi restaurado nem sobrescrito.

Evidências da restauração:

- **78 tabelas / 877 registros**, incluindo schemas `public`, `auth` e `storage`.
- Contagem e hash de todas as linhas iguais ao snapshot exportado, usando um snapshot consistente também no `pg_dump`.
- **41 tabelas públicas com RLS / 90 políticas**.
- Comparação de políticas e permissões efetivas de tabelas, colunas e funções para `anon`/`authenticated`.
- **Nove suítes SQL** executadas com sucesso sobre o banco restaurado: BDI, importação/versões, rastreabilidade, fornecedores/executivo, acessos/alçadas, equipe/planejamento, recebimento/financeiro, qualidade/devoluções e autenticação recente/MFA.
- Revalidação de um artefato já existente sem consultar o Supabase, por `--verify`.
- O Storage estava **sem objetos**. Foram preservados esquema e configuração do bucket privado, mas não se afirma restauração de anexos reais inexistentes. O caminho de cópia de objetos quando houver arquivos precisa ser exercitado novamente nessa condição.

Isso comprova restauração lógica dos schemas abrangidos e do fluxo SQL. Não comprova failover da plataforma Supabase, reativação de envio de e-mails/Auth, DNS, implantação das Edge Functions, configuração de provedores externos ou recuperação de um projeto hospedado completo.

### Proteção do artefato

Backups em `%LOCALAPPDATA%\ObraSync\Backups`, fora do Git e do OneDrive. Conteúdo protegido com AES-256-GCM; chave de 256 bits separada em `%LOCALAPPDATA%\ObraSync\RecoveryKeys\backup-aes256.dpapi`, protegida para a conta Windows por DPAPI. Dumps, chaves e backups são ignorados pelo Git.

O artefato contém dump com proprietários/permissões, manifestos, código SQL/Edge e versões dos testes/scripts de recuperação. Não inclui `.env` nem valores de segredos das Edge Functions. Credenciais temporárias de acesso ao banco ficam em memória durante a operação e não são impressas.

Os binários PostgreSQL 17.11 foram obtidos do [distribuidor EDB indicado pelo PostgreSQL](https://www.postgresql.org/download/windows/) e instalados em `%LOCALAPPDATA%\ObraSync\RecoveryTools\pgsql`. SHA-256 do ZIP baixado: `80379b2c04d51c30225532e0ae04509899141e9957ed096fe749d7fd9df8f82f`. Esse é o hash calculado do download, não uma alegação de assinatura ou checksum independente do fornecedor verificado.

### Repetir o ensaio

Na raiz do projeto, com CLI autenticada e ferramentas PostgreSQL disponíveis:

```powershell
py -m pip install --user -r scripts/recovery-requirements.txt
py scripts/recovery_drill.py
```

O caminho do CLI e dos binários pode ser informado por `OBRASYNC_SUPABASE_CLI` e `OBRASYNC_PG_BIN`. O projeto-alvo está fixado no script; revisar antes de reutilizar em outra instalação. O modo de backup só lê dados no banco hospedado; o CLI pode obter credenciais temporárias administrativas para essa leitura.

O resultado precisa ter `status: PASS`. Um `.obsbackup` existente sem verificação correspondente não é, por si só, evidência de recuperação.

### Restaurar um backup existente sem depender do banco de origem

```powershell
py scripts/recovery_drill.py --verify "C:\caminho\backup.obsbackup"
```

Esse modo não consulta o Supabase nem modifica o banco de origem: descriptografa o arquivo, restaura em instância local descartável e compara dados/permissões. Os testes arquivados são usados quando presentes. Evidências ficam em um arquivo `.recheck.json` na pasta de backups.

### Recuperar a chave em outro computador

O arquivo DPAPI sozinho **não** garante recuperação em outro Windows/conta. Exportar previamente uma cópia da chave para local offline e separado dos backups:

```powershell
py scripts/recovery_key.py --export "E:\ObraSync-recuperacao.key"
```

O arquivo `.key` é secreto: não anexar a mensagens, não enviar ao Git, não guardar junto ao backup. O script não imprime a chave nem sobrescreve arquivo existente.

Em outra instalação autorizada:

```powershell
py scripts/recovery_key.py --import "E:\ObraSync-recuperacao.key"
py scripts/recovery_drill.py --verify "C:\caminho\backup.obsbackup"
```

A cópia offline/externa e o ensaio em outro computador **não foram realizados nesta entrega**, pois exigem destino e custódia definidos pelo administrador. Sem essa cópia, a perda da conta/máquina pode impedir o acesso à chave.

### Incidente no projeto hospedado

1. Suspender escritas afetadas e preservar evidências, sem restaurar por cima da única base existente.
2. Selecionar artefato verificado e chave correspondente; revalidar localmente.
3. Preparar **outro projeto autorizado**, compatível em versão/extensões, e seguir o [procedimento oficial de backup/restauração Supabase](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore).
4. Reconfigurar Auth, segredos, Edge Functions, Storage e serviços externos. Tratar sessões antigas/chaves de assinatura conforme o novo ambiente; o dump não substitui esses segredos/configurações.
5. Reaplicar decisões de exclusão/retenção posteriores ao backup, conferir anexos, permissões e fluxo operacional, e só então alterar o app para o destino recuperado.

O script entregue não aceita um destino remoto de restauração. A mudança do app para outro projeto não foi executada.

## Tratamento, retenção e limites

Inventário, finalidades, papéis, exportações, filas, prazos implementados/propostos e atendimento ao titular em [Tratamento e retenção dos dados](TRATAMENTO_RETENCAO_DADOS_2026-11-08.md).

- Cache vencido de recebimentos é removido na próxima leitura após sete dias. Filas pendentes não são apagadas automaticamente.
- Backups verificados: retenção de 30 dias, preservando ao menos os dois últimos; executada apenas quando o script roda com sucesso, sem agendamento diário instalado.
- A empresa ainda deve aprovar prazos documentais, canal de privacidade, responsáveis e cópia externa dos backups. Não há expurgo automático irrestrito do histórico financeiro.
- O ensaio precisa ser repetido com anexos reais e no processo de migração hospedada, se esse processo for adotado.
- Autenticação nativa/TOTP precisa de homologação nos aparelhos reais. Bundles e prévias não substituem a validação de keychain/autenticador físico.
- Auditoria de dependências: zero vulnerabilidades altas/críticas; cinco moderadas na cadeia Expo/CLI/glob/minimatch. O reparo sugerido pelo npm envolveria voltar ao Expo SDK 57; não foi aplicado `--force`, que quebraria a compatibilidade SDK 58. Acompanhar atualização compatível da cadeia.
- Credenciais de demonstração devem ser substituídas antes de produção; não foi declarada certificação de segurança ou conformidade LGPD.

## Limpeza bloqueada

A revisão automática rejeitou a remoção da pasta de um ensaio interrompido, com a única justificativa `blocked by policy`. Caminho: `C:\Users\pedro\AppData\Local\ObraSync\RecoveryDrills\20261108T201042Z-fb99bd20`. O PostgreSQL desse ensaio foi encerrado e o marcador de processo não estava presente na conferência. A pasta está fora do projeto, mas contém dados privados temporários; **a limpeza manual dessa pasta pelo administrador permanece pendente**. Não confundir essa pasta com `Backups` ou `RecoveryKeys`, que devem ser preservadas.

## Validação da implementação

- 93 testes Node aprovados, incluindo migração/fragmentação de sessão, falha de gravação, conta alterada, cancelamento e repetição segura de RPC.
- Dois testes Python da retenção de backups aprovados.
- Nove suítes SQL no projeto conectado, todas com rollback; e novamente no banco restaurado.
- Prévia real das telas com Auth simulado: cinco perfis, senha inválida/válida, cadastro TOTP, desafio e largura de 320 px. QR nativo/autenticador e keychain físicos não foram homologados nessa prévia.
- Bundles Android/iOS gerados. Não foram enviados e-mails, push ou mensagens de teste a terceiros.




## Evidência mais recente

Ensaio concluído em 08/11/2026 às 17:35:23 (America/Sao_Paulo), com `status: PASS`.

- Artefato: `C:\Users\pedro\AppData\Local\ObraSync\Backups\20261108T203425Z-ba3620d2.obsbackup`.
- SHA-256: `d165a4f7313b5b2194fb7054ff6a3b050138038a5384eaf105d9d636a6f96775`.
- Evidência administrativa: arquivo `.verification.json` de mesmo identificador na pasta de backups.
- Restauração sem origem: `.expo/recovery-offline-recheck.log` registra a revalidação independente de um artefato existente.
