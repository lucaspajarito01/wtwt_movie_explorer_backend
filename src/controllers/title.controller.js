import { matchedData } from "express-validator";
import * as titleService from "../services/title.service.js";
import { TITLE_FIELDS } from "../validators/title.validators.js";

// Solo pasan los campos permitidos (evita que el cliente fije status o createdBy)
const pickFields = (body) =>
  Object.fromEntries(
    TITLE_FIELDS.filter((field) => Object.hasOwn(body, field)).map((field) => [
      field,
      body[field],
    ]),
  );

export async function list(req, res) {
  const { page = 1, limit = 10, estado = "aprobado" } = matchedData(req, {
    locations: ["query"],
  });
  const { items, meta } = await titleService.list({ page, limit, estado }, req.user);
  res.json({ success: true, data: items, meta });
}

export async function get(req, res) {
  const title = await titleService.get(req.params.id, req.user);
  res.json({ success: true, data: title });
}

export async function create(req, res) {
  const title = await titleService.create(pickFields(req.body), req.user);
  res.status(201).json({
    success: true,
    message:
      title.status === "aprobado"
        ? "Título creado correctamente"
        : "Título enviado; quedará visible cuando un administrador lo apruebe",
    data: title,
  });
}

export async function update(req, res) {
  const title = await titleService.update(req.params.id, pickFields(req.body), req.user);
  res.json({ success: true, message: "Título actualizado correctamente", data: title });
}