import passport from "../config/passport.js";
import AppError from "../utils/AppError.js";

// Exige un JWT válido. Deja el usuario en req.user.
export function authenticate(req, res, next) {
    passport.authenticate("jwt", { session: false }, (err, user, info) => {
        if (err) return next(err);

        if (!user) {
            const message =
                info?.name === "TokenExpiredError"
                    ? "El token ha expirado"
                    : "Token inválido o no proporcionado";
            return next(new AppError(message, 401));
        }

        req.user = user;
        next();
    })(req, res, next);
}

// Exige que el usuario autenticado tenga alguno de los roles que definimos
export const authorize =
    (...allowedRoles) =>
        (req, res, next) => {
            if (!req.user) return next(new AppError("No autenticado", 401));

            if (!allowedRoles.includes(req.user.role)) {
                return next(
                    new AppError("No tienes permisos para realizar esta acción", 403),
                );
            }
            next();
        };
