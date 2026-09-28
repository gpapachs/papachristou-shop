import crypto from "crypto";

export function checkPassword(pw) {
  return !!pw && !!process.env.ADMIN_PASSWORD && pw === process.env.ADMIN_PASSWORD;
}

export function makeToken() {
  return crypto
    .createHash("sha256")
    .update(String(process.env.ADMIN_PASSWORD) + "::papachristou-admin-salt")
    .digest("hex");
}

export function isAuthed(req) {
  const raw = req.headers.cookie || "";
  const match = raw.match(/(?:^|;\s*)admin_auth=([^;]+)/);
  if (!match) return false;
  return match[1] === makeToken();
}
