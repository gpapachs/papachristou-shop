// Μετατρέπει τις γραμμές ενός Excel σε "σχέδιο αλλαγών" για το μενού.
// Δεν αγγίζει τη βάση: επιστρέφει τι θα προστεθεί/ενημερωθεί/έχει σφάλμα,
// ώστε ο χρήστης να το δει πριν πατήσει "Εφαρμογή".

const uid = () => Math.random().toString(36).slice(2, 10);

// "Ορεκτικά" == "ορεκτικα" == " ΟΡΕΚΤΙΚΑ " (χωρίς τόνους/κεφαλαία/κενά)
export function norm(s) {
  return String(s ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

// Δέχεται 4, "4,00", "4.00", "4,00€", "€ 4", "1.250,50"
export function parsePriceToCents(v) {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "number") return Number.isFinite(v) && v >= 0 ? Math.round(v * 100) : NaN;
  let s = String(v).replace(/[€\s]/g, "");
  if (!s) return null;
  if (s.includes(",") && s.includes(".")) {
    // το τελευταίο σύμβολο είναι ο υποδιαστολή, το άλλο χιλιάδες
    s = s.lastIndexOf(",") > s.lastIndexOf(".") ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, "");
  } else {
    s = s.replace(",", ".");
  }
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : NaN;
}

export function parseAvailable(v) {
  const s = norm(v);
  if (s === "") return true;
  if (["οχι", "ο", "no", "n", "false", "0", "μη διαθεσιμο", "εξαντλημενο"].includes(s)) return false;
  return true;
}

const COLS = {
  category: ["κατηγορ"],
  name: ["ονομα", "προιον", "ειδος", "πιατο"],
  priceTable: ["τραπεζ"],
  priceDelivery: ["διανομ", "παραγγελ"],
  note: ["σημειωσ", "περιγραφ"],
  available: ["διαθεσ"],
};
const FALLBACK_ORDER = ["category", "name", "priceTable", "priceDelivery", "note", "available"];

function mapColumns(headerRow) {
  const map = {};
  headerRow.forEach((h, i) => {
    const n = norm(h);
    if (!n) return;
    for (const [key, needles] of Object.entries(COLS)) {
      if (map[key] === undefined && needles.some((x) => n.includes(x))) map[key] = i;
    }
  });
  // Αν δεν αναγνωρίστηκαν επικεφαλίδες, υποθέτουμε τη σειρά του προτύπου
  if (map.category === undefined || map.name === undefined) {
    FALLBACK_ORDER.forEach((k, i) => (map[k] = i));
    return { map, hasHeader: false };
  }
  return { map, hasHeader: true };
}

export function buildImportPlan(rows, data) {
  const plan = { add: [], update: [], errors: [], newCategories: [], total: 0 };
  if (!rows || rows.length === 0) {
    plan.errors.push({ line: 1, message: "Το αρχείο είναι κενό." });
    return plan;
  }

  const { map, hasHeader } = mapColumns(rows[0]);
  const start = hasHeader ? 1 : 0;

  const categories = data.categories.map((c) => ({ ...c }));
  const products = data.products.map((p) => ({ ...p }));
  const catByNorm = new Map(categories.map((c) => [norm(c.name), c]));
  const prodByKey = new Map(products.map((p) => [p.categoryId + "|" + norm(p.name), p]));
  const seenInFile = new Set();

  for (let i = start; i < rows.length; i++) {
    const row = rows[i] || [];
    const line = i + 1; // αριθμός γραμμής όπως τον βλέπει ο χρήστης στο Excel
    const get = (k) => (map[k] === undefined ? undefined : row[map[k]]);

    const catName = String(get("category") ?? "").trim();
    const name = String(get("name") ?? "").trim();
    const raw = [catName, name, get("priceTable"), get("priceDelivery"), get("note")];
    if (raw.every((v) => v === undefined || v === null || String(v).trim() === "")) continue; // κενή γραμμή

    plan.total++;
    if (!name) { plan.errors.push({ line, message: "Λείπει το όνομα." }); continue; }
    if (!catName) { plan.errors.push({ line, message: `«${name}»: λείπει η κατηγορία.` }); continue; }

    let table = parsePriceToCents(get("priceTable"));
    let delivery = parsePriceToCents(get("priceDelivery"));
    if (Number.isNaN(table) || Number.isNaN(delivery)) {
      plan.errors.push({ line, message: `«${name}»: μη έγκυρη τιμή.` });
      continue;
    }
    if (table === null && delivery === null) {
      plan.errors.push({ line, message: `«${name}»: δεν έχει καμία τιμή.` });
      continue;
    }
    if (table === null) table = delivery;
    if (delivery === null) delivery = table;

    // Κατηγορία: βρες την ή φτιάξε νέα
    let cat = catByNorm.get(norm(catName));
    if (!cat) {
      cat = { id: uid(), name: catName };
      categories.push(cat);
      catByNorm.set(norm(catName), cat);
      plan.newCategories.push(catName);
    }

    const key = cat.id + "|" + norm(name);
    if (seenInFile.has(key)) {
      plan.errors.push({ line, message: `«${name}»: υπάρχει δύο φορές στο αρχείο (θα μετρήσει η πρώτη).` });
      continue;
    }
    seenInFile.add(key);

    const note = String(get("note") ?? "").trim();
    const available = parseAvailable(get("available"));
    const existing = prodByKey.get(key);

    if (existing) {
      const before = { ...existing };
      existing.priceTableCents = table;
      existing.priceDeliveryCents = delivery;
      existing.note = note;
      existing.available = available;
      plan.update.push({ line, name, category: cat.name, before, after: { ...existing } });
    } else {
      const created = {
        id: uid(), categoryId: cat.id, name, note, available,
        priceTableCents: table, priceDeliveryCents: delivery, image: null,
      };
      products.push(created);
      prodByKey.set(key, created);
      plan.add.push({ line, name, category: cat.name, product: created });
    }
  }

  plan.result = { categories, products };
  return plan;
}
