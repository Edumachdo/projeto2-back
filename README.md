# Projeto MVC com Express - Sistema de Mensagens

Este é um projeto acadêmico de backend utilizando o padrão MVC com Node.js, Express e MongoDB, desenvolvido para fins educacionais.

## Descrição

O projeto consiste em um sistema simples de mensagens com autenticação de usuários. Ele possui:

1. **Página protegida**: Uma página principal que só pode ser acessada após login válido. Exibe as mensagens do usuário.
2. **Página de login**: Interface para o usuário realizar login com usuário e senha.
3. **Uso de sessions e cookies**: Para manter o estado da autenticação do usuário.
4. **Autenticação via banco de dados**: Usuários e senhas são armazenados e validados no MongoDB.

## Tecnologias Utilizadas

- Node.js
- Express
- MongoDB
- Handlebars (hbs) para views
- express-session e cookie-parser para gerenciamento de sessões e cookies
- bcryptjs para hash de senhas

## Estrutura do Projeto

- `app.js`: Configuração do servidor, middlewares, rotas e inicialização.
- `controllers/`: Controladores para autenticação, mensagens e usuários.
- `models/`: Modelos para usuários e mensagens, com métodos para CRUD e autenticação.
- `views/`: Templates Handlebars para as páginas (login, mensagens, cadastro).
- `public/`: Arquivos estáticos como CSS.
- `db.js`: Configuração da conexão com o MongoDB.
- `logger.js`: Utilitário para logging.

## Como Rodar

1. Instale as dependências:
   ```
   npm install express express-session cookie-parser body-parser mongodb bcryptjs express-handlebars hbs
   ```
2. Configure o MongoDB no arquivo `db.js` se necessário.
3. Inicie o servidor:
   ```
   node app.js
   ```
4. Acesse no navegador:

   ```
   http://localhost:3000/login
   ```

   http://localhost:3000/login

## Uso

- Cadastre um usuário na página `/cadastro`.
- Faça login na página `/login`.
- Após login, acesse a página protegida `/` para visualizar e gerenciar mensagens.
- Use o botão "Sair" para encerrar a sessão.

## Observações

- O projeto segue o padrão MVC para organização do código.
- A autenticação é feita via sessões e cookies.
- As mensagens são associadas ao usuário autenticado.
- O frontend é simples, mas funcional, utilizando Handlebars e CSS.

## Contato

Este projeto foi desenvolvido para fins acadêmicos. Para dúvidas, entre em contato com o autor.

---
