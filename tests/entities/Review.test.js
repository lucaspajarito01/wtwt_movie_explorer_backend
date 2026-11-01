import test from "node:test";
import assert from "node:assert/strict";
import Review from "../../src/entities/Review.js";

const base = { id: 1, movieId: 10, userId: 5, title: "Genial", comment: "Muy buena", rating: 8 };
const owner = { id: 5, role: "usuario" };
const other = { id: 6, role: "usuario" };
const admin = { id: 1, role: "admin" };

test("rating solo acepta enteros de 1 a 10", () => {
  for (const bad of [0, 11, 5.5, "8", null, undefined, NaN]) {
    assert.throws(() => Review.create({ ...base, rating: bad }), { statusCode: 400 }, `rating ${bad}`);
  }
  for (const ok of [1, 10]) assert.equal(Review.create({ ...base, rating: ok }).rating, ok);
});

test("el título no puede superar 100 caracteres", () => {
  assert.throws(() => Review.create({ ...base, title: "x".repeat(101) }), { statusCode: 400 });
});

test("solo el autor puede editar", () => {
  const r = new Review(base);
  assert.doesNotThrow(() => r.assertEditableBy(owner));
  assert.throws(() => r.assertEditableBy(other), { statusCode: 403 });
  assert.throws(() => r.assertEditableBy(admin), { statusCode: 403 });
});

test("el autor y el admin pueden eliminar; otro usuario no", () => {
  const r = new Review(base);
  assert.doesNotThrow(() => r.assertDeletableBy(owner));
  assert.doesNotThrow(() => r.assertDeletableBy(admin));
  assert.throws(() => r.assertDeletableBy(other), { statusCode: 403 });
});

test("no se puede votar la propia reseña", () => {
  const r = new Review(base);
  assert.throws(() => r.assertVotableBy(owner), { statusCode: 403, message: "No puedes votar tu propia reseña" });
  assert.doesNotThrow(() => r.assertVotableBy(other));
});

test("edit aplica cambios parciales y no deja la entidad a medias si hay un error", () => {
  const r = new Review(base);
  r.edit({ rating: 3 });
  assert.equal(r.rating, 3);
  assert.equal(r.title, "Genial");
  assert.throws(() => r.edit({ title: "Nuevo", rating: 99 }), { statusCode: 400 });
  assert.equal(r.title, "Genial"); // el título no cambió porque el rating falló
  assert.equal(r.rating, 3);
});

test("toJSON conserva la forma de la API y omite username si no viene del JOIN", () => {
  const createdAt = new Date("2026-10-01T00:00:00Z");
  const json = JSON.parse(JSON.stringify(new Review({ ...base, createdAt })));
  assert.deepEqual(Object.keys(json), ["id", "movieId", "userId", "title", "comment", "rating", "createdAt"]);
  assert.equal(JSON.parse(JSON.stringify(new Review({ ...base, username: "Ana" }))).username, "Ana");
});
