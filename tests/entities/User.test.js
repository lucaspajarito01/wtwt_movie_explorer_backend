import test from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcrypt";
import User from "../../src/entities/User.js";

const row = { id: 3, username: "Karen", email: "Karen@Test.com", password_hash: bcrypt.hashSync("Clave1234", 4), estado: "activo", role: "usuario" };

test("fromRow normaliza el correo y expone getters", () => {
  const u = User.fromRow(row);
  assert.equal(u.email, "karen@test.com");
  assert.equal(u.isAdmin(), false);
  assert.equal(u.isActive(), true);
  assert.ok(u.hasRole("usuario", "admin"));
});

test("toJSON y toSession nunca exponen el hash de la contraseña", () => {
  const u = User.fromRow(row);
  assert.deepEqual(u.toJSON(), { id: 3, username: "Karen", email: "karen@test.com", role: "usuario" });
  assert.deepEqual(u.toSession(), { ...u.toJSON(), estado: "activo" });
  assert.ok(!JSON.stringify(u).includes("$2"));
  assert.ok(!Object.keys(u).some((k) => /hash|password/i.test(k)));
});

test("verifyPassword acepta la correcta y rechaza la incorrecta", async () => {
  const u = User.fromRow(row);
  assert.equal(await u.verifyPassword("Clave1234"), true);
  assert.equal(await u.verifyPassword("otra"), false);
});

test("rol, estado y correo inválidos se rechazan", () => {
  assert.throws(() => new User({ username: "a", email: "a@b.c", role: "root" }), { statusCode: 400 });
  assert.throws(() => new User({ username: "a", email: "a@b.c", status: "x" }), { statusCode: 400 });
  assert.throws(() => new User({ username: "a", email: "sin-arroba" }), { statusCode: 400 });
  assert.throws(() => new User({ username: " ", email: "a@b.c" }), { statusCode: 400 });
});

test("un admin se reconoce como admin e inactivo no está activo", () => {
  assert.equal(new User({ username: "a", email: "a@b.c", role: "admin" }).isAdmin(), true);
  assert.equal(new User({ username: "a", email: "a@b.c", status: "inactivo" }).isActive(), false);
});
