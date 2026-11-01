import test from "node:test";
import assert from "node:assert/strict";
import Review from "../../src/entities/Review.js";
import VoteService from "../../src/services/vote.service.js";

const review = new Review({ id: 1, movieId: 10, userId: 1, rating: 8 });
const reviews = { findByIdForShare: async (id) => (id === 1 ? review : null) };
const log = [];
const votes = {
  upsert: async (vote) => log.push(["upsert", vote.reviewId, vote.userId, vote.type]),
  remove: async (reviewId, userId) => log.push(["remove", reviewId, userId]),
  summarize: async (reviewId) => ({ reviewId, likes: 1, dislikes: 0, userVote: "like" }),
};
const service = new VoteService(reviews, votes, async (fn) => fn({}));

test("votar la propia reseña -> 403 y no escribe nada", async () => {
  await assert.rejects(service.vote(1, { id: 1 }, "like"), { statusCode: 403 });
  assert.equal(log.length, 0);
});

test("votar reseña ajena registra el voto", async () => {
  const out = await service.vote(1, { id: 2 }, "like");
  assert.deepEqual(log[0], ["upsert", 1, 2, "like"]);
  assert.equal(out.likes, 1);
});

test("tipo de voto inválido -> 400 sin tocar la base", async () => {
  const before = log.length;
  assert.throws(() => service.vote(1, { id: 2 }, "love"), { statusCode: 400 });
  assert.equal(log.length, before);
});

test("retirar voto ajeno registra el borrado", async () => {
  await service.unvote(1, { id: 2 });
  assert.deepEqual(log.at(-1), ["remove", 1, 2]);
});

test("reseña inexistente -> 404", async () => {
  await assert.rejects(service.vote(5, { id: 2 }, "like"), { statusCode: 404 });
  await assert.rejects(service.unvote(5, { id: 2 }), { statusCode: 404 });
});

test("reintenta ante deadlock y falla si persiste", async () => {
  let n = 0;
  const flaky = new VoteService(reviews, { ...votes, upsert: async () => { if (++n < 3) { const e = new Error("d"); e.code = "ER_LOCK_DEADLOCK"; throw e; } } }, async (fn) => fn({}));
  await flaky.vote(1, { id: 2 }, "like");
  assert.equal(n, 3);
  const dead = new VoteService(reviews, { ...votes, upsert: async () => { const e = new Error("d"); e.code = "ER_LOCK_DEADLOCK"; throw e; } }, async (fn) => fn({}));
  await assert.rejects(dead.vote(1, { id: 2 }, "like"), { code: "ER_LOCK_DEADLOCK" });
});
