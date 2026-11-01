import bcrypt from "bcrypt";
import BaseEntity from "./BaseEntity.js";
import { ROLES } from "../utils/roles.js";
import { ValidationError } from "../utils/AppError.js";

export const USER_STATUS = Object.freeze({ ACTIVE: "activo", INACTIVE: "inactivo" });

export default class User extends BaseEntity {
  #username;
  #email;
  #passwordHash; // privado: nunca sale de la entidad salvo para persistirse
  #role;
  #status;

  constructor({
    id,
    createdAt,
    username,
    email,
    passwordHash = null,
    role = ROLES.USER,
    status = USER_STATUS.ACTIVE,
  }) {
    super({ id, createdAt });
    if (typeof username !== "string" || !username.trim()) {
      throw new ValidationError("El nombre de usuario es obligatorio");
    }
    if (typeof email !== "string" || !email.includes("@")) {
      throw new ValidationError("El correo no es válido");
    }
    if (!Object.values(ROLES).includes(role)) {
      throw new ValidationError(`Rol desconocido: ${role}`);
    }
    if (!Object.values(USER_STATUS).includes(status)) {
      throw new ValidationError(`Estado desconocido: ${status}`);
    }
    this.#username = username.trim();
    this.#email = email.trim().toLowerCase();
    this.#passwordHash = passwordHash;
    this.#role = role;
    this.#status = status;
  }

  // Reconstruye la entidad desde una fila de MySQL (ya mapeada con alias en el repositorio).
  static fromRow(row) {
    return new User({
      id: row.id,
      createdAt: row.createdAt,
      username: row.username,
      email: row.email,
      passwordHash: row.password_hash ?? null,
      role: row.role,
      status: row.estado,
    });
  }

  get username() { return this.#username; }
  get email() { return this.#email; }
  get role() { return this.#role; }
  get status() { return this.#status; }

  isAdmin() {
    return this.#role === ROLES.ADMIN;
  }

  isActive() {
    return this.#status === USER_STATUS.ACTIVE;
  }

  hasRole(...roles) {
    return roles.includes(this.#role);
  }

  async verifyPassword(plain) {
    if (!this.#passwordHash) {
      throw new Error("Esta instancia de User no tiene hash cargado");
    }
    return bcrypt.compare(plain, this.#passwordHash);
  }

  // Único punto por el que el hash sale de la entidad: lo usa el repositorio al guardar.
  toPersistence() {
    return {
      username: this.#username,
      email: this.#email,
      passwordHash: this.#passwordHash,
      role: this.#role,
    };
  }

  // Forma pública (respuestas de register/login). Nunca incluye el hash.
  toJSON() {
    return {
      id: this.id,
      username: this.#username,
      email: this.#email,
      role: this.#role,
    };
  }

  // Forma de sesión (GET /auth/me): agrega el estado de la cuenta.
  toSession() {
    return { ...this.toJSON(), estado: this.#status };
  }
}
