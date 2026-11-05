import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { reviewService } from '../container.js';
import { toCsv } from '../utils/csv.js';

export const EXPORTS_DIR = path.resolve(process.cwd(), "exports");

const columnas = [
    { header: "usuario", value: (r) => r.username },
    { header: "calificacion", value: (r) => r.rating },
    { header: "comentario", value: (r) => r.comment },
    { header: "fecha", value: (r) => r.createdAt }
];

export async function exportMovieReviews(movieId) {
  const reviews = (await reviewService.list(movieId)).map((r) => r.toJSON());
}

const content = "﻿" + toCsv(reviews, columnas);

export async function exportMovieReviews(movieId){
    const reviews = (await reviewService.list(movieId)).map((r) => r.toJSON());

    const fileName = `resenas_peliculas_${movieId}_${Date.now()}.csv`;
    await mkdir(EXPORTS_DIR, { recursive: true });
    await writeFile(path.join(EXPORTS_DIR, fileName), content, "utf-8");

    return { fileName, total: reviews.length };
}