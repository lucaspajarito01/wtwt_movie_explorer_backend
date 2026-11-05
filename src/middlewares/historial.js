import History from "../entities/historial.js";

const logHistory = async (userId, actionType, actionDetails = {}) => {
  try {
    await History.create({
      userId,
      actionType,
      actionDetails,
    });
  } catch (error) {
    console.error("Error al registrar el historial:", error);
  }
};

export default logHistory;