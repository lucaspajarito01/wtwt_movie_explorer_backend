import test from "node:test";
import assert from "node:assert/strict";
import Review from "../../src/entities/Review.js";
import ReviewService from "../../src/services/review.service.js";

// Repositorio falso en memoria: gracias a la inyección de dependencias no hace falta MySQL.
function setup({ movies = [10] } = {}) {
  const store = new Map();
  let nextId = 1;
  const calls = { tx: 0 };
  const repo = {
    movieExists: async (id) => movies.includes(id),
    findById: async (id) => store.get(id) ?? null,
    findByMovie: async (movieId) => [...store.values()].filter((r) => r.movieId === movieId),
    insert: async (review) => {
      const saved = new Review({ id: nextId++, ...review.toPersistence() });
      store.set(saved.id, saved);
      return saved;
    },
    update: async (review) => review,
    delete: async (id) => store.delete(id),
  };
  const tx = async (fn) => { calls.tx++; return fn({}); };
  return { service: new ReviewService(repo, tx), store, calls };
}
const ana = { id: 1, role: "usuario" };
const beto = { id: 2, role: "usuario" };
const admin = { id: 9, role: "admin" };

test("crear: usa transacción y asocia la reseña al usuario autenticado", async () => {
  const { service, calls } = setup();
  const r = await service.create({ movieId: 10, rating: 7, comment: "ok", userId: 999 }, ana);
  assert.equal(calls.tx, 1);
  assert.equal(r.userId, 1); // un userId enviado en el body no se respeta
});

test("crear: película inexistente -> 404; rating inválido -> 400", async () => {
  const { service } = setup();
  await assert.rejects(service.create({ movieId: 77, rating: 7 }, ana), { statusCode: 404 });
  await assert.rejects(service.create({ movieId: 10, rating: 11 }, ana), { statusCode: 400 });
});

test("editar: solo el autor; ajeno 403; inexistente 404", async () => {
  const { service } = setup();
  const r = await service.create({ movieId: 10, rating: 7 }, ana);
  const edited = await service.update(r.id, ana, { rating: 9 });
  assert.equal(edited.rating, 9);
  await assert.rejects(service.update(r.id, beto, { rating: 1 }), { statusCode: 403 });
  await assert.rejects(service.update(999, ana, { rating: 1 }), { statusCode: 404 });
});

test("eliminar: autor y admin sí; otro usuario no", async () => {
  const { service, store } = setup();
  const r1 = await service.create({ movieId: 10, rating: 7 }, ana);
  await assert.rejects(service.remove(r1.id, beto), { statusCode: 403 });
  await service.remove(r1.id, admin);
  assert.equal(store.size, 0);
  const r2 = await service.create({ movieId: 10, rating: 5 }, ana);
  await service.remove(r2.id, ana);
  assert.equal(store.size, 0);
});

test("listar: película inexistente -> 404", async () => {
  const { service } = setup();
  await assert.rejects(service.list(77), { statusCode: 404 });
  assert.deepEqual(await service.list(10), []);
});
