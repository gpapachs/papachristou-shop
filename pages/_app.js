import { useEffect } from "react";
import "../styles/globals.css";

export default function App({ Component, pageProps }) {
  // Κρατάμε το lang του <html> σύμφωνο με τη γλώσσα της σελίδας (προσβασιμότητα / μηχανές αναζήτησης)
  useEffect(() => {
    if (pageProps && pageProps.lang) document.documentElement.lang = pageProps.lang;
  }, [pageProps && pageProps.lang]);

  return <Component {...pageProps} />;
}
