import { useRef, useState } from "react";
import { buildImportPlan } from "../lib/excelImport";
import { formatPrice } from "../lib/format";

const COLUMNS = ["Κατηγορία", "Όνομα", "Τιμή τραπεζιού (€)", "Τιμή διανομής (€)", "Σημείωση", "Διαθέσιμο (ΝΑΙ/ΟΧΙ)", "Category (EN)", "Name (EN)", "Note (EN)"];
const EXAMPLE = ["Ορεκτικά", "Φέτα", "4,00", "4,00", "Λάδι, ρίγανη.", "ΝΑΙ", "Starters", "Feta cheese", "Olive oil, oregano."];

export default function ExcelImport({ data, onApply }) {
  const [open, setOpen] = useState(false);
  const [plan, setPlan] = useState(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState(null);
  const [done, setDone] = useState(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);

  function reset() {
    setPlan(null);
    setFileName("");
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function onFile(file) {
    if (!file) return;
    setError(null);
    setDone(null);
    setPlan(null);
    setFileName(file.name);

    if (!/\.xlsx$/i.test(file.name)) {
      setError("Το αρχείο πρέπει να είναι Excel με κατάληξη .xlsx. Στο Excel: Αποθήκευση ως → Βιβλίο εργασίας Excel (.xlsx).");
      return;
    }

    setBusy(true);
    try {
      const { default: readXlsxFile } = await import("read-excel-file");
      const rows = await readXlsxFile(file); // πρώτη σελίδα του αρχείου
      setPlan(buildImportPlan(rows, data));
    } catch (e) {
      setError("Δεν μπόρεσα να διαβάσω το αρχείο. Βεβαιώσου ότι είναι έγκυρο .xlsx και ότι η σελίδα «Προϊόντα» είναι πρώτη.");
    } finally {
      setBusy(false);
    }
  }

  function apply() {
    if (!plan?.result) return;
    const n = plan.add.length + changedUpdates(plan).length;
    onApply(plan.result);
    setDone(`Έγινε εισαγωγή: ${plan.add.length} νέα, ${changedUpdates(plan).length} ενημερωμένα (${n} αλλαγές συνολικά).`);
    reset();
  }

  const canApply = plan && plan.add.length + changedUpdates(plan).length + plan.categoryEnUpdates.length > 0;

  return (
    <div style={box}>
      <button onClick={() => setOpen(!open)} style={toggle}>
        <span>📥 Εισαγωγή προϊόντων από Excel</span>
        <span style={{ opacity: 0.6 }}>{open ? "▲" : "▼"}</span>
      </button>

      {done && <div style={{ ...note, color: "#8FBF8A" }}>✓ {done}</div>}

      {open && (
        <div style={{ marginTop: 14 }}>
          <p style={{ fontSize: 13, opacity: 0.8, lineHeight: 1.55, margin: "0 0 12px" }}>
            Κατέβασε το πρότυπο, συμπλήρωσε τα προϊόντα σου και ανέβασέ το. Θα δεις προεπισκόπηση πριν αλλάξει οτιδήποτε.
            Προϊόντα με το ίδιο όνομα στην ίδια κατηγορία <strong>ενημερώνονται</strong> (η φωτογραφία μένει), τα υπόλοιπα <strong>προστίθενται</strong>.
            Τίποτα δεν διαγράφεται. Οι τρεις τελευταίες στήλες (EN) είναι προαιρετικές και δίνουν τα αγγλικά· αν μείνουν κενές, κρατιέται ό,τι αγγλικό υπάρχει ήδη.
          </p>

          <div style={{ overflowX: "auto", marginBottom: 12 }}>
            <table style={{ borderCollapse: "collapse", fontSize: 12, minWidth: 820 }}>
              <thead>
                <tr>{COLUMNS.map((c) => <th key={c} style={th}>{c}</th>)}</tr>
              </thead>
              <tbody>
                <tr>{EXAMPLE.map((v, i) => <td key={i} style={td}>{v}</td>)}</tr>
              </tbody>
            </table>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <a href="/protypo-menu.xlsx" download="protypo-menu.xlsx" style={{ ...btnGhost, textDecoration: "none" }}>
              ⬇ Κατέβασε το πρότυπο Excel
            </a>
            <label style={{ ...btnPrimary, cursor: busy ? "wait" : "pointer" }}>
              {busy ? "Διαβάζω το αρχείο..." : "⬆ Ανέβασε το αρχείο σου (.xlsx)"}
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                style={{ display: "none" }}
                onChange={(e) => onFile(e.target.files?.[0])}
                disabled={busy}
              />
            </label>
            {fileName && !busy && <span style={{ fontSize: 12, opacity: 0.6 }}>{fileName}</span>}
          </div>

          {error && <div style={{ ...note, color: "#E08A7D" }}>{error}</div>}

          {plan && (
            <div style={{ marginTop: 16, borderTop: "1px solid var(--line)", paddingTop: 14 }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                <Chip color="#8FBF8A">{plan.add.length} νέα</Chip>
                <Chip color="var(--rose-bright)">{changedUpdates(plan).length} ενημερώσεις</Chip>
                {plan.update.length - changedUpdates(plan).length > 0 && (
                  <Chip color="#999">{plan.update.length - changedUpdates(plan).length} αμετάβλητα</Chip>
                )}
                {plan.errors.length > 0 && <Chip color="#E08A7D">{plan.errors.length} με πρόβλημα</Chip>}
                {plan.newCategories.length > 0 && <Chip color="#E0C87D">νέες κατηγορίες: {plan.newCategories.join(", ")}</Chip>}
                {plan.categoryEnUpdates.length > 0 && <Chip color="#E0C87D">αγγλικό όνομα κατηγορίας: {plan.categoryEnUpdates.join(", ")}</Chip>}
              </div>

              {plan.add.length > 0 && (
                <Section title="Θα προστεθούν">
                  {plan.add.map((a) => (
                    <Row key={a.line} left={`${a.name} · ${a.category}`}
                         right={`τραπέζι ${formatPrice(a.product.priceTableCents)} · διανομή ${formatPrice(a.product.priceDeliveryCents)}${a.product.available ? "" : " · μη διαθέσιμο"}`} />
                  ))}
                </Section>
              )}

              {changedUpdates(plan).length > 0 && (
                <Section title="Θα ενημερωθούν">
                  {changedUpdates(plan).map((u) => (
                    <Row key={u.line} left={`${u.name} · ${u.category}`} right={describeChange(u)} />
                  ))}
                </Section>
              )}

              {plan.errors.length > 0 && (
                <Section title="Θα παραλειφθούν (διόρθωσέ τα στο Excel αν θες να μπουν)" danger>
                  {plan.errors.map((e, i) => (
                    <Row key={i} left={`Γραμμή ${e.line}`} right={e.message} />
                  ))}
                </Section>
              )}

              <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                <button className="btn" onClick={apply} disabled={!canApply}>
                  {canApply ? "Εφαρμογή αλλαγών" : "Δεν υπάρχει τίποτα να εφαρμοστεί"}
                </button>
                <button onClick={reset} style={btnGhost}>Ακύρωση</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function changedUpdates(plan) {
  return plan.update.filter((u) => {
    const b = u.before, a = u.after;
    return (
      b.priceTableCents !== a.priceTableCents ||
      b.priceDeliveryCents !== a.priceDeliveryCents ||
      (b.note || "") !== (a.note || "") ||
      (b.nameEn || "") !== (a.nameEn || "") ||
      (b.noteEn || "") !== (a.noteEn || "") ||
      b.available !== a.available
    );
  });
}

function describeChange(u) {
  const b = u.before, a = u.after, parts = [];
  if (b.priceTableCents !== a.priceTableCents) parts.push(`τραπέζι ${formatPrice(b.priceTableCents)} → ${formatPrice(a.priceTableCents)}`);
  if (b.priceDeliveryCents !== a.priceDeliveryCents) parts.push(`διανομή ${formatPrice(b.priceDeliveryCents)} → ${formatPrice(a.priceDeliveryCents)}`);
  if ((b.note || "") !== (a.note || "")) parts.push("νέα σημείωση");
  if ((b.nameEn || "") !== (a.nameEn || "") || (b.noteEn || "") !== (a.noteEn || "")) parts.push("αγγλικά");
  if (b.available !== a.available) parts.push(a.available ? "γίνεται διαθέσιμο" : "γίνεται μη διαθέσιμο");
  return parts.join(" · ");
}

function Chip({ color, children }) {
  return <span style={{ fontSize: 12, fontWeight: 600, color, border: `1px solid ${color}`, borderRadius: 20, padding: "3px 10px" }}>{children}</span>;
}

function Section({ title, danger, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: danger ? "#E08A7D" : "var(--rose-bright)", marginBottom: 6 }}>{title}</div>
      <div style={{ maxHeight: 220, overflowY: "auto", border: "1px solid var(--line)", borderRadius: 6 }}>{children}</div>
    </div>
  );
}

function Row({ left, right }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "7px 10px", fontSize: 12.5, borderBottom: "1px solid var(--line)" }}>
      <span style={{ fontWeight: 600 }}>{left}</span>
      <span style={{ opacity: 0.75, textAlign: "right" }}>{right}</span>
    </div>
  );
}

const box = { background: "var(--forest-2)", border: "1px solid var(--line)", borderRadius: 10, padding: 16, marginBottom: 26 };
const toggle = { width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", background: "transparent", border: "none", color: "var(--cream)", fontSize: 15, fontWeight: 700, cursor: "pointer", padding: 0, fontFamily: "inherit" };
const note = { marginTop: 12, fontSize: 13, lineHeight: 1.5 };
const th = { background: "#22372A", border: "1px solid var(--line)", padding: "6px 10px", textAlign: "left", whiteSpace: "nowrap" };
const td = { border: "1px solid var(--line)", padding: "6px 10px", opacity: 0.85, whiteSpace: "nowrap" };
const btnGhost = { background: "transparent", border: "1px solid var(--line)", color: "var(--cream)", borderRadius: 6, padding: "9px 14px", fontSize: 13, cursor: "pointer", fontFamily: "inherit", display: "inline-block" };
const btnPrimary = { background: "var(--rose-deep)", border: "none", color: "var(--cream)", borderRadius: 6, padding: "9px 14px", fontSize: 13, fontWeight: 700, display: "inline-block" };
