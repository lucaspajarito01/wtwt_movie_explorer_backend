import * as reviewService from "../services/review.service.js";

function reviewFields(req) {
  const fields = {};
  for (const field of ["movieId", "rating", "title", "comment"]) {
    if (Object.hasOwn(req.body, field)) fields[field] = req.body[field];
  }
  return fields;
}

export async function create(req, res) {
  const review = await reviewService.create(
    reviewFields(req),
    req.user.id,
  );
  res.status(201).json({
    success: true,
    message: "Reseña creada correctamente",
    data: review,
  });
}

export async function update(req, res) {
  const review = await reviewService.update(
    req.params.id,
    req.user.id,
    reviewFields(req),
  );
  res.json({
    success: true,
    message: "Reseña actualizada correctamente",
    data: review,
  });
}

export async function remove(req, res) {
  await reviewService.remove(req.params.id, req.user.id);
  res.json({ success: true, message: "Reseña eliminada correctamente" });
}
