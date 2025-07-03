const User = require("../models/User");
const Logger = require("../logger");

exports.getCadastro = (req, res) => {
  res.render("cadastro");
};

exports.postCadastro = async (req, res) => {
  const { usuario, email, senha } = req.body;
  const db = req.app.locals.db;

  try {
    // Verificar se usuário ou email já existem
    const existingUser = await User.findByUser(db, usuario);
    if (existingUser) {
      return res.status(400).render("cadastro", { error: "Usuário já existe" });
    }
    const existingEmail = await User.findByEmail(db, email);
    if (existingEmail) {
      return res
        .status(400)
        .render("cadastro", { error: "Email já cadastrado" });
    }

    // Criar novo usuário
    await User.create(db, usuario, email, senha);

    // Redirecionar para login após cadastro
    res.redirect("/login");
  } catch (err) {
    Logger.log(err);
    res.status(500).render("cadastro", { error: "Erro interno do servidor" });
  }
};
