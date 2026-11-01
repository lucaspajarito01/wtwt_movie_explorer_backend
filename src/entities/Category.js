import BaseEntity from "./BaseEntity.js";
import { ValidationError } from "../utils/AppError.js";

const NAME_MAX = 50;

export default class Category extends BaseEntity {
  #name;
  #description;

  constructor({ id, createdAt, name, description = null }) {
    super({ id, createdAt });
    this.#name = Category.#checkName(name);
    this.#description = Category.#checkDescription(description);
  }

  static #checkName(value) {
    if (typeof value !== "string" || !value.trim()) {
      throw new ValidationError("El nombre de la categoría es obligatorio");
    }
    if (value.trim().length > NAME_MAX) {
      throw new ValidationError(`El nombre no puede superar los ${NAME_MAX} caracteres`);
    }
    return value.trim();
  }

  static #checkDescription(value) {
    if (value === null || value === undefined) return null;
    if (typeof value !== "string") throw new ValidationError("La descripción debe ser texto");
    return value.trim() || null;
  }

  static fromRow(row) {
    return new Category(row);
  }

  get name() { return this.#name; }
  get description() { return this.#description; }

  edit(fields) {
    const name = Object.hasOwn(fields, "name") ? Category.#checkName(fields.name) : this.#name;
    const description = Object.hasOwn(fields, "description")
      ? Category.#checkDescription(fields.description)
      : this.#description;
    this.#name = name;
    this.#description = description;
    return this;
  }

  toPersistence() {
    return { name: this.#name, description: this.#description };
  }

  toJSON() {
    return { id: this.id, name: this.#name, description: this.#description };
  }
}
