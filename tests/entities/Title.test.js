import test from "node:test";
import assert from "node:assert/strict";
import Title from "../../src/entities/Title.js";
import User from "../../src/entities/User.js";

const fields = { title: "Dune", description: "Arrakis", categoryId: 4, year: 2021 };
const admin = new User({ id: 1, username: "Root", email: "r@t.com", role: "admin" });
const ana = new User({ id: 2, username: "Ana", email: "a@t.com" });
const beto = new User({ id: 3, username: "Beto", email: "b@t.com" });

const stored = (extra = {}) =>
  Title.fromRow({ id: 10, ...fields, status: "pendiente", createdBy: 2, category: "Ciencia Ficción", reviewCount: "2", avgRating: 8.5, score: 7.1, ...extra });

test("propose: el admin publica directo y el usuario deja el título pendiente", () => {
  assert.equal(Title.propose(fields, admin).status, "aprobado");
  const t = Title.propose(fields, ana);
  assert.equal(t.status, "pendiente");
  assert.equal(t.createdBy, 2);
});

test("validaciones de campos", () => {
  const bad = (patch) => assert.throws(() => Title.propose({ ...fields, ...patch }, ana), { statusCode: 400 });
  bad({ title: "  " });
  bad({ title: "x".repeat(151) });
  bad({ description: undefined });
  bad({ year: 1800 });
  bad({ year: 2021.5 });
  bad({ categoryId: 0 });
  bad({ posterUrl: "ftp://x.com/a.png" });
  bad({ posterUrl: "no es url" });
  bad({ director: "x".repeat(31) });
  assert.equal(Title.propose({ ...fields, posterUrl: "https://x.com/a.png" }, ana).toJSON().posterUrl, "https://x.com/a.png");
});

test("visibilidad: pendiente solo para admin y autor", () => {
  const t = stored();
  assert.ok(t.isVisibleTo(admin));
  assert.ok(t.isVisibleTo(ana));
  assert.ok(!t.isVisibleTo(beto));
  assert.ok(!t.isVisibleTo(undefined));
  assert.throws(() => t.assertVisibleTo(beto), { statusCode: 404 });
  assert.ok(stored({ status: "aprobado" }).isVisibleTo(undefined));
});

test("edición: admin siempre; autor solo pendiente; ajeno 404 (oculto) o 403 (público)", () => {
  assert.doesNotThrow(() => stored().assertEditableBy(admin));
  assert.doesNotThrow(() => stored().assertEditableBy(ana));
  assert.throws(() => stored().assertEditableBy(beto), { statusCode: 404 });
  const approved = stored({ status: "aprobado" });
  assert.doesNotThrow(() => approved.assertEditableBy(admin));
  assert.throws(() => approved.assertEditableBy(ana), { statusCode: 403 });
  assert.throws(() => approved.assertEditableBy(beto), { statusCode: 403 });
});

test("approve solo funciona una vez", () => {
  const t = stored();
  assert.equal(t.approve().status, "aprobado");
  assert.throws(() => t.approve(), { statusCode: 409 });
});

test("edit devuelve solo lo aplicado y valida", () => {
  const t = stored();
  assert.deepEqual(t.edit({ year: 2022, director: "Villeneuve" }), { year: 2022, director: "Villeneuve" });
  assert.equal(t.year, 2022);
  assert.throws(() => t.edit({ year: 1 }), { statusCode: 400 });
  assert.deepEqual(t.edit({ status: "aprobado", createdBy: 9 }), {}); // campos no editables: se ignoran
  assert.equal(t.createdBy, 2);
  assert.equal(t.status, "pendiente");
});

test("toJSON conserva la forma de la API y convierte estadísticas", () => {
  const json = JSON.parse(JSON.stringify(stored()));
  assert.deepEqual(Object.keys(json), [
    "id", "title", "description", "year", "duration", "ageRating", "posterUrl", "bannerUrl", "trailerUrl",
    "status", "createdBy", "categoryId", "category", "director", "platform", "language", "reviewCount", "avgRating", "score",
  ]);
  assert.equal(json.reviewCount, 2);
  assert.equal(json.category, "Ciencia Ficción");
});

test("una fila antigua con nulos no rompe al cargarse desde la BD", () => {
  assert.doesNotThrow(() => Title.fromRow({ id: 5, title: "Viejo", description: null, categoryId: null, year: 1999, status: "aprobado" }));
});
