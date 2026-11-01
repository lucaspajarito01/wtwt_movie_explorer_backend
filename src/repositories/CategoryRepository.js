import BaseRepository from "./BaseRepository.js";
import Category from "../entities/Category.js";

const COLUMNS = "id_categoria AS id, nombre AS name, descripcion AS description";

export default class CategoryRepository extends BaseRepository {
  async findAll(conn) {
    const [rows] = await this.executor(conn).execute(`SELECT ${COLUMNS} FROM categorias ORDER BY nombre`);
    return rows.map((row) => Category.fromRow(row));
  }

  async findById(id, conn) {
    const [rows] = await this.executor(conn).execute(
      `SELECT ${COLUMNS} FROM categorias WHERE id_categoria = ?`,
      [id],
    );
    return rows[0] ? Category.fromRow(rows[0]) : null;
  }

  async insert(category, conn) {
    const { name, description } = category.toPersistence();
    const [result] = await this.executor(conn).execute(
      "INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)",
      [name, description],
    );
    return this.findById(result.insertId, conn);
  }

  async update(category, conn) {
    const { name, description } = category.toPersistence();
    await this.executor(conn).execute(
      "UPDATE categorias SET nombre = ?, descripcion = ? WHERE id_categoria = ?",
      [name, description, category.id],
    );
    return this.findById(category.id, conn);
  }

  async delete(id, conn) {
    const [result] = await this.executor(conn).execute(
      "DELETE FROM categorias WHERE id_categoria = ?",
      [id],
    );
    return result.affectedRows > 0;
  }
}
