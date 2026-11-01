import test from "node:test";
import assert from "node:assert/strict";
import User from "../../src/entities/User.js";
import AuthService from "../../src/services/auth.service.js";

function setup() {
  const users = new Map();
  let id = 1;
  const repo = {
    findByEmail: async (email) => users.get(email) ?? null,
    save: async (draft) => {
      if (users.has(draft.email)) { const e = new Error("dup"); e.code = "ER_DUP_ENTRY"; throw e; }
      const saved = new User({ id: id++, ...draft.toPersistence(), status: "activo" });
      users.set(saved.email, saved);
      return saved;
    },
  };
  const service = new AuthService(repo, { signToken: (u) => `token-${u.id}`, bcryptRounds: 4 });
  return { service, users };
}

test("registro: guarda hash bcrypt (no la contraseña) y devuelve usuario sin hash", async () => {
  const { service, users } = setup();
  const { user, token } = await service.register({ username: "Karen", email: "k@t.com", password: "Clave1234" });
  assert.equal(token, "token-1");
  assert.equal(user.role, "usuario");
  assert.ok(!JSON.stringify(user).includes("Clave1234"));
  assert.match(users.get("k@t.com").toPersistence().passwordHash, /^\$2[aby]\$/);
});

test("registro duplicado -> 409", async () => {
  const { service } = setup();
  const data = { username: "K", email: "k@t.com", password: "Clave1234" };
  await service.register(data);
  await assert.rejects(service.register(data), { statusCode: 409 });
});

test("login correcto entrega token; credenciales malas -> 401 con el mismo mensaje", async () => {
  const { service } = setup();
  await service.register({ username: "K", email: "k@t.com", password: "Clave1234" });
  assert.equal((await service.login({ email: "k@t.com", password: "Clave1234" })).token, "token-1");
  const wrongPass = await service.login({ email: "k@t.com", password: "mala" }).catch((e) => e);
  const noUser = await service.login({ email: "x@t.com", password: "mala" }).catch((e) => e);
  assert.equal(wrongPass.statusCode, 401);
  assert.equal(noUser.statusCode, 401);
  assert.equal(wrongPass.message, noUser.message);
});

test("cuenta inactiva -> 403", async () => {
  const { service, users } = setup();
  await service.register({ username: "K", email: "k@t.com", password: "Clave1234" });
  const u = users.get("k@t.com");
  users.set("k@t.com", new User({ id: 1, ...u.toPersistence(), status: "inactivo" }));
  await assert.rejects(service.login({ email: "k@t.com", password: "Clave1234" }), { statusCode: 403 });
});
