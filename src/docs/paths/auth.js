import {
  badRequest,
  bearer,
  envelope,
  err,
  ok,
  ref,
  requestBody,
  tooManyRequests,
  unauthorized,
} from "../helpers.js";

const user = { id: 3, username: "Karen", email: "karen@test.com", role: "usuario" };
const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoidXN1YXJpbyIsInN1YiI6IjMifQ.firma";

export const authPaths = {
  "/auth/register": {
    post: {
      tags: ["Auth"],
      operationId: "register",
      summary: "Registrar un usuario",
      description:
        "Crea una cuenta con rol `usuario` (el rol no se puede elegir) y devuelve un JWT. " +
        "La contraseña se guarda con hash bcrypt. Límite estricto de intentos.",
      security: [],
      requestBody: requestBody("RegisterInput", {
        valido: {
          summary: "Registro válido",
          value: { username: "Karen", email: "karen@test.com", password: "Clave1234" },
        },
      }),
      responses: {
        201: ok("Usuario creado", envelope(ref("AuthData")), {
          success: true,
          message: "Usuario registrado correctamente",
          data: { user, token },
        }),
        400: badRequest([
          { field: "email", message: "El correo no es válido" },
          { field: "password", message: "La contraseña debe tener entre 8 y 72 caracteres" },
        ]),
        409: err("El correo ya está registrado", "El correo ya está registrado"),
        429: tooManyRequests,
      },
    },
  },
  "/auth/login": {
    post: {
      tags: ["Auth"],
      operationId: "login",
      summary: "Iniciar sesión",
      description:
        "Valida las credenciales y devuelve un JWT (vigencia 1 h por defecto). " +
        "Ante credenciales incorrectas responde siempre el mismo mensaje, sin revelar cuál dato falló.",
      security: [],
      requestBody: requestBody("LoginInput", {
        valido: {
          summary: "Credenciales válidas",
          value: { email: "karen@test.com", password: "Clave1234" },
        },
      }),
      responses: {
        200: ok("Sesión iniciada", envelope(ref("AuthData")), {
          success: true,
          message: "Inicio de sesión exitoso",
          data: { user, token },
        }),
        400: badRequest([{ field: "email", message: "El correo no es válido" }]),
        401: err("Credenciales incorrectas", "Credenciales inválidas"),
        403: err("La cuenta está inactiva", "La cuenta está inactiva"),
        429: tooManyRequests,
      },
    },
  },
  "/auth/me": {
    get: {
      tags: ["Auth"],
      operationId: "getMe",
      summary: "Usuario de la sesión actual",
      description: "Devuelve el usuario dueño del token. Útil para recuperar la sesión en el frontend.",
      security: bearer,
      responses: {
        200: ok(
          "Usuario autenticado",
          envelope({ type: "object", properties: { user: ref("SessionUser") } }, { message: false }),
          { success: true, data: { user: { ...user, estado: "activo" } } },
        ),
        401: unauthorized,
      },
    },
  },
};
