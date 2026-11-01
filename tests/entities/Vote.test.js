import test from "node:test";
import assert from "node:assert/strict";
import Vote, { VoteSummary } from "../../src/entities/Vote.js";

test("solo like o dislike", () => {
  assert.equal(Vote.cast({ reviewId: 1, user: { id: 2 }, type: "like" }).type, "like");
  assert.throws(() => Vote.cast({ reviewId: 1, user: { id: 2 }, type: "love" }), { statusCode: 400 });
  assert.throws(() => Vote.cast({ reviewId: 0, user: { id: 2 }, type: "like" }), { statusCode: 400 });
});

test("VoteSummary es inmutable y calcula el neto", () => {
  const s = new VoteSummary({ reviewId: 1, likes: "3", dislikes: 1, userVote: "like" });
  assert.equal(s.netScore, 2);
  assert.deepEqual(JSON.parse(JSON.stringify(s)), { reviewId: 1, likes: 3, dislikes: 1, userVote: "like" });
  assert.ok(Object.isFrozen(s));
});
