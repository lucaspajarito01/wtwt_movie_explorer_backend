import test from "node:test";
import assert from "node:assert/strict";
import Category from "../../src/entities/Category.js";
import CategoryService from "../../src/services/category.service.js";

function setup() {
  const store = new Map();
  let next = 1;
  const dup = () => { const e = new Error("dup"); e.code = "ER_DUP_ENTRY"; return e; };
  const repo = {
    findAll: async () => [...store.values()],
    findById: async (id) => store.get(id) ?? null,
    insert: async (c) => {
      if ([...store.values()].some((x) => x.name === c.name)) throw dup();
      const saved = new Category({ id: next++, ...c.toPersistence() });
      store.set(saved.id, saved);
      return saved;
    },
    update: async (c) => {
      if ([...store.values()].some((x) => x.name === c.name && x.id !== c.id)) throw dup();
      return c;
    },
    delete: async (id) => store.delete(id),
  };
  return new CategoryService(repo);
}

test("crear, duplicado 409, inválido 400", async () => {
  const s = setup();
  await s.create({ name: "Acción" });
  await assert.rejects(s.create({ name: "Acción" }), { statusCode: 409 });
  await assert.rejects(s.create({ name: "" }), { statusCode: 400 });
});

test("editar, inexistente 404 y eliminar", async () => {
  const s = setup();
  const a = await s.create({ name: "Acción" });
  await s.create({ name: "Drama" });
  assert.equal((await s.update(a.id, { description: "x" })).description, "x");
  await assert.rejects(s.update(a.id, { name: "Drama" }), { statusCode: 409 });
  await assert.rejects(s.update(99, { name: "Z" }), { statusCode: 404 });
  await s.remove(a.id);
  await assert.rejects(s.get(a.id), { statusCode: 404 });
  await assert.rejects(s.remove(a.id), { statusCode: 404 });
});
