import { useEffect, useRef, useState } from "react";
import Head from "next/head";
import { formatPrice } from "../lib/format";

const uid = () => Math.random().toString(36).slice(2, 10);

function resizeImageFile(file, maxWidth = 480, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Δεν ήταν δυνατή η ανάγνωση του αρχείου"));
    reader.onload = () => {
      const img = new window.Image();
      img.onerror = () => reject(new Error("Μη έγκυρη εικόνα"));
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(null);

  const [data, setData] = useState(null);
  const [saveState, setSaveState] = useState("idle");
  const [newCatName, setNewCatName] = useState("");
  const [busyImg, setBusyImg] = useState(null);
  const fileInputs = useRef({});

  // Δοκιμάζουμε να φορτώσουμε το μενού· αν γυρίσει 401 σημαίνει ότι
  // χρειάζεται login.
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/menu");
        if (res.status === 401) {
          setAuthed(false);
        } else if (res.ok) {
          setAuthed(true);
          setData(await res.json());
        }
      } finally {
        setChecking(false);
      }
    })();
  }, []);

  async function login(e) {
    e.preventDefault();
    setLoginError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setLoginError(j.error || "Κάτι πήγε στραβά.");
      return;
    }
    setAuthed(true);
    const menuRes = await fetch("/api/admin/menu");
    setData(await menuRes.json());
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthed(false);
    setData(null);
  }

  async function persist(next) {
    setData(next);
    setSaveState("saving");
    try {
      const res = await fetch("/api/admin/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      if (!res.ok) throw new Error();
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 1200);
    } catch {
      setSaveState("error");
    }
  }

  if (checking) {
    return <Centered>Έλεγχος σύνδεσης...</Centered>;
  }

  if (!authed) {
    return (
      <>
        <Head><title>Σύνδεση διαχειριστικού</title></Head>
        <div className="wrap" style={{ maxWidth: 380, paddingTop: 100 }}>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, marginBottom: 6 }}>Διαχειριστικό</h1>
          <p style={{ opacity: 0.6, fontSize: 14, marginBottom: 24 }}>Ψητοπωλείο Παπαχρήστου</p>
          <form onSubmit={login} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              type="password"
              placeholder="Κωδικός"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              style={inputStyle}
            />
            {loginError && <div style={{ color: "#E08A7D", fontSize: 13 }}>{loginError}</div>}
            <button className="btn" type="submit">Σύνδεση</button>
          </form>
        </div>
      </>
    );
  }

  if (!data) return <Centered>Φόρτωση μενού...</Centered>;

  const addCategory = () => {
    const name = newCatName.trim();
    if (!name) return;
    persist({ ...data, categories: [...data.categories, { id: uid(), name }] });
    setNewCatName("");
  };

  const removeCategory = (catId) => {
    if (!window.confirm("Διαγραφή κατηγορίας και όλων των προϊόντων της;")) return;
    persist({
      categories: data.categories.filter((c) => c.id !== catId),
      products: data.products.filter((p) => p.categoryId !== catId),
    });
  };

  const addProduct = (categoryId) => {
    persist({
      ...data,
      products: [
        ...data.products,
        { id: uid(), categoryId, name: "Νέο προϊόν", note: "", available: true, priceTableCents: 0, priceDeliveryCents: 0, image: null },
      ],
    });
  };

  const editProduct = (id, patch) => {
    persist({ ...data, products: data.products.map((p) => (p.id === id ? { ...p, ...patch } : p)) });
  };

  const removeProduct = (id) => {
    persist({ ...data, products: data.products.filter((p) => p.id !== id) });
  };

  const onPickImage = async (id, file) => {
    if (!file) return;
    setBusyImg(id);
    try {
      const b64 = await resizeImageFile(file);
      editProduct(id, { image: b64 });
    } catch {
      window.alert("Η εικόνα δεν φορτώθηκε.");
    } finally {
      setBusyImg(null);
    }
  };

  return (
    <>
      <Head><title>Διαχειριστικό — Παπαχρήστου</title></Head>
      <div className="wrap" style={{ paddingTop: 28, paddingBottom: 60 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 22 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: "0.12em", color: "var(--rose-bright)", fontWeight: 600 }}>ΠΑΠΑΧΡΗΣΤΟΥ · ΔΙΑΧΕΙΡΙΣΤΙΚΟ</div>
            <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 24, margin: "4px 0 0" }}>Διαχείριση μενού</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <SaveBadge state={saveState} />
            <a href="/katalogos" target="_blank" rel="noreferrer" style={{ fontSize: 13, textDecoration: "underline" }}>Δες τον κατάλογο ↗</a>
            <a href="/" target="_blank" rel="noreferrer" style={{ fontSize: 13, textDecoration: "underline" }}>Δες την παραγγελιοληψία ↗</a>
            <button onClick={logout} style={btnGhost}>Αποσύνδεση</button>
          </div>
        </div>

        <div style={{ background: "var(--forest-2)", border: "1px solid var(--line)", borderRadius: 8, padding: "12px 16px", fontSize: 13, opacity: 0.75, marginBottom: 26 }}>
          Κάθε προϊόν έχει <strong>δύο τιμές</strong>: την τιμή που βλέπει ο πελάτης στο τραπέζι (online κατάλογος) και την τιμή παραγγελίας/διανομής — μπορούν να διαφέρουν.
        </div>

        {data.categories.map((cat) => {
          const products = data.products.filter((p) => p.categoryId === cat.id);
          return (
            <div key={cat.id} style={{ marginBottom: 26, background: "var(--forest-2)", borderRadius: 10, padding: 16, border: "1px solid var(--line)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 16, color: "var(--rose-bright)", margin: 0 }}>{cat.name}</h2>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => addProduct(cat.id)} style={btnGhost}>+ Προϊόν</button>
                  <button onClick={() => removeCategory(cat.id)} style={btnDanger}>Διαγραφή κατηγορίας</button>
                </div>
              </div>

              {products.length === 0 && <p style={{ fontSize: 13, opacity: 0.5 }}>Δεν υπάρχουν προϊόντα ακόμα.</p>}

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {products.map((p) => (
                  <div key={p.id} style={{ display: "grid", gridTemplateColumns: "56px 1fr auto", gap: 12, background: "var(--forest)", border: "1px solid var(--line)", borderRadius: 8, padding: 12 }}>
                    <div style={{ position: "relative" }}>
                      <div
                        onClick={() => fileInputs.current[p.id]?.click()}
                        style={{ width: 56, height: 56, borderRadius: 6, background: "var(--forest-2)", border: "1px dashed var(--line)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden" }}
                        title="Αλλαγή φωτογραφίας"
                      >
                        {busyImg === p.id ? (
                          <span style={{ fontSize: 10, opacity: 0.6 }}>...</span>
                        ) : p.image ? (
                          <img src={p.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <span style={{ fontSize: 10, opacity: 0.4 }}>φωτό</span>
                        )}
                      </div>
                      <input
                        ref={(el) => (fileInputs.current[p.id] = el)}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) => onPickImage(p.id, e.target.files?.[0])}
                      />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <input value={p.name} onChange={(e) => editProduct(p.id, { name: e.target.value })} placeholder="Όνομα" style={{ ...inputStyle, flex: "1 1 180px", fontWeight: 600 }} />
                      </div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <label style={fieldLabel}>
                          Τιμή τραπεζιού
                          <input
                            type="number" step="0.10" min="0"
                            value={(p.priceTableCents / 100).toFixed(2)}
                            onChange={(e) => editProduct(p.id, { priceTableCents: Math.round(parseFloat(e.target.value || 0) * 100) })}
                            style={{ ...inputStyle, width: 100 }}
                          />
                        </label>
                        <label style={fieldLabel}>
                          Τιμή διανομής
                          <input
                            type="number" step="0.10" min="0"
                            value={(p.priceDeliveryCents / 100).toFixed(2)}
                            onChange={(e) => editProduct(p.id, { priceDeliveryCents: Math.round(parseFloat(e.target.value || 0) * 100) })}
                            style={{ ...inputStyle, width: 100 }}
                          />
                        </label>
                      </div>
                      <input value={p.note} onChange={(e) => editProduct(p.id, { note: e.target.value })} placeholder="Σημείωση (προαιρετικό)" style={inputStyle} />
                      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, opacity: 0.8 }}>
                        <input type="checkbox" checked={p.available} onChange={(e) => editProduct(p.id, { available: e.target.checked })} />
                        Διαθέσιμο
                      </label>
                    </div>

                    <button onClick={() => removeProduct(p.id)} style={btnDangerIcon} title="Διαγραφή">✕</button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        <div style={{ display: "flex", gap: 8 }}>
          <input value={newCatName} onChange={(e) => setNewCatName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addCategory()} placeholder="Όνομα νέας κατηγορίας" style={inputStyle} />
          <button onClick={addCategory} className="btn">+ Κατηγορία</button>
        </div>
      </div>
    </>
  );
}

function Centered({ children }) {
  return <div className="wrap" style={{ paddingTop: 100, textAlign: "center", opacity: 0.7 }}>{children}</div>;
}

function SaveBadge({ state }) {
  const map = {
    saving: { text: "Αποθήκευση...", color: "var(--rose-bright)" },
    saved: { text: "✓ Αποθηκεύτηκε", color: "#8FBF8A" },
    error: { text: "Απέτυχε η αποθήκευση", color: "#E08A7D" },
  };
  const cfg = map[state];
  if (!cfg) return null;
  return <span style={{ fontSize: 12, color: cfg.color }}>{cfg.text}</span>;
}

const inputStyle = {
  background: "var(--forest-2)",
  border: "1px solid var(--line)",
  borderRadius: 6,
  padding: "8px 10px",
  fontSize: 13.5,
  color: "var(--cream)",
  outline: "none",
  fontFamily: "inherit",
};

const fieldLabel = { display: "flex", flexDirection: "column", gap: 4, fontSize: 11, opacity: 0.7 };

const btnGhost = {
  background: "transparent", border: "1px solid var(--line)", color: "var(--cream)",
  borderRadius: 6, padding: "6px 12px", fontSize: 12.5, cursor: "pointer",
};

const btnDanger = {
  background: "transparent", border: "1px solid var(--line)", color: "#E08A7D",
  borderRadius: 6, padding: "6px 12px", fontSize: 12.5, cursor: "pointer",
};

const btnDangerIcon = {
  background: "transparent", border: "1px solid var(--line)", color: "#E08A7D",
  borderRadius: 6, width: 30, height: 30, cursor: "pointer",
};
