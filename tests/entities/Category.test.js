import test from "node:test";
import assert from "node:assert/strict";
import Category from "../../src/entities/Category.js";

test("nombre obligatorio y máximo 50", () => {
  assert.throws(() => new Category({ name: " " }), { statusCode: 400 });
  assert.throws(() => new Category({ name: "x".repeat(51) }), { statusCode: 400 });
  assert.equal(new Category({ name: " Acción " }).name, "Acción");
});

test("edit parcial y toJSON", () => {
  const c = new Category({ id: 1, name: "Acción", description: "Adrenalina" });
  c.edit({ description: "Nueva" });
  assert.deepEqual(c.toJSON(), { id: 1, name: "Acción", description: "Nueva" });
  assert.throws(() => c.edit({ name: "" }), { statusCode: 400 });
  assert.equal(c.name, "Acción");
});
