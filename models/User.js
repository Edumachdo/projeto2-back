const bcrypt = require("bcryptjs");

class User {
  constructor(id, user, email, passwordHash) {
    this._id = id;
    this.user = user;
    this.email = email;
    this.passwordHash = passwordHash;
  }

  static async findByEmail(db, email) {
    const userData = await db.collection("users").findOne({ email });
    if (!userData) return null;
    return new User(
      userData._id,
      userData.user,
      userData.email,
      userData.passwordHash
    );
  }

  static async findByUser(db, user) {
    const userData = await db.collection("users").findOne({ user });
    if (!userData) return null;
    return new User(
      userData._id,
      userData.user,
      userData.email,
      userData.passwordHash
    );
  }

  static async create(db, user, email, password) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userObj = { user, email, passwordHash };
    await db.collection("users").insertOne(userObj);
    return new User(user, email, passwordHash);
  }

  async comparePassword(password) {
    return bcrypt.compare(password, this.passwordHash);
  }
}

module.exports = User;
