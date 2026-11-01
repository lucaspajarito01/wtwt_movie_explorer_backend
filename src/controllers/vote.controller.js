import { voteService } from "../container.js";

export async function vote(req, res) {
  const data = await voteService.vote(Number(req.params.id), req.user, req.body.type);
  res.json({ success: true, message: "Voto registrado correctamente", data });
}

export async function unvote(req, res) {
  const data = await voteService.unvote(Number(req.params.id), req.user);
  res.json({ success: true, message: "Voto retirado correctamente", data });
}