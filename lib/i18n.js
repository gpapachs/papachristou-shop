import { norm } from "./excelImport";

export const LANGS = ["el", "en"];

// Ποια γλώσσα θα δείξουμε: ?lang=en στο link > cookie "lang" (το βάζει το κουμπί ΕΛ/EN) > ελληνικά.
export function resolveLang(req, query) {
  const q = query && query.lang;
  if (q === "el" || q === "en") return q;
  const m = ((req && req.headers && req.headers.cookie) || "").match(/(?:^|;\s*)lang=(el|en)(?:;|$)/);
  return m ? m[1] : "el";
}

// Όλα τα κείμενα του site (εκτός διαχειριστικού). Άλλαξε ό,τι θες εδώ.
export const UI = {
  el: {
    brandSub: "ΠΑΡΑΔΟΣΙΑΚΟ ΨΗΤΟΠΩΛΕΙΟ",
    marquee: "Πεινάσαμε??? Ψητοπωλείο Παπαχρήστου και χορτάσαμε...!!! Τα καλύτερα ψητά της πόλης",
    orderTitle: "Ψητοπωλείο Παπαχρήστου — Παραγγελία online",
    catalogTitle: "Ψητοπωλείο Παπαχρήστου — Κατάλογος",
    orderHero: "Πεινάσαμε;-)",
    orderLede: "Σουβλάκι, κοντοσούβλι και μπριζόλες στα κάρβουνα. Διάλεξε, πλήρωσε online με κάρτα, παρέλαβε ζεστό.",
    catalogHero: "Ο κατάλογός μας",
    catalogLede: "Τιμές τραπεζιού. Καλή όρεξη!",
    dineInLink: "Κατάλογος τραπεζιού",
    items: "προϊόντα",
    pay: "Πληρωμή με κάρτα (Viva) →",
    wait: "Μια στιγμή...",
    unavailable: "Μη διαθέσιμο",
    unavailableParen: "(μη διαθέσιμο)",
    footer: "© Ψητοπωλείο Παπαχρήστου — Χατζηπέτρου & 25ης Μαρτίου, Τρίκαλα",
    close: "Κλείσιμο",
    genericError: "Κάτι πήγε στραβά.",
    thanks: "Ευχαριστούμε! 🎉",
    thanksText:
      "Η πληρωμή σου ολοκληρώθηκε. Θα ετοιμάσουμε την παραγγελία σου αμέσως — αν χρειαστεί, θα σε καλέσουμε στο τηλέφωνο που άφησες.",
    orderNo: "Αριθμός παραγγελίας",
    backToMenu: "Πίσω στο μενού",
  },
  en: {
    brandSub: "TRADITIONAL GRILL HOUSE",
    marquee: "Feeling hungry??? Papachristou Grill House and you'll be full...!!! The best grilled food in town",
    orderTitle: "Papachristou Grill House — Order online",
    catalogTitle: "Papachristou Grill House — Menu",
    orderHero: "Hungry? ;-)",
    orderLede:
      "Souvlaki, kontosouvli and pork chops grilled over charcoal. Choose, pay online by card and pick it up hot.",
    catalogHero: "Our menu",
    catalogLede: "Dine-in prices. Enjoy your meal!",
    dineInLink: "Dine-in menu",
    items: "items",
    pay: "Pay by card (Viva) →",
    wait: "One moment...",
    unavailable: "Unavailable",
    unavailableParen: "(unavailable)",
    footer: "© Papachristou Grill House — Chatzipetrou & 25is Martiou, Trikala",
    close: "Close",
    genericError: "Something went wrong.",
    thanks: "Thank you! 🎉",
    thanksText:
      "Your payment is complete. We'll start preparing your order right away — if needed, we'll call the phone number you left.",
    orderNo: "Order number",
    backToMenu: "Back to the menu",
  },
};

// Αγγλικά "έτοιμα" για τα προϊόντα που υπάρχουν ήδη στο μενού. Χρησιμοποιούνται ΜΟΝΟ όταν
// δεν έχεις γράψει δικό σου αγγλικό όνομα/σημείωση στο διαχειριστικό ή στο Excel.
const fromGreek = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [norm(k), v]));

const DEFAULT_EN = {
  category: fromGreek({
    "Ορεκτικά": "Starters",
    "Σαλάτες": "Salads",
    "Τεμάχια": "By the piece",
    "Μερίδες": "Portions",
    "Αναψυκτικά": "Drinks",
    "Επιδόρπια": "Desserts",
    "Γλυκά": "Desserts",
  }),
  product: fromGreek({
    "Φέτα": "Feta cheese",
    "Πατάτες τηγανητές": "French fries",
    "Παξιμάδι": "Paximadi (rusk)",
    "Σουβλάκι χοιρινό": "Pork souvlaki",
    "Λουκάνικο χωριάτικο": "Country-style sausage",
    "Κοντοσούβλι χοιρινό": "Pork kontosouvli",
    "Μπριζόλα χοιρινή": "Pork chop",
    "Νερό 1000ml": "Water 1000ml",
    "Πορτοκαλάδα Κλιάφα μπλε 330ml": "Kliafa orangeade 330ml",
  }),
  note: fromGreek({
    "Λάδι, ρίγανη.": "Olive oil, oregano.",
    "Συνοδεύεται από ψωμί & λίγες πατάτες τηγανητές.": "Served with bread & a few fries.",
    "Συνοδεύεται από ψωμί & πατάτες τηγανητές.": "Served with bread & fries.",
  }),
};

// Αγγλικό κείμενο από το έτοιμο λεξικό (ή "" αν δεν υπάρχει) — το χρησιμοποιεί και το διαχειριστικό για υπόδειξη.
export function defaultEnglish(kind, greek) {
  return (DEFAULT_EN[kind] && DEFAULT_EN[kind][norm(greek)]) || "";
}

const clean = (s) => (typeof s === "string" ? s.trim() : "");

export function catName(cat, lang) {
  if (lang !== "en") return cat.name;
  return clean(cat.nameEn) || defaultEnglish("category", cat.name) || cat.name;
}

export function prodName(p, lang) {
  if (lang !== "en") return p.name;
  return clean(p.nameEn) || defaultEnglish("product", p.name) || p.name;
}

export function prodNote(p, lang) {
  if (!p.note && !clean(p.noteEn)) return "";
  if (lang !== "en") return p.note || "";
  return clean(p.noteEn) || defaultEnglish("note", p.note) || p.note || "";
}
