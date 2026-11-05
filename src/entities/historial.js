import pool from "../config/db.js";

const History = {
  async create({ userId, actionType, actionDetails = {} }) {
    const [result] = await pool.execute(
      `INSERT INTO historial_actividad (id_usuario, tipo_accion, detalles)
       VALUES (?, ?, ?)`,
      [userId, actionType, JSON.stringify(actionDetails ?? {})],
    );
    return {
      id: result.insertId,
      userId,
      actionType,
      actionDetails,
      createdAt: new Date(),
    };
  },
};

export default History;