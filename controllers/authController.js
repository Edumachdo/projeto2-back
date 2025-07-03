const User = require("../models/User");
const Logger = require("../logger");

exports.getLogin = (req, res) => {
  res.render("login");
};

exports.postLogin = async (req, res) => {
  const { usuario, senha } = req.body;
  const db = req.app.locals.db;

  console.log("postLogin chamado com usuario:", usuario);

  try {
    if (!db) {
      console.error("Banco de dados não está disponível em req.app.locals.db");
    } else {
      console.log("Banco de dados disponível");
    }

    const user = await User.findByUser(db, usuario);
    console.log("Usuário encontrado:", user);

    if (!user) {
      return res
        .status(401)
        .render("login", { error: "Usuário ou senha inválidos" });
    }

    const isMatch = await user.comparePassword(senha);
    if (!isMatch) {
      return res
        .status(401)
        .render("login", { error: "Usuário ou senha inválidos" });
    }

    req.session.user = { _id: user._id, user: user.user, email: user.email };
    res.redirect("/");
  } catch (err) {
    Logger.log(err);
    console.error("Erro no postLogin:", err);
    res.status(500).render("login", { error: "Erro interno do servidor" });
  }
};

exports.isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  res.redirect("/login");
};

exports.getProtected = (req, res) => {
  res.redirect("/");
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      Logger.log(err);
      return res.status(500).send("Erro ao sair");
    }
    res.clearCookie("connect.sid");
    res.redirect("/login");
  });
};
