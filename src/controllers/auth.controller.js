import * as authService from "../services/auth.service.js";

export async function register(req, res) {
    const { username, email, password } = req.body;
    const data = await authService.register({ username, email, password });
    res.status(201).json({
        success: true,
        message: "Usuario registrado correctamente", data
    });
}

export async function login(req, res) {
    const { email, password } = req.body;
    const data = await authService.login({ email, password });
    res.json({
        success: true,
        message: "Inicio de sesión exitoso",
        data
    });
}
