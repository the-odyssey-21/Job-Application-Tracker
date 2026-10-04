import { useEffect, useState } from "react";
import { upload } from "@vercel/blob/client";

const STATUSES = ["applied", "interview", "offer", "rejected"];

export default function Home() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    company: "",
    role: "",
    date: "",
    status: "applied",
    link: "",
    notes: "",
  });
  const [cvFile, setCvFile] = useState(null);

  useEffect(() => {
    fetchEntries();
  }, []);

  async function fetchEntries() {
    setLoading(true);
    const res = await fetch("/api/applications");
    const data = await res.json();
    setEntries(data);
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.company.trim() || !form.role.trim()) return;

    let cvUrl = "";
    let cvName = "";

    if (cvFile) {
      setUploading(true);
      try {
        const blob = await upload(cvFile.name, cvFile, {
          access: "public",
          handleUploadUrl: "/api/upload",
        });
        cvUrl = blob.url;
        cvName = cvFile.name;
      } catch (err) {
        alert("CV upload failed: " + err.message);
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    const payload = {
      ...form,
      date: form.date || new Date().toISOString().slice(0, 10),
      cvUrl,
      cvName,
    };

    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const saved = await res.json();
    setEntries((prev) => [...prev, saved]);
    setForm({ company: "", role: "", date: "", status: "applied", link: "", notes: "" });
    setCvFile(null);
    e.target.reset();
  }

  async function updateStatus(id, status) {
    const res = await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const updated = await res.json();
    setEntries((prev) => prev.map((e) => (e.id === id ? updated : e)));
  }

  async function removeEntry(id) {
    if (!confirm("Delete this application?")) return;
    await fetch(`/api/applications/${id}`, { method: "DELETE" });
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = entries.filter((e) => e.status === s).length;
    return acc;
  }, {});

  const sorted = [...entries].sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  return (
    <div className="wrap">
      <h1>Job Application Tracker</h1>
      <p className="sub">Log applications, track status, and keep the CV you used for each one.</p>

      <div className="card">
        <div className="stats">
          {STATUSES.map((s) => (
            <div className="stat" key={s}>
              <div className="n">{counts[s] || 0}</div>
              <div className="l">{s[0].toUpperCase() + s.slice(1)}</div>
            </div>
          ))}
          <div className="stat">
            <div className="n">{entries.length}</div>
            <div className="l">Total</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="section">Add application</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Company"
            required
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
          />
          <input
            type="text"
            placeholder="Role / title"
            required
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          />
          <div className="row2">
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s[0].toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <input
            type="url"
            placeholder="Job posting link (optional)"
            value={form.link}
            onChange={(e) => setForm({ ...form, link: e.target.value })}
          />
          <textarea
            placeholder="Notes (optional)"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
          <label className="file-label">
            CV used for this application (optional)
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setCvFile(e.target.files[0] || null)}
            />
          </label>
          <button type="submit" disabled={uploading}>
            {uploading ? "Uploading CV…" : "Add application"}
          </button>
        </form>
      </div>

      {loading ? (
        <div className="empty">Loading…</div>
      ) : sorted.length === 0 ? (
        <div className="empty">No applications logged yet.</div>
      ) : (
        sorted.map((e) => (
          <div className="entry" key={e.id}>
            <div className="entry-top">
              <div>
                <div className="entry-co">{e.company}</div>
                <div className="entry-role">{e.role}</div>
              </div>
              <span className={`badge ${e.status}`}>{e.status}</span>
            </div>
            <div className="entry-meta">Applied {e.date}</div>
            {e.notes && <div className="entry-notes">{e.notes}</div>}
            {e.link && (
              <div>
                <a href={e.link} target="_blank" rel="noopener noreferrer">
                  View posting →
                </a>
              </div>
            )}
            {e.cvUrl && (
              <div>
                <a href={e.cvUrl} target="_blank" rel="noopener noreferrer">
                  📄 {e.cvName || "View CV"} →
                </a>
              </div>
            )}
            <div className="entry-actions">
              <select
                className="status-select"
                value={e.status}
                onChange={(ev) => updateStatus(e.id, ev.target.value)}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s[0].toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
              <button className="secondary" onClick={() => removeEntry(e.id)}>
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
