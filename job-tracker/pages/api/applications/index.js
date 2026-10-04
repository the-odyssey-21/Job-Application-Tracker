import { getApplications, addApplication } from "../../../lib/db";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const list = await getApplications();
    return res.status(200).json(list);
  }

  if (req.method === "POST") {
    const { company, role, date, status, link, notes, cvUrl, cvName } = req.body;
    if (!company || !role) {
      return res.status(400).json({ error: "Company and role are required" });
    }
    const entry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      company,
      role,
      date: date || new Date().toISOString().slice(0, 10),
      status: status || "applied",
      link: link || "",
      notes: notes || "",
      cvUrl: cvUrl || "",
      cvName: cvName || "",
    };
    const saved = await addApplication(entry);
    return res.status(201).json(saved);
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} not allowed`);
}
