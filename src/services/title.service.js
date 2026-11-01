import { withTransaction } from "../config/db.js";
import * as Title from "../models/title.model.js";
import AppError from "../utils/AppError.js";
import { ROLES } from "../utils/roles.js";

const isAdmin = (user) => user?.role === ROLES.ADMIN;

function mapDbError(err) {
  if (err.code === "ER_DUP_ENTRY") {
    return new AppError("Ya existe un título con ese nombre y año.", 409);
  }
  if (err.code === "ER_NO_REFERENCED_ROW_2") {
    return new AppError("La categoría indicada no existe", 400);
  }
  return err;
}

// Convierte director/platform/language (nombres) en ids. Solo procesa los que llegaron.
async function resolveRefs(conn, data) {
  const refs = {};
  if (Object.hasOwn(data, "director")) {
    refs.directorId = await Title.findOrCreateRef(conn, "director_peliculas", "id_director", data.director);
  }
  if (Object.hasOwn(data, "platform")) {
    refs.platformId = await Title.findOrCreateRef(conn, "plataformas", "id_plataforma", data.platform);
  }
  if (Object.hasOwn(data, "language")) {
    refs.languageId = await Title.findOrCreateRef(conn, "idiomas", "id_idioma", data.language);
  }
  return refs;
}

// Público: solo aprobados. Admin: puede filtrar por estado.
export async function list({ page, limit, estado, categoryId, sort }, user) {
  const status = isAdmin(user) ? estado : "aprobado";
  const { items, total } = await Title.findAll({
    status,
    categoryId,
    sort,
    limit,
    offset: (page - 1) * limit,
  });
  return {
    items,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

// Un título pendiente solo lo ve un admin o quien lo propuso (para los demás: 404).
export async function get(id, user) {
  const title = await Title.findById(id);
  const canSee =
    title &&
    (title.status === "aprobado" ||
      isAdmin(user) ||
      (user && title.createdBy === user.id));
  if (!canSee) throw new AppError("Título no encontrado", 404);
  return title;
}

// Admin crea ya aprobado; un usuario propone y queda pendiente (la aprobación es ME-15).
export async function create(data, user) {
  const status = isAdmin(user) ? "aprobado" : "pendiente";
  try {
    const id = await withTransaction(async (conn) => {
      const refs = await resolveRefs(conn, data);
      const { director, platform, language, ...rest } = data;
      return Title.insert(conn, { ...rest, ...refs, status, createdBy: user.id });
    });
    return await Title.findById(id);
  } catch (err) {
    throw mapDbError(err);
  }
}

export async function update(id, data, user) {
  const existing = await Title.findById(id);
  if (!existing) throw new AppError("Título no encontrado", 404);

  if (!isAdmin(user)) {
    const isOwner = existing.createdBy === user.id;
    // Pendiente ajeno: no existe para este usuario
    if (existing.status !== "aprobado" && !isOwner) {
      throw new AppError("Título no encontrado", 404);
    }
    // Solo el autor puede editar, y únicamente mientras esté pendiente
    if (!isOwner || existing.status === "aprobado") {
      throw new AppError("No tienes permisos para editar este título", 403);
    }
  }

  try {
    await withTransaction(async (conn) => {
      const refs = await resolveRefs(conn, data);
      const { director, platform, language, ...rest } = data;
      await Title.update(conn, id, { ...rest, ...refs });
    });
    return await Title.findById(id);
  } catch (err) {
    throw mapDbError(err);
  }
}

// Funciones para admin: aprobar o rechazar un titulo pendiente o retirar uno aprobado.
export async function approve(id) {
  // El UPDATE condicional evita aprobar dos veces aunque dos admins hagan clic a la vez
  if (await Title.approve(id)) return Title.findById(id);

  const existing = await Title.findById(id);
  if (!existing) throw new AppError("Título no encontrado", 404);
  throw new AppError("El título ya está aprobado", 409);
}

export async function remove(id) {
  if (!(await Title.remove(id))) throw new AppError("Título no encontrado", 404);
}