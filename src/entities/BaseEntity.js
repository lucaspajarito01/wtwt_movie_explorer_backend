import { ValidationError } from "../utils/AppError.js";

// Clase abstracta: define lo común a todas las entidades (identidad y fecha de creación).
// No se puede instanciar directamente; cada subclase debe implementar toJSON().
export default class BaseEntity {
  #id;
  #createdAt;

  constructor({ id = null, createdAt = null } = {}) {
    if (new.target === BaseEntity) {
      throw new TypeError("BaseEntity es abstracta y no puede instanciarse");
    }
    this.#id = id === null || id === undefined ? null : BaseEntity.assertId(id, "id");
    this.#createdAt = createdAt ? new Date(createdAt) : null;
  }

  get id() {
    return this.#id;
  }

  get createdAt() {
    return this.#createdAt;
  }

  // Una entidad nueva (aún sin guardar en la base de datos) no tiene id.
  isPersisted() {
    return this.#id !== null;
  }

  // Dos entidades son iguales si son del mismo tipo y tienen el mismo id.
  equals(other) {
    return (
      other instanceof this.constructor &&
      this.isPersisted() &&
      this.#id === other.id
    );
  }

  // Polimorfismo: cada entidad decide cómo se serializa hacia la API.
  toJSON() {
    throw new Error(`${this.constructor.name} debe implementar toJSON()`);
  }

  // Utilidad compartida por las subclases para validar identificadores.
  static assertId(value, field) {
    const n = Number(value);
    if (!Number.isInteger(n) || n < 1) {
      throw new ValidationError(`${field} debe ser un entero positivo`);
    }
    return n;
  }
}
