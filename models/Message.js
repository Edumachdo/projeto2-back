const { connect } = require("../db");
const Logger = require("../logger");

class Message {
  constructor(id, userId, text, postDate) {
    this.id = id;
    this.userId = userId;
    this.text = text;
    this.postDate = postDate;
  }

  validar() {
    try {
      if (!this.userId) {
        throw new Error("userId é obrigatório");
      }
      if (!this.text || this.text.trim() === "") {
        throw new Error("Texto é obrigatório");
      }
      if (!this.postDate) {
        throw new Error("Data da postagem é obrigatória");
      }
    } catch (error) {
      Logger.log("Erro de validação: " + error.message);
      throw error;
    }
  }

  async inserir() {
    let client;
    try {
      this.validar();
      const connection = await connect();
      client = connection.client;
      const db = connection.db;
      const result = await db.collection("messages").insertOne({
        id: this.id,
        userId: this.userId,
        text: this.text,
        postDate: this.postDate,
      });
      console.log("Mensagem inserida:", result.insertedId);
    } catch (error) {
      Logger.log("Erro ao inserir mensagem: " + error);
    } finally {
      if (client) {
        client.close();
      }
    }
  }

  static async buscar(filtro = {}) {
    try {
      const { db, client } = await connect();
      const { ObjectId } = require("mongodb");
      if (filtro._id && typeof filtro._id === "string") {
        filtro._id = new ObjectId(filtro._id);
      }
      const messages = await db.collection("messages").find(filtro).toArray();
      client.close();
      return messages;
    } catch (error) {
      Logger.log("Erro na busca de mensagens: " + error);
      return [];
    }
  }

  async deletar() {
    let client;
    try {
      const connection = await connect();
      client = connection.client;
      const db = connection.db;
      const { ObjectId } = require("mongodb");
      const result = await db
        .collection("messages")
        .deleteOne({ _id: new ObjectId(this.id) });
      console.log("Mensagem deletada:", result.deletedCount);
    } catch (error) {
      Logger.log("Erro ao deletar mensagem: " + error);
    } finally {
      if (client) {
        client.close();
      }
    }
  }

  async atualizar() {
    let client;
    try {
      const connection = await connect();
      client = connection.client;
      const db = connection.db;
      const { ObjectId } = require("mongodb");
      const result = await db.collection("messages").updateOne(
        { _id: new ObjectId(this.id) },
        {
          $set: {
            text: this.text,
          },
        }
      );
      console.log("Mensagem atualizada:", result.modifiedCount);
    } catch (error) {
      Logger.log("Erro ao atualizar mensagem: " + error);
    } finally {
      if (client) {
        client.close();
      }
    }
  }

  static async atualizar(filtro, novosDados) {
    try {
      const { db, client } = await connect();
      const result = await db.collection("messages").updateMany(filtro, {
        $set: novosDados,
      });
      console.log("Mensagem atualizada!", result.modifiedCount);
      client.close();
    } catch (error) {
      Logger.log("Erro ao atualizar mensagem: " + error);
    }
  }
}

module.exports = Message;
