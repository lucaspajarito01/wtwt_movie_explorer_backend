import { envelope, ok } from "../helpers.js";

export const healthPaths = {
  "/health": {
    get: {
      tags: ["Health"],
      operationId: "getHealth",
      summary: "Estado de la API",
      description: "Comprueba que el servidor responde. No requiere autenticación.",
      security: [],
      responses: {
        200: ok(
          "API operativa",
          {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
              version: { type: "string", description: "Versión semver de package.json" },
              timestamp: { type: "string", format: "date-time" },
            },
          },
          {
            success: true,
            message: "API operativa",
            version: "0.5.0",
            timestamp: "2026-10-31T14:00:00.000Z",
          },
        ),
      },
    },
  },
};
