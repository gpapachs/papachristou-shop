import { useRouter } from "next/router";

// Κουμπί ΕΛ | EN. Θυμάται την επιλογή (cookie) και ξαναφορτώνει τα δεδομένα της σελίδας
// στη νέα γλώσσα χωρίς να χάνεται το καλάθι ή η θέση που έχεις φτάσει.
export default function LangToggle({ lang }) {
  const router = useRouter();

  function choose(next) {
    if (next === lang) return;
    try {
      document.cookie = `lang=${next}; path=/; max-age=31536000; SameSite=Lax`;
    } catch (e) {}
    const { lang: _ignored, ...rest } = router.query; // ένα ?lang= στο link θα υπερίσχυε του cookie
    router.replace({ pathname: router.pathname, query: rest }, undefined, { scroll: false });
  }

  return (
    <div className="lang-toggle" role="group" aria-label="Language / Γλώσσα">
      {["el", "en"].map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          className={"lang-btn" + (l === lang ? " active" : "")}
          aria-pressed={l === lang}
          onClick={() => choose(l)}
        >
          {l === "el" ? "ΕΛ" : "EN"}
        </button>
      ))}
    </div>
  );
}
