import test from "node:test";
import assert from "node:assert/strict";
import Title from "../../src/entities/Title.js";
import User from "../../src/entities/User.js";
import TitleService from "../../src/services/title.service.js";

const admin = new User({ id: 1, username: "Root", email: "r@t.com", role: "admin" });
const ana = new User({ id: 2, username: "Ana", email: "a@t.com" });
const beto = new User({ id: 3, username: "Beto", email: "b@t.com" });
const data = { title: "Dune", description: "Arrakis", categoryId: 4, year: 2021 };

function setup() {
  const store = new Map();
  let next = 1;
  const log = { updates: [], findAllArgs: null };
  const repo = {
    findOrCreateRef: async (_c, _t, _col, name) => (name === null ? null : 99),
    insert: async (title, refs) => {
      for (const t of store.values()) if (t.title === title.title && t.year === title.year) { const e = new Error("dup"); e.code = "ER_DUP_ENTRY"; throw e; }
      const p = title.toPersistence();
      store.set(next, Title.fromRow({ id: next, ...p }));
      return next++;
    },
    findById: async (id) => store.get(id) ?? null,
    update: async (id, fields) => { log.updates.push(fields); },
    approve: async (id) => { const t = store.get(id); if (t && t.isPending()) { t.approve(); return true; } return false; },
    delete: async (id) => store.delete(id),
    findAll: async (args) => { log.findAllArgs = args; return { items: [...store.values()], total: store.size }; },
  };
  return { service: new TitleService(repo, async (fn) => fn({})), store, log };
}

test("crear: usuario -> pendiente; admin -> aprobado; duplicado -> 409; inválido -> 400", async () => {
  const { service } = setup();
  assert.equal((await service.create(data, ana)).status, "pendiente");
  assert.equal((await service.create({ ...data, title: "Otro" }, admin)).status, "aprobado");
  await assert.rejects(service.create(data, admin), { statusCode: 409 });
  await assert.rejects(service.create({ ...data, year: 1 }, ana), { statusCode: 400 });
});

test("get: pendiente oculto (404) para ajenos y visible para el autor y el admin", async () => {
  const { service } = setup();
  const t = await service.create(data, ana);
  await assert.rejects(service.get(t.id, beto), { statusCode: 404 });
  await assert.rejects(service.get(t.id, undefined), { statusCode: 404 });
  assert.equal((await service.get(t.id, ana)).id, t.id);
  assert.equal((await service.get(t.id, admin)).id, t.id);
  await assert.rejects(service.get(999, admin), { statusCode: 404 });
});

test("list: un usuario normal siempre ve solo aprobados aunque pida 'todos'", async () => {
  const { service, log } = setup();
  await service.list({ page: 2, limit: 5, estado: "todos", sort: "ranking" }, ana);
  assert.equal(log.findAllArgs.status, "aprobado");
  assert.equal(log.findAllArgs.offset, 5);
  await service.list({ page: 1, limit: 5, estado: "todos" }, admin);
  assert.equal(log.findAllArgs.status, "todos");
});

test("update: persiste solo los cambios y resuelve referencias por nombre", async () => {
  const { service, log } = setup();
  const t = await service.create(data, ana);
  await service.update(t.id, { year: 2022, director: "Villeneuve" }, ana);
  assert.deepEqual(log.updates[0], { year: 2022, directorId: 99 });
  await assert.rejects(service.update(t.id, { year: 1 }, ana), { statusCode: 400 });
  await assert.rejects(service.update(t.id, { year: 2020 }, beto), { statusCode: 404 });
});

test("update: el autor ya no puede editar un título aprobado", async () => {
  const { service } = setup();
  const t = await service.create(data, ana);
  await service.approve(t.id);
  await assert.rejects(service.update(t.id, { year: 2020 }, ana), { statusCode: 403 });
  await service.update(t.id, { year: 2020 }, admin);
});

test("approve: segunda vez -> 409; inexistente -> 404", async () => {
  const { service } = setup();
  const t = await service.create(data, ana);
  assert.equal((await service.approve(t.id)).status, "aprobado");
  await assert.rejects(service.approve(t.id), { statusCode: 409 });
  await assert.rejects(service.approve(999), { statusCode: 404 });
});
