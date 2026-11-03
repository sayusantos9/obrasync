# Login Planengen — 03/11/2026

Aplicado em `obrasyncsupabase`, com base nos arquivos fornecidos em
`obrasync-main/IdentidadeVisualPlanengen`.

## Visual

- Paleta do manual: #010028, #0084F4, #EEF0F2 e #202020.
- Logo original cinza-claro, com proporções preservadas e resolução reduzida para uso mobile.
- Cabeçalho com ilustração vetorial de arquitetura, formulário claro e seletor de perfis em painel inferior.
- Fontes nativas do sistema nos textos. O manual cita Codec Cold Trial e Gadugi, mas os arquivos
  dessas fontes não foram fornecidos. A tipografia original permanece na imagem da logo.
- Cabeçalho global oculto apenas no login, evitando repetir a logo.

## Funcionalidades

Login direto com seleção obrigatória dos cinco perfis existentes, e-mail e senha.
Mostrar/ocultar senha, preenchimento automático, avanço pelo teclado, carregamento,
erros de validação e bloqueio de envio duplicado. Botão de ajuda com orientação de acesso.

Cadastro da empresa com nome do Gestor, e-mail, senha, empresa, CNPJ e telefone opcionais.
Após cadastro que exige confirmação de e-mail, retorna ao login no perfil Gestor e limpa a senha.
Voltar ao login disponível na tela e pelo botão físico Android no cadastro.

Mantidas as chamadas `login` e `registerCompany` do contexto. Nenhuma mudança de banco,
política de acesso ou credencial. O seletor não concede permissões: a autenticação existente
continua validando o perfil cadastrado.

## Validação

- Compilação Expo/Hermes para iOS e Android.
- Prévia React Native Web do componente real, com adaptadores visuais e autenticação simulada:
  larguras 320, 390 e 430 px; cinco perfis; visibilidade da senha; erro de login;
  envio do perfil REQUESTER; cadastro e retorno após confirmação.
- Revisão das capturas de login, perfis e cadastro.
- Sem criação de contas reais ou teste de login com credenciais de usuário.
- Teclado, autofill e áreas seguras nativas ainda devem ser conferidos em aparelho físico.

Inicie com `npm start` em `obrasyncsupabase`. Saia da sessão atual para visualizar o novo login.
