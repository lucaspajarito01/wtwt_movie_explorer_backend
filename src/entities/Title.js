import BaseEntity from "./BaseEntity.js";
import AppError, { ValidationError } from "../utils/AppError.js";

export const TITLE_STATUS = Object.freeze({ APPROVED: "aprobado", PENDING: "pendiente" });
export const MIN_YEAR = 1888;

// Reglas de cada campo editable: [etiqueta, máximo, obligatorio]
const TEXT_RULES = {
  title: ["El título", 150, true],
  description: ["La descripción", 5000, true],
  duration: ["La duración", 50, false],
  ageRating: ["La edad recomendada", 20, false],
  director: ["El director", 30, false],
  platform: ["La plataforma", 30, false],
  language: ["El idioma", 30, false],
};
const URL_FIELDS = { posterUrl: "El póster", bannerUrl: "El banner", trailerUrl: "El tráiler" };

function checkText(field, value) {
  const [label, max, required] = TEXT_RULES[field];
  if (value === null || value === undefined) {
    if (required) throw new ValidationError(`${label} es obligatorio`);
    return null;
  }
  if (typeof value !== "string") throw new ValidationError(`${label} debe ser texto`);
  const text = value.trim();
  if (!text) throw new ValidationError(`${label} no puede estar vacío`);
  if (text.length > max) throw new ValidationError(`${label} no puede superar los ${max} caracteres`);
  return text;
}

function checkUrl(field, value) {
  if (value === null || value === undefined) return null;
  const label = URL_FIELDS[field];
  let url;
  try {
    url = new URL(String(value).trim());
  } catch {
    throw new ValidationError(`${label} debe ser una URL http(s) válida`);
  }
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new ValidationError(`${label} debe ser una URL http(s) válida`);
  }
  if (String(value).trim().length > 255) {
    throw new ValidationError(`${label} no puede superar los 255 caracteres`);
  }
  return String(value).trim();
}

function checkYear(value) {
  const max = new Date().getFullYear() + 5;
  if (!Number.isInteger(value) || value < MIN_YEAR || value > max) {
    throw new ValidationError(`El año debe estar entre ${MIN_YEAR} y ${max}`);
  }
  return value;
}

function checkCategoryId(value) {
  return BaseEntity.assertId(value, "categoryId");
}

// Valida un campo editable y devuelve su valor normalizado.
function normalize(field, value) {
  if (field in TEXT_RULES) return checkText(field, value);
  if (field in URL_FIELDS) return checkUrl(field, value);
  if (field === "year") return checkYear(value);
  if (field === "categoryId") return checkCategoryId(value);
  throw new ValidationError(`Campo no editable: ${field}`);
}

export const EDITABLE_FIELDS = [
  ...Object.keys(TEXT_RULES), ...Object.keys(URL_FIELDS), "year", "categoryId",
];

export default class Title extends BaseEntity {
  #data;    // campos editables ya validados
  #status;
  #createdBy;
  #meta;    // datos de solo lectura que calcula la base de datos (categoría, estadísticas)

  constructor({ id, createdAt, status = TITLE_STATUS.PENDING, createdBy = null, meta = {}, ...fields }) {
    super({ id, createdAt });
    if (!Object.values(TITLE_STATUS).includes(status)) {
      throw new ValidationError(`Estado desconocido: ${status}`);
    }
    this.#status = status;
    this.#createdBy = createdBy === null || createdBy === undefined ? null : Number(createdBy);
    this.#meta = meta;
    this.#data = {};
    // Una entidad nueva se valida completa; una que viene de la BD ya fue validada al guardarse
    // (y puede traer nulos legítimos, p. ej. categoryId tras borrar la categoría).
    const fromDb = this.isPersisted();
    for (const field of EDITABLE_FIELDS) {
      const value = fields[field] ?? null;
      this.#data[field] = fromDb ? value : normalize(field, value);
    }
  }

  // Un título propuesto: el admin lo publica directo; un usuario normal lo deja pendiente.
  static propose(fields, user) {
    const admin = user.isAdmin?.() ?? user.role === "admin";
    return new Title({
      ...fields,
      status: admin ? TITLE_STATUS.APPROVED : TITLE_STATUS.PENDING,
      createdBy: user.id,
    });
  }

  // Reconstruye desde una fila de MySQL con alias (ver TitleRepository).
  static fromRow(row) {
    const { id, createdAt, status, createdBy, category, reviewCount, avgRating, score, ...rest } = row;
    const fields = Object.fromEntries(EDITABLE_FIELDS.map((f) => [f, rest[f] ?? null]));
    return new Title({
      id, createdAt, status, createdBy, ...fields,
      meta: { category: category ?? null, reviewCount: Number(reviewCount ?? 0), avgRating: avgRating ?? null, score: score ?? null },
    });
  }

  get title() { return this.#data.title; }
  get description() { return this.#data.description; }
  get categoryId() { return this.#data.categoryId; }
  get year() { return this.#data.year; }
  get status() { return this.#status; }
  get createdBy() { return this.#createdBy; }

  // ---- estado
  isApproved() { return this.#status === TITLE_STATUS.APPROVED; }
  isPending() { return this.#status === TITLE_STATUS.PENDING; }

  // Aprobar solo tiene sentido una vez.
  approve() {
    if (this.isApproved()) throw new AppError("El título ya está aprobado", 409);
    this.#status = TITLE_STATUS.APPROVED;
    return this;
  }

  // ---- reglas de acceso
  isOwnedBy(user) {
    return Boolean(user) && this.#createdBy !== null && this.#createdBy === Number(user.id);
  }

  // Un pendiente solo lo ve un admin o quien lo propuso.
  isVisibleTo(user) {
    return this.isApproved() || user?.role === "admin" || this.isOwnedBy(user);
  }

  assertVisibleTo(user) {
    if (!this.isVisibleTo(user)) throw new AppError("Título no encontrado", 404);
  }

  // Admin: siempre. Autor: solo mientras esté pendiente. Los demás: 404 si está oculto, 403 si es público.
  assertEditableBy(user) {
    if (user?.role === "admin") return;
    this.assertVisibleTo(user);
    if (!this.isOwnedBy(user) || this.isApproved()) {
      throw new AppError("No tienes permisos para editar este título", 403);
    }
  }

  // Valida los cambios y devuelve solo lo aplicado (el repositorio persiste exactamente eso).
  edit(fields) {
    const changes = {};
    for (const field of EDITABLE_FIELDS) {
      if (Object.hasOwn(fields, field)) changes[field] = normalize(field, fields[field]);
    }
    Object.assign(this.#data, changes);
    return changes;
  }

  toPersistence() {
    return { ...this.#data, status: this.#status, createdBy: this.#createdBy };
  }

  toJSON() {
    const d = this.#data;
    return {
      id: this.id,
      title: d.title,
      description: d.description,
      year: d.year,
      duration: d.duration,
      ageRating: d.ageRating,
      posterUrl: d.posterUrl,
      bannerUrl: d.bannerUrl,
      trailerUrl: d.trailerUrl,
      status: this.#status,
      createdBy: this.#createdBy,
      categoryId: d.categoryId,
      category: this.#meta.category ?? null,
      director: d.director,
      platform: d.platform,
      language: d.language,
      reviewCount: this.#meta.reviewCount ?? 0,
      avgRating: this.#meta.avgRating ?? null,
      score: this.#meta.score ?? null,
    };
  }
}
