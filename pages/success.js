import { useRouter } from "next/router";
import Head from "next/head";
import { resolveLang, UI } from "../lib/i18n";
import LangToggle from "../components/LangToggle";

export async function getServerSideProps({ req, query }) {
  return { props: { lang: resolveLang(req, query) } };
}

export default function Success({ lang }) {
  const t = UI[lang];
  const router = useRouter();
  // Το Viva προσθέτει αυτές τις παραμέτρους στο URL όταν σε στέλνει πίσω:
  // s = κωδικός παραγγελίας, t = κωδικός συναλλαγής
  const { s, t: txn } = router.query;

  return (
    <div className="wrap" style={{ paddingTop: 40, textAlign: "center" }}>
      <Head>
        <title>{t.thanks}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <LangToggle lang={lang} />
      </div>
      <h1 style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", marginTop: 40 }}>{t.thanks}</h1>
      <p style={{ opacity: 0.8, maxWidth: 480, margin: "0 auto 24px" }}>{t.thanksText}</p>
      {(s || txn) && (
        <p style={{ fontSize: 12, opacity: 0.4 }}>
          {t.orderNo}: {s || txn}
        </p>
      )}
      <a href="/" className="btn" style={{ display: "inline-block", marginTop: 20, textDecoration: "none" }}>
        {t.backToMenu}
      </a>
    </div>
  );
}
