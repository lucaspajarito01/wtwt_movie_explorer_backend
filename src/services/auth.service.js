import bcrypt from "bcrypt";
import User from "../entities/User.js";
import AppError from "../utils/AppError.js";

export default class AuthService {
  #users;
  #signToken;
  #rounds;
  #dummyHash;

  constructor(userRepository, { signToken, bcryptRounds }) {
    this.#users = userRepository;
    this.#signToken = signToken;
    this.#rounds = bcryptRounds;
    // Hash falso para que el login tarde igual exista o no el email y así no delatar su ausencia.
    this.#dummyHash = bcrypt.hashSync("dummy-password", bcryptRounds);
  }

  async register({ username, email, password }) {
    const passwordHash = await bcrypt.hash(password, this.#rounds);
    const draft = new User({ username, email, passwordHash }); // rol por defecto: usuario

    let user;
    try {
      user = await this.#users.save(draft);
    } catch (err) {
      if (err.code === "ER_DUP_ENTRY") throw new AppError("El correo ya está registrado", 409);
      throw err;
    }
    return { user, token: this.#signToken(user) };
  }

  async login({ email, password }) {
    const user = await this.#users.findByEmail(email);
    const ok = user
      ? await user.verifyPassword(password)
      : await bcrypt.compare(password, this.#dummyHash);

    if (!user || !ok) throw new AppError("Credenciales inválidas", 401);
    if (!user.isActive()) throw new AppError("La cuenta está inactiva", 403);

    return { user, token: this.#signToken(user) };
  }
}
