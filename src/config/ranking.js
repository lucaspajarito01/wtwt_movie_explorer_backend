// Parámetros de la fórmula de ranking

export const RANKING = Object.freeze({
  priorWeight: 3, // C: "reseñas virtuales" que acercan a un título con pocas reseñas al promedio global
  defaultMean: 5.5, // promedio global cuando todavía no existe ninguna reseña
  halfLifeDays: 180, // cada 180 días una reseña pesa la mitad
  voteStep: 0.25, // cada like neto suma 25% de peso a la reseña (cada dislike neto lo resta)
  minReviewWeight: 0.5, // peso mínimo de una reseña (por votos)
  maxReviewWeight: 3, // peso máximo de una reseña (por votos)
});