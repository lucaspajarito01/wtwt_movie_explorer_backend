import History from '../models/History';

const logHistory = async (userId, actionType, actionDetails = {}) => {
  try {
    await History.create({
      userId,
      actionType,
      actionDetails,
    });
  } catch (error) {
    console.error('Error al registrar el historial:', error);
  }
};

module.exports = logHistory;