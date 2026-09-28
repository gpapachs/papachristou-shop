// Μικρό βοηθητικό για να μιλάμε με το Viva Payments API.
// Έγγραφα: https://developer.viva.com/apis-for-payments/checkout-api/

const DEMO = process.env.VIVA_DEMO === "true";

// Το demo (sandbox) περιβάλλον χρησιμοποιείται για δοκιμές χωρίς πραγματικά χρήματα.
// Όταν είσαι έτοιμος να δέχεσαι αληθινές πληρωμές, βάλε VIVA_DEMO=false.
export const VIVA_ACCOUNTS_URL = DEMO
  ? "https://demo-accounts.vivapayments.com"
  : "https://accounts.vivapayments.com";

export const VIVA_API_URL = DEMO
  ? "https://demo-api.vivapayments.com"
  : "https://api.vivapayments.com";

export const VIVA_CHECKOUT_URL = DEMO
  ? "https://demo.vivapayments.com/web/checkout"
  : "https://www.vivapayments.com/web/checkout";

let cachedToken = null;
let cachedTokenExpiry = 0;

export async function getVivaAccessToken() {
  const now = Date.now();
  if (cachedToken && now < cachedTokenExpiry) return cachedToken;

  const basic = Buffer.from(
    `${process.env.VIVA_CLIENT_ID}:${process.env.VIVA_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch(`${VIVA_ACCOUNTS_URL}/connect/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Viva auth failed (${res.status}): ${text}`);
  }

  const json = await res.json();
  cachedToken = json.access_token;
  // Ανανέωση λίγο πριν λήξει, για ασφάλεια
  cachedTokenExpiry = now + (json.expires_in - 60) * 1000;
  return cachedToken;
}
