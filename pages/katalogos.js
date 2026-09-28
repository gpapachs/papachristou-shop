import { useState } from "react";
import Head from "next/head";
import { getMenu } from "../lib/store";
import { formatPrice } from "../lib/format";
import CategoryNav from "../components/CategoryNav";
import Lightbox from "../components/Lightbox";

export async function getServerSideProps() {
  const data = await getMenu();
  return { props: { data } };
}

export default function Katalogos({ data }) {
  const [zoom, setZoom] = useState(null);
  const visibleCats = data.categories.filter((c) => data.products.some((p) => p.categoryId === c.id));

  return (
    <>
      <Head>
        <title>Ψητοπωλείο Παπαχρήστου — Κατάλογος</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="wrap" style={{ paddingBottom: 60 }}>
        <nav>
          <div className="brand">
            ΠΑΠΑΧΡΗΣΤΟΥ
            <span className="sub">ΠΑΡΑΔΟΣΙΑΚΟ ΨΗΤΟΠΩΛΕΙΟ</span>
          </div>
        </nav>

        <CategoryNav categories={visibleCats} />

        <section className="hero">
          <h1>Ο κατάλογός μας</h1>
          <p>Τιμές τραπεζιού. Καλή όρεξη!</p>
        </section>

        {visibleCats.map((cat) => {
          const products = data.products.filter((p) => p.categoryId === cat.id);
          return (
            <div className="category" id={"cat-" + cat.id} key={cat.id}>
              <h2>{cat.name}</h2>
              {products.map((p) => (
                <div className="product" key={p.id} style={{ gridTemplateColumns: "auto 1fr auto", opacity: p.available ? 1 : 0.45 }}>
                  {p.image ? (
                    <img src={p.image} alt={p.name} onClick={() => setZoom({ src: p.image, name: p.name })} />
                  ) : (
                    <div className="ph" />
                  )}
                  <div>
                    <div className="name">{p.name}{!p.available && "  (μη διαθέσιμο)"}</div>
                    {p.note && <div className="note">{p.note}</div>}
                  </div>
                  <div className="price">{formatPrice(p.priceTableCents)}</div>
                </div>
              ))}
            </div>
          );
        })}

        <footer>© Ψητοπωλείο Παπαχρήστου — Χατζηπέτρου &amp; 25ης Μαρτίου, Τρίκαλα</footer>
      </div>

      <Lightbox image={zoom} onClose={() => setZoom(null)} />
    </>
  );
}
