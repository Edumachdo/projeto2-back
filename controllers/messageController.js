const Message = require("../models/Message");
const User = require("../models/User");
const { ObjectId } = require("mongodb");

exports.listarMensagens = async (req, res) => {
  try {
    const messages = await Message.buscar({});
    // Extrair userIds únicos das mensagens
    const userIds = [...new Set(messages.map((m) => m.userId))];
    // Filtrar userIds válidos para ObjectId
    const validUserIds = userIds.filter(
      (id) =>
        typeof id === "string" && id.length === 24 && /^[0-9a-fA-F]+$/.test(id)
    );
    // Buscar usuários correspondentes
    // Buscar usuários correspondentes usando findMany equivalente
    const users = await (async () => {
      const db = req.app.locals.db;
      if (!db) throw new Error("Banco de dados não disponível");
      return db
        .collection("users")
        .find({
          _id: { $in: validUserIds.map((id) => new ObjectId(id)) },
        })
        .toArray();
    })();
    // Mapear usuários por id para fácil acesso
    const userMap = {};
    users.forEach((u) => {
      userMap[u._id.toString()] = u;
    });
    // Combinar dados do usuário nas mensagens
    const messagesWithUser = messages.map((m) => {
      const user = userMap[m.userId];
      return {
        ...m,
        user: user ? user.user : null,
        email: user ? user.email : null,
      };
    });
    res.render("index", { messages: messagesWithUser, user: req.session.user });
  } catch (err) {
    console.error("Erro em listarMensagens:", err);
    res.status(500).send("Erro ao listar mensagens");
  }
};

exports.novaMensagemForm = (req, res) => {
  res.render("novaMensagem");
};

exports.editarMensagemForm = async (req, res) => {
  const messageId = req.params.id;

  try {
    const messages = await Message.buscar({ _id: new ObjectId(messageId) });
    const message = messages.length > 0 ? messages[0] : null;
    if (!message) {
      return res.status(404).send("Mensagem não encontrada");
    }
    res.render("novaMensagem", { message });
  } catch (err) {
    res.status(500).send("Erro ao carregar mensagem para edição");
  }
};

exports.criarMensagem = async (req, res) => {
  const userId = req.session.user ? req.session.user._id : null;
  const { mensagem } = req.body;

  if (!userId) {
    return res.status(401).send("Usuário não autenticado");
  }

  if (!mensagem || mensagem.trim() === "") {
    return res.status(400).send("Texto da mensagem é obrigatório");
  }

  try {
    const message = new Message(null, userId, mensagem.trim(), new Date());
    await message.inserir();
    res.redirect("/mensagens");
  } catch (err) {
    res.status(500).send("Erro ao criar mensagem");
  }
};

exports.atualizarMensagem = async (req, res) => {
  const userId = req.session.user ? req.session.user._id : null;
  const messageId = req.params.id;
  const { mensagem } = req.body;

  if (!userId) {
    return res.status(401).send("Usuário não autenticado");
  }

  if (!mensagem || mensagem.trim() === "") {
    return res.status(400).send("Texto da mensagem é obrigatório");
  }

  try {
    const messages = await Message.buscar({ _id: messageId });
    const message = messages.length > 0 ? messages[0] : null;

    if (!message) {
      return res.status(404).send("Mensagem não encontrada");
    }

    if (message.userId.toString() !== userId.toString()) {
      return res.status(403).send("Não autorizado a editar esta mensagem");
    }

    const { ObjectId } = require("mongodb");
    await Message.atualizar(
      { _id: new ObjectId(messageId) },
      { text: mensagem.trim() }
    );

    res.redirect("/mensagens");
  } catch (err) {
    console.error("Erro ao atualizar mensagem:", err);
    res.status(500).send("Erro ao atualizar mensagem");
  }
};

exports.deletarMensagem = async (req, res) => {
  const userId = req.session.user ? req.session.user._id : null;
  const messageId = req.params.id;

  if (!userId) {
    return res.status(401).send("Usuário não autenticado");
  }

  try {
    const messages = await Message.buscar({ _id: messageId });
    const message = messages.length > 0 ? messages[0] : null;

    if (!message) {
      return res.status(404).send("Mensagem não encontrada");
    }

    if (message.userId.toString() !== userId.toString()) {
      return res.status(403).send("Não autorizado a deletar esta mensagem");
    }

    // Usar deleteOne diretamente na coleção para deletar a mensagem
    const db = req.app.locals.db;
    if (!db) throw new Error("Banco de dados não disponível");
    await db.collection("messages").deleteOne({ _id: new ObjectId(messageId) });

    res.redirect("/mensagens");
  } catch (err) {
    console.error("Erro ao deletar mensagem:", err);
    res.status(500).send("Erro ao deletar mensagem");
  }
};
