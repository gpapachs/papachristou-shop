import { checkPassword, makeToken } from "../../../lib/auth";

export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { password } = req.body || {};
  if (!checkPassword(password)) {
    return res.status(401).json({ error: "Λάθος κωδικός." });
  }

  const token = makeToken();
  const isProd = process.env.NODE_ENV === "production";
  res.setHeader(
    "Set-Cookie",
    `admin_auth=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax${isProd ? "; Secure" : ""}`
  );
  res.status(200).json({ ok: true });
}
