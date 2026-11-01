import Title from "../entities/Title.js";
import AppError from "../utils/AppError.js";

function mapDbError(err) {
  if (err.code === "ER_DUP_ENTRY") {
    return new AppError("Ya existe un título con ese nombre y año.", 409);
  }
  if (err.code === "ER_NO_REFERENCED_ROW_2") {
    return new AppError("La categoría indicada no existe", 400);
  }
  return err;
}

const REFS = [
  ["director", "directorId", "director_peliculas", "id_director"],
  ["platform", "platformId", "plataformas", "id_plataforma"],
  ["language", "languageId", "idiomas", "id_idioma"],
];

// Las reglas (visibilidad, quién edita, aprobar una sola vez) viven en la entidad Title.
export default class TitleService {
  #titles;
  #runInTransaction;

  constructor(titleRepository, runInTransaction) {
    this.#titles = titleRepository;
    this.#runInTransaction = runInTransaction;
  }

  // Convierte director/platform/language (nombres) en ids. Solo procesa los que llegaron.
  async #resolveRefs(conn, data) {
    const refs = {};
    for (const [field, idKey, table, idColumn] of REFS) {
      if (Object.hasOwn(data, field)) {
        refs[idKey] = await this.#titles.findOrCreateRef(conn, table, idColumn, data[field]);
      }
    }
    return refs;
  }

  // Público: solo aprobados. Admin: puede filtrar por estado.
  async list({ page, limit, estado, categoryId, sort }, user) {
    const status = user?.role === "admin" ? estado : "aprobado";
    const { items, total } = await this.#titles.findAll({
      status, categoryId, sort, limit, offset: (page - 1) * limit,
    });
    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async get(id, user) {
    const title = await this.#titles.findById(id);
    if (!title) throw new AppError("Título no encontrado", 404);
    title.assertVisibleTo(user);
    return title;
  }

  // Admin crea ya aprobado; un usuario propone y queda pendiente.
  async create(data, user) {
    const title = Title.propose(data, user); // valida los campos
    try {
      const id = await this.#runInTransaction(async (conn) => {
        const refs = await this.#resolveRefs(conn, data);
        return this.#titles.insert(title, refs, conn);
      });
      return await this.#titles.findById(id);
    } catch (err) {
      throw mapDbError(err);
    }
  }

  async update(id, data, user) {
    const title = await this.#titles.findById(id);
    if (!title) throw new AppError("Título no encontrado", 404);
    title.assertEditableBy(user);
    const changes = title.edit(data); // valida y devuelve solo lo que cambia

    try {
      await this.#runInTransaction(async (conn) => {
        const refs = await this.#resolveRefs(conn, changes);
        const { director, platform, language, ...rest } = changes;
        await this.#titles.update(id, { ...rest, ...refs }, conn);
      });
      return await this.#titles.findById(id);
    } catch (err) {
      throw mapDbError(err);
    }
  }

  async approve(id) {
    // El UPDATE condicional evita aprobar dos veces aunque dos admins hagan clic a la vez
    if (await this.#titles.approve(id)) return this.#titles.findById(id);

    const title = await this.#titles.findById(id);
    if (!title) throw new AppError("Título no encontrado", 404);
    title.approve(); // ya estaba aprobado: la entidad lanza el 409
    throw new AppError("El título ya está aprobado", 409);
  }

  async remove(id) {
    if (!(await this.#titles.delete(id))) throw new AppError("Título no encontrado", 404);
  }
}
