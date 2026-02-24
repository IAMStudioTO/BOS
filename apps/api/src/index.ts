// ===== ADMIN CSV (protected) =====
app.get("/admin/leads.csv", async (req, res) => {
  if (!ADMIN_API_KEY) {
    return res.status(500).json({ ok: false, error: "ADMIN_API_KEY missing" });
  }

  const key = (req.header("x-admin-key") || "").trim();
  if (!key || key !== ADMIN_API_KEY) {
    return res.status(403).json({ ok: false, error: "Forbidden" });
  }

  const { rows } = await pool.query(
    `SELECT * FROM leads ORDER BY created_at DESC`
  );

  const header = [
    "id",
    "request_id",
    "email",
    "settore",
    "sito_url",
    "score",
    "livello",
    "perdita_mensile",
    "created_at",
  ];

  const csvRows = rows.map((r) =>
    [
      r.id,
      r.request_id,
      r.email,
      r.settore,
      r.sito_url,
      r.score,
      r.livello,
      r.perdita_mensile,
      r.created_at,
    ]
      .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
      .join(",")
  );

  const csv = [header.join(","), ...csvRows].join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="bos-leads.csv"'
  );

  res.send(csv);
});
