import Head from "next/head";
import { getMenu } from "../lib/store";
import { formatPrice } from "../lib/format";

export async function getServerSideProps() {
  const data = await getMenu();
  return { props: { data } };
}

export default function Katalogos({ data }) {
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

        <section className="hero">
          <h1>Ο κατάλογός μας</h1>
          <p>Τιμές τραπεζιού. Καλή όρεξη!</p>
        </section>

        {data.categories.map((cat) => {
          const products = data.products.filter((p) => p.categoryId === cat.id);
          if (products.length === 0) return null;
          return (
            <div className="category" key={cat.id}>
              <h2>{cat.name}</h2>
              {products.map((p) => (
                <div className="product" key={p.id} style={{ gridTemplateColumns: "auto 1fr auto", opacity: p.available ? 1 : 0.45 }}>
                  {p.image ? <img src={p.image} alt={p.name} /> : <div className="ph" />}
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
    </>
  );
}
