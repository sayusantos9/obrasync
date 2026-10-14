# ObraSync — MVP Supabase

Versão conectada ao Supabase/PostgreSQL para login, perfis, empresa, usuários, obras e orçamentos.

## Fluxo de acesso

1. Na primeira tela escolha **Entrar** ou **Cadastrar empresa**.
2. **Cadastrar empresa** cria apenas o primeiro **Gestor/Master**.
3. O Gestor entra no **Painel Master** e cadastra usuários um por vez.
4. Perfis disponíveis: Engenharia, Compras/Almoxarifado, Obra/Solicitante e Cliente.
5. No login, o usuário escolhe o perfil correspondente e informa e-mail/senha.

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
