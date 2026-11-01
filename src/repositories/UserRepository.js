import BaseRepository from "./BaseRepository.js";
import User from "../entities/User.js";

const SELECT = `
  SELECT u.id_usuario AS id, u.nombre AS username, u.correo AS email,
         u.contrasena AS password_hash, u.estado, r.nombre AS role,
         u.fecha_de_creacion AS createdAt
    FROM usuarios u
    JOIN roles r ON r.id = u.role_id`;

export default class UserRepository extends BaseRepository {
  async findByEmail(email, conn) {
    const [rows] = await this.executor(conn).execute(`${SELECT} WHERE u.correo = ?`, [email]);
    return rows[0] ? User.fromRow(rows[0]) : null;
  }

  async findById(id, conn) {
    const [rows] = await this.executor(conn).execute(`${SELECT} WHERE u.id_usuario = ?`, [id]);
    return rows[0] ? User.fromRow(rows[0]) : null;
  }

  // Guarda un usuario nuevo y devuelve la entidad ya persistida (con id).
  async save(user, conn) {
    const { username, email, passwordHash, role } = user.toPersistence();
    const [result] = await this.executor(conn).execute(
      `INSERT INTO usuarios (nombre, correo, contrasena, role_id)
        SELECT ?, ?, ?, id FROM roles WHERE nombre = ?`,
      [username, email, passwordHash, role],
    );
    if (!result.affectedRows) {
      throw new Error(`El rol "${role}" no existe en la tabla roles`);
    }
    return this.findById(result.insertId, conn);
  }
}
