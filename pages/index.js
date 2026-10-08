import { useMemo, useState } from "react";
import Head from "next/head";
import { getMenu } from "../lib/store";
import { formatPrice } from "../lib/format";
import { resolveLang, UI, catName, prodName, prodNote } from "../lib/i18n";
import CategoryNav from "../components/CategoryNav";
import Lightbox from "../components/Lightbox";
import Marquee from "../components/Marquee";
import LangToggle from "../components/LangToggle";
import VersionTag from "../components/VersionTag";

export async function getServerSideProps({ req, query }) {
  const lang = resolveLang(req, query);
  const data = await getMenu();
  return { props: { data, lang } };
}

export default function Home({ data, lang }) {
  const t = UI[lang];
  const { categories, products } = data;
  const [cart, setCart] = useState({}); // { productId: qty }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [zoom, setZoom] = useState(null);

  const visibleCats = useMemo(
    () => categories.filter((c) => products.some((p) => p.categoryId === c.id)),
    [categories, products]
  );
  const navCats = useMemo(
    () => visibleCats.map((c) => ({ id: c.id, name: catName(c, lang) })),
    [visibleCats, lang]
  );

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
      if (!res.ok) throw new Error(json.error || t.genericError);
      window.location.href = json.url;
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>{t.orderTitle}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Marquee text={t.marquee} />
      <div className="wrap">
        <nav>
          <div className="brand">
            ΠΑΠΑΧΡΗΣΤΟΥ
            <span className="sub">{t.brandSub}</span>
          </div>
          <div className="nav-right">
            <a href="/katalogos" style={{ fontSize: 13, opacity: 0.7, textDecoration: "underline" }}>{t.dineInLink}</a>
            <LangToggle lang={lang} />
          </div>
        </nav>

        <CategoryNav categories={navCats} />

        <section className="hero">
          <h1>{t.orderHero}</h1>
          <p>{t.orderLede}</p>
        </section>

        {visibleCats.map((cat) => {
          const catProducts = products.filter((p) => p.categoryId === cat.id);
          return (
            <div className="category" id={"cat-" + cat.id} key={cat.id}>
              <h2>{catName(cat, lang)}</h2>
              {catProducts.map((p) => {
                const name = prodName(p, lang);
                const note = prodNote(p, lang);
                return (
                  <div className="product" key={p.id}>
                    {p.image ? (
                      <img src={p.image} alt={name} onClick={() => setZoom({ src: p.image, name })} />
                    ) : (
                      <div className="ph" />
                    )}
                    <div>
                      <div className="name">{name}</div>
                      {note && <div className="note">{note}</div>}
                    </div>
                    <div className="price">{formatPrice(p.priceDeliveryCents, lang)}</div>
                    <QtyControl qty={cart[p.id] || 0} onChange={(qty) => setQty(p.id, qty)} disabled={!p.available} unavailable={t.unavailable} />
                  </div>
                );
              })}
            </div>
          );
        })}

        <footer>
          {t.footer}
          <br />
          <VersionTag />
        </footer>
      </div>

      <Lightbox image={zoom} onClose={() => setZoom(null)} closeLabel={t.close} />

      {totalCount > 0 && (
        <div className="cart-bar">
          <span>{totalCount} {t.items} · {formatPrice(totalCents, lang)}</span>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {error && <span style={{ fontSize: 13, color: "#3a1c15" }}>{error}</span>}
            <button className="btn" onClick={checkout} disabled={loading}>
              {loading ? t.wait : t.pay}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function QtyControl({ qty, onChange, disabled, unavailable }) {
  if (disabled) return <span style={{ fontSize: 12, opacity: 0.5 }}>{unavailable}</span>;
  if (qty === 0) return <button className="qty-btn" onClick={() => onChange(1)}>+</button>;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <button className="qty-btn" onClick={() => onChange(qty - 1)}>−</button>
      <span style={{ minWidth: 16, textAlign: "center" }}>{qty}</span>
      <button className="qty-btn" onClick={() => onChange(qty + 1)}>+</button>
    </div>
  );
}
