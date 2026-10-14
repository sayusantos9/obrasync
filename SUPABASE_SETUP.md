# Supabase do ObraSync

O projeto Supabase já está configurado para este MVP. Não execute um schema antigo por cima do banco.

## Já configurado no Supabase

- Auth por e-mail/senha
- `companies`
- `profiles`
- `projects`
- `budgets` e `budget_items`
- solicitações, cotações, pedidos, recebimentos, materiais, estoque, etiquetas, despesas, documentos e notificações
- RLS por empresa/perfil
- vínculo `client_user_id` entre Cliente, obra e orçamento
- Edge Function `create-member` para o Gestor cadastrar usuários

## Para rodar o app

```powershell
npm.cmd install
npx.cmd expo start --clear --go
```

O `.env` desta versão já aponta para o projeto Supabase do ObraSync usando uma chave pública/publishable.

## Cadastro

O cadastro público cria somente o primeiro Gestor/Master. Engenharia, Compras, Solicitante e Cliente são cadastrados pelo Gestor em **Painel Master > Funcionários**.

Se a confirmação de e-mail estiver habilitada no Supabase, o primeiro Gestor deverá confirmar o e-mail antes do primeiro login.
