// el: 4,00€   ·   en: €4.00
export function formatPrice(cents, lang = "el") {
  if (cents == null) return "—";
  const n = (cents / 100).toFixed(2);
  return lang === "en" ? "€" + n : n.replace(".", ",") + "€";
}
