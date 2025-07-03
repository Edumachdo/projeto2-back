const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const path = require("path");
const hbs = require("hbs");

// Registrar helper para capitalizar string
hbs.registerHelper("capitalize", function (str) {
  if (typeof str !== "string") return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
});

// Registrar helper eq para comparação de igualdade
hbs.registerHelper("eq", function (a, b) {
  return a === b;
});

const bcrypt = require("bcryptjs");

const { connect } = require("./db");
const Logger = require("./logger");
const authController = require("./controllers/authController");
const BancoPadrao = require("./bancoPadrao");
const userController = require("./controllers/userController");

const app = express();
const PORT = 3000;

// Configuração do view engine
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

// Registrar helper para formatar data
hbs.registerHelper("formatDate", function (datetime) {
  if (!datetime) return "";
  const date = new Date(datetime);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes} ${day}/${month}/${year} `;
});

// Registrar helper para capitalizar string
hbs.registerHelper("capitalize", function (str) {
  if (typeof str !== "string") return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
});

// Middleware para arquivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// Middlewares para cookies e sessões
app.use(cookieParser());
app.use(
  session({
    secret: "segredo_super_secreto",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 600000 }, // 10 minutos
  })
);

// Middleware para body parser
app.use(bodyParser.urlencoded({ extended: false }));

// Middleware para disponibilizar usuário na view
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

// Rotas
app.get("/login", authController.getLogin);
app.post("/login", authController.postLogin);
app.get("/protected", authController.isAuthenticated, (req, res) => {
  res.redirect("/");
});
app.get("/logout", authController.logout);

const messageController = require("./controllers/messageController");

// Rotas para cadastro de usuário
app.get("/cadastro", userController.getCadastro);
app.post("/cadastro", userController.postCadastro);

app.get("/", authController.isAuthenticated, messageController.listarMensagens);

app.get(
  "/mensagens",
  authController.isAuthenticated,
  messageController.listarMensagens
);
app.get(
  "/mensagens/novo",
  authController.isAuthenticated,
  messageController.novaMensagemForm
);
app.get(
  "/mensagens/editar/:id",
  authController.isAuthenticated,
  messageController.editarMensagemForm
);
app.post(
  "/mensagens",
  authController.isAuthenticated,
  messageController.criarMensagem
);
app.post(
  "/mensagens/editar/:id",
  authController.isAuthenticated,
  messageController.atualizarMensagem
);
app.post(
  "/mensagens/:id/deletar",
  authController.isAuthenticated,
  messageController.deletarMensagem
);

// Iniciar servidor e conectar ao banco
connect()
  .then(async ({ db, client }) => {
    app.locals.db = db;
    app.locals.client = client;

    await BancoPadrao.inicializar(db);

    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((err) => {
    Logger.log(err);
    console.error("Erro ao conectar ao banco:", err);
  });
