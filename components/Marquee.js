// Κυλιόμενο banner στο πάνω μέρος της σελίδας.
// Το κείμενο (ελληνικά και αγγλικά) αλλάζει στο lib/i18n.js, στο πεδίο "marquee".
export default function Marquee({ text }) {
  // Δύο ίδιες ομάδες δίπλα-δίπλα ώστε η κίνηση να επαναλαμβάνεται χωρίς κενό.
  const group = (key) => (
    <div className="marquee-group" key={key} aria-hidden={key === "b" ? "true" : undefined}>
      {[0, 1, 2, 3].map((i) => (
        <span key={i}>
          {text}
          <span className="marquee-sep">✦</span>
        </span>
      ))}
    </div>
  );

  return (
    <div className="marquee" role="marquee" aria-label={text}>
      <div className="marquee-track">
        {group("a")}
        {group("b")}
      </div>
    </div>
  );
}
