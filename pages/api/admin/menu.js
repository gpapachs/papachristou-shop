import { getMenu, saveMenu } from "../../../lib/store";
import { isAuthed } from "../../../lib/auth";

export const config = {
  api: { bodyParser: { sizeLimit: "8mb" } },
};

export default async function handler(req, res) {
  if (!isAuthed(req)) {
    return res.status(401).json({ error: "Μη εξουσιοδοτημένο." });
  }

  if (req.method === "GET") {
    const data = await getMenu();
    return res.status(200).json(data);
  }

  if (req.method === "POST") {
    const data = req.body;
    if (!data || !Array.isArray(data.categories) || !Array.isArray(data.products)) {
      return res.status(400).json({ error: "Μη έγκυρα δεδομένα." });
    }
    await saveMenu(data);
    return res.status(200).json({ ok: true });
  }

  res.status(405).end();
}
