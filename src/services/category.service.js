import Category from "../entities/Category.js";
import AppError from "../utils/AppError.js";

const duplicate = () => new AppError("Ya existe una categoría con ese nombre", 409);

export default class CategoryService {
  #categories;

  constructor(categoryRepository) {
    this.#categories = categoryRepository;
  }

  list() {
    return this.#categories.findAll();
  }

  async get(id) {
    const category = await this.#categories.findById(id);
    if (!category) throw new AppError("Categoría no encontrada", 404);
    return category;
  }

  async create(fields) {
    const category = new Category({ name: fields.name, description: fields.description });
    try {
      return await this.#categories.insert(category);
    } catch (err) {
      if (err.code === "ER_DUP_ENTRY") throw duplicate();
      throw err;
    }
  }

  async update(id, fields) {
    const category = await this.get(id);
    category.edit(fields);
    try {
      return await this.#categories.update(category);
    } catch (err) {
      if (err.code === "ER_DUP_ENTRY") throw duplicate();
      throw err;
    }
  }

  async remove(id) {
    if (!(await this.#categories.delete(id))) throw new AppError("Categoría no encontrada", 404);
  }
}
