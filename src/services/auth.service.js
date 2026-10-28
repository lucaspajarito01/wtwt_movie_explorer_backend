import bcrypt from "bcrypt";
import config from "../config/env.js";
import AppError from "../utils/AppError.js";
import { signToken } from "../utils/jwt.js";
import * as User from "../models/user.model.js";

// Hash falso para que el login tarde igual exista o no el email
const DUMMY_HASH = bcrypt.hashSync("dummy-password", config.bcryptRounds);

export async function register({ username, email, password }) {
    const passwordHash = await bcrypt.hash(password, config.bcryptRounds);

    let id;
    try {
        id = await User.create({ username, email, passwordHash });
    } catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
            const key = err.sqlMessage?.match(/for key '(.+?)'/)?.[1] ?? "";
            const campo = key.includes("username") ? "nombre de usuario" : "correo";
            throw new AppError(`El ${campo} ya está registrado`, 409);
        }
        throw err;
    }

    const user = { id, username, email, role: "user" };
    return { user, token: signToken(user) };
}

export async function login({ email, password }) {
    const found = await User.findByEmail(email);
    const ok = await bcrypt.compare(
        password,
        found ? found.password_hash : DUMMY_HASH,
    );

    if (!found || !ok) {
        throw new AppError("Credenciales inválidas", 401);
    }

    const user = {
        id: found.id,
        username: found.username,
        email: found.email,
        role: found.role,
    };
    return { user, token: signToken(user) };
}
