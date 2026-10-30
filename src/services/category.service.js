import * as Category from "../models/category.model.js";
import AppError from "../utils/AppError.js";

export async function list() {
  return Category.findAll();
}

export async function get(id) {
  const category = await Category.findById(id);
  if (!category) throw new AppError("Categoría no encontrada", 404);
  return category;
}

export async function create(fields) {
  try {
    return await Category.create(fields);
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      throw new AppError("Ya existe una categoría con ese nombre", 409);
    }
    throw err;
  }
}

export async function update(id, fields) {
  try {
    const category = await Category.update(id, fields);
    if (!category) throw new AppError("Categoría no encontrada", 404);
    return category;
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      throw new AppError("Ya existe una categoría con ese nombre", 409);
    }
    throw err;
  }
}

export async function remove(id) {
  const deleted = await Category.remove(id);
  if (!deleted) throw new AppError("Categoría no encontrada", 404);
}
