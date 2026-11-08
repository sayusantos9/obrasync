# ObraSync — MVP Supabase

Versão conectada ao Supabase/PostgreSQL para login, perfis, empresa, usuários, obras e orçamentos.

## Fluxo de acesso

1. Na primeira tela escolha **Entrar** ou **Cadastrar empresa**.
2. **Cadastrar empresa** cria apenas o primeiro **Gestor/Master**.
3. O Gestor entra no **Painel Master** e cadastra usuários um por vez.
4. Perfis disponíveis: Engenharia, Compras/Almoxarifado, Obra/Solicitante e Cliente.
5. No login manual, o usuário escolhe o perfil correspondente e informa e-mail/senha. Quando o preenchimento de senha salva é reconhecido, a opção de entrada automática usa o perfil real da conta autenticada.

## Ligação de orçamento com Cliente

O Gestor cadastra um usuário com perfil **Cliente**. Ao criar um orçamento, Gestor ou Engenharia seleciona esse cliente. O orçamento é salvo com `client_user_id` no Supabase. Quando esse Cliente entra, as políticas RLS deixam visíveis somente os orçamentos vinculados ao usuário dele.

## Rodar

Na pasta do projeto:

```powershell
npm.cmd install
npx.cmd expo start --clear --go
```

Não é necessário iniciar API Node local nem usar a porta 3333.

## Supabase

O projeto usa as variáveis do arquivo `.env`:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Nunca coloque `service_role` ou chave secreta dentro do app.

## Funcionalidades atuais

- Catálogo compartilhado de 500 insumos e cadastro da empresa, com escopo de materiais e equipamentos.
- Orçamentos por insumo, importação XLSX/CSV, revisões, base oficial e BDI opcional com padrão por empresa.
- Planejamento de compras, fornecedores e rastreabilidade entre solicitação, cotação e pedido.
- Aprovações por obra e alçada, compra confirmada, recebimento parcial/offline, rejeições, devoluções e estoque.
- Comparação financeira e relatório executivo com exportação PDF/XLSX.
- Gestão de usuários, perfis e vínculos por obra; confirmação recente de identidade e autenticador opcional.
- Identidade Planengen, acessibilidade global e entrada automática quando o preenchimento salvo é reconhecido.

As migrações e regras estão em [supabase/README.md](supabase/README.md). Não reaplique rotinas antigas sobre as migrações mais recentes.

## Validação e documentação

```powershell
npm.cmd test
npm.cmd run check:android
npm.cmd run check:ios
```

Os bundles não substituem homologação nos aparelhos físicos. A documentação registra o que foi testado e os limites de cada entrega:

- [Reanálise da solicitação e atualizações](docs/REANALISE_SOLICITACAO_2026-11-06.md)
- [Qualidade, devoluções e validação do fluxo](docs/VALIDACAO_FLUXO_QUALIDADE_2026-11-08.md)
- [Segurança e recuperação de backups](docs/SEGURANCA_RECUPERACAO_2026-11-08.md)
- [Tratamento e retenção de dados](docs/TRATAMENTO_RETENCAO_DADOS_2026-11-08.md)
- [Usuários e preenchimento de login](docs/USUARIOS_PREENCHIMENTO_LOGIN_2026-11-08.md)

Backups, chaves e credenciais ficam fora do repositório. Notificações externas automáticas foram adiadas; não são uma funcionalidade ativa desta versão.
