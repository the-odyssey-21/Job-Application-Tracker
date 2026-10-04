import { updateApplication, deleteApplication } from "../../../lib/db";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === "PATCH") {
    const updated = await updateApplication(id, req.body);
    if (!updated) return res.status(404).json({ error: "Not found" });
    return res.status(200).json(updated);
  }

  if (req.method === "DELETE") {
    await deleteApplication(id);
    return res.status(204).end();
  }

  res.setHeader("Allow", ["PATCH", "DELETE"]);
  res.status(405).end(`Method ${req.method} not allowed`);
}
