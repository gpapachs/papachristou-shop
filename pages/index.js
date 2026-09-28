import { useMemo, useState } from "react";
import Head from "next/head";
import { getMenu } from "../lib/store";
import { formatPrice } from "../lib/format";
import CategoryNav from "../components/CategoryNav";
import Lightbox from "../components/Lightbox";
import Marquee from "../components/Marquee";

export async function getServerSideProps() {
  const data = await getMenu();
  return { props: { data } };
}

export default function Home({ data }) {
  const { categories, products } = data;
  const [cart, setCart] = useState({}); // { productId: qty }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [zoom, setZoom] = useState(null);
  const visibleCats = categories.filter((c) => products.some((p) => p.categoryId === c.id));

  const setQty = (id, qty) => {
    setCart((c) => {
      const next = { ...c };
      if (qty <= 0) delete next[id];
      else next[id] = qty;
      return next;
    });
  };

  const items = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, qty]) => ({ product: products.find((p) => p.id === id), qty }))
        .filter((i) => i.product),
    [cart, products]
  );

  const totalCents = items.reduce((sum, i) => sum + i.product.priceDeliveryCents * i.qty, 0);
  const totalCount = items.reduce((sum, i) => sum + i.qty, 0);

  async function checkout() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: items.map((i) => ({ id: i.product.id, qty: i.qty })) }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Κάτι πήγε στραβά.");
      window.location.href = json.url;
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Ψητοπωλείο Παπαχρήστου — Παραγγελία online</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Marquee />
      <div className="wrap">
        <nav>
          <div className="brand">
            ΠΑΠΑΧΡΗΣΤΟΥ
            <span className="sub">ΠΑΡΑΔΟΣΙΑΚΟ ΨΗΤΟΠΩΛΕΙΟ</span>
          </div>
          <a href="/katalogos" style={{ fontSize: 13, opacity: 0.7, textDecoration: "underline" }}>Κατάλογος τραπεζιού</a>
        </nav>

        <CategoryNav categories={visibleCats} />

        <section className="hero">
          <h1>Πεινάσαμε;-)</h1>
          <p>Σουβλάκι, κοντοσούβλι και μπριζόλες στα κάρβουνα. Διάλεξε, πλήρωσε online με κάρτα, παρέλαβε ζεστό.</p>
        </section>

        {visibleCats.map((cat) => {
          const catProducts = products.filter((p) => p.categoryId === cat.id);
          return (
            <div className="category" id={"cat-" + cat.id} key={cat.id}>
              <h2>{cat.name}</h2>
              {catProducts.map((p) => (
                <div className="product" key={p.id}>
                  {p.image ? (
                    <img src={p.image} alt={p.name} onClick={() => setZoom({ src: p.image, name: p.name })} />
                  ) : (
                    <div className="ph" />
                  )}
                  <div>
                    <div className="name">{p.name}</div>
                    {p.note && <div className="note">{p.note}</div>}
                  </div>
                  <div className="price">{formatPrice(p.priceDeliveryCents)}</div>
                  <QtyControl qty={cart[p.id] || 0} onChange={(qty) => setQty(p.id, qty)} disabled={!p.available} />
                </div>
              ))}
            </div>
          );
        })}

        <footer>© Ψητοπωλείο Παπαχρήστου — Χατζηπέτρου &amp; 25ης Μαρτίου, Τρίκαλα</footer>
      </div>

      <Lightbox image={zoom} onClose={() => setZoom(null)} />

      {totalCount > 0 && (
        <div className="cart-bar">
          <span>{totalCount} προϊόντα · {formatPrice(totalCents)}</span>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {error && <span style={{ fontSize: 13, color: "#3a1c15" }}>{error}</span>}
            <button className="btn" onClick={checkout} disabled={loading}>
              {loading ? "Μια στιγμή..." : "Πληρωμή με κάρτα (Viva) →"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function QtyControl({ qty, onChange, disabled }) {
  if (disabled) return <span style={{ fontSize: 12, opacity: 0.5 }}>Μη διαθέσιμο</span>;
  if (qty === 0) return <button className="qty-btn" onClick={() => onChange(1)}>+</button>;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <button className="qty-btn" onClick={() => onChange(qty - 1)}>−</button>
      <span style={{ minWidth: 16, textAlign: "center" }}>{qty}</span>
      <button className="qty-btn" onClick={() => onChange(qty + 1)}>+</button>
    </div>
  );
}
