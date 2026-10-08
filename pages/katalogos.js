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

export default function Katalogos({ data, lang }) {
  const t = UI[lang];
  const [zoom, setZoom] = useState(null);

  const visibleCats = useMemo(
    () => data.categories.filter((c) => data.products.some((p) => p.categoryId === c.id)),
    [data]
  );
  const navCats = useMemo(
    () => visibleCats.map((c) => ({ id: c.id, name: catName(c, lang) })),
    [visibleCats, lang]
  );

  return (
    <>
      <Head>
        <title>{t.catalogTitle}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Marquee text={t.marquee} />
      <div className="wrap" style={{ paddingBottom: 60 }}>
        <nav>
          <div className="brand">
            ΠΑΠΑΧΡΗΣΤΟΥ
            <span className="sub">{t.brandSub}</span>
          </div>
          <div className="nav-right">
            <LangToggle lang={lang} />
          </div>
        </nav>

        <CategoryNav categories={navCats} />

        <section className="hero">
          <h1>{t.catalogHero}</h1>
          <p>{t.catalogLede}</p>
        </section>

        {visibleCats.map((cat) => {
          const products = data.products.filter((p) => p.categoryId === cat.id);
          return (
            <div className="category" id={"cat-" + cat.id} key={cat.id}>
              <h2>{catName(cat, lang)}</h2>
              {products.map((p) => {
                const name = prodName(p, lang);
                const note = prodNote(p, lang);
                return (
                  <div className="product" key={p.id} style={{ gridTemplateColumns: "auto 1fr auto", opacity: p.available ? 1 : 0.45 }}>
                    {p.image ? (
                      <img src={p.image} alt={name} onClick={() => setZoom({ src: p.image, name })} />
                    ) : (
                      <div className="ph" />
                    )}
                    <div>
                      <div className="name">{name}{!p.available && "  " + t.unavailableParen}</div>
                      {note && <div className="note">{note}</div>}
                    </div>
                    <div className="price">{formatPrice(p.priceTableCents, lang)}</div>
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
    </>
  );
}
