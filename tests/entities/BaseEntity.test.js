import test from "node:test";
import assert from "node:assert/strict";
import BaseEntity from "../../src/entities/BaseEntity.js";
import Review from "../../src/entities/Review.js";

test("BaseEntity es abstracta", () => {
  assert.throws(() => new BaseEntity(), TypeError);
});

test("equals compara tipo e id; una entidad sin guardar no es igual a nada", () => {
  const base = { movieId: 1, userId: 2, rating: 5 };
  const a = new Review({ id: 7, ...base });
  assert.ok(a.equals(new Review({ id: 7, ...base })));
  assert.ok(!a.equals(new Review({ id: 8, ...base })));
  const draft = Review.create(base);
  assert.equal(draft.isPersisted(), false);
  assert.ok(!draft.equals(draft));
});

test("id inválido se rechaza", () => {
  assert.throws(() => new Review({ id: 0, movieId: 1, userId: 1, rating: 5 }), { statusCode: 400 });
});
