import { exportMovieReviews } from "../services/reviewExport.service.js";

export async function exportReviews(req, res) {
    const { filename, total } = await exportMovieReviews(req.params.id);
    res.status(201).json({
        success: true,
        message: "Archivo creado correctamente dentro del servidor",
        exito: true,
        mensaje: "Archivo creado correctamente dentro del servidor",
        data: { filename, fileName: filename, totalReviews: total },
    });
}

// Controlador que toma el id de la pelicula a exportar sus reseñas.