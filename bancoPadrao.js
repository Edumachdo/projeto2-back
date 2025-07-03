const User = require("./models/User");
const Logger = require("./logger");

class BancoPadrao {
  static async inicializar(db) {
    try {
      const adminUser = await User.findByEmail(db, "admin@example.com");
      if (!adminUser) {
        await User.create(db, "admin", "admin@example.com", "1234");
        console.log("Usuário admin criado com sucesso.");
      } else {
        console.log("Usuário admin já existe.");
      }
    } catch (err) {
      Logger.log(err);
      console.error("Erro ao inicializar banco:", err);
    }
  }
}

module.exports = BancoPadrao;
