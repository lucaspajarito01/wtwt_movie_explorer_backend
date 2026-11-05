import { DataTypes } from 'sequelize';
const sequelize = require('../config/database'); // Asegúrate de que este archivo apunta a tu configuración de Sequelize

const History = sequelize.define('History', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  actionType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  actionDetails: {
    type: DataTypes.JSON, // Para almacenar detalles adicionales de la acción
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = History;