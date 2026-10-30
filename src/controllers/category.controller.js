import * as categoryService from "../services/category.service.js";

export async function list(req, res) {
  const categories = await categoryService.list();
  res.json({ success: true, data: categories });
}

export async function get(req, res) {
  const category = await categoryService.get(req.params.id);
  res.json({ success: true, data: category });
}

export async function create(req, res) {
  const category = await categoryService.create(req.body);
  res.status(201).json({
    success: true,
    message: "Categoría creada correctamente",
    data: category,
  });
}

export async function update(req, res) {
  const category = await categoryService.update(req.params.id, req.body);
  res.json({
    success: true,
    message: "Categoría actualizada correctamente",
    data: category,
  });
}

export async function remove(req, res) {
  await categoryService.remove(req.params.id);
  res.json({ success: true, message: "Categoría eliminada correctamente" });
}
