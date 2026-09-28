// Κυλιόμενο banner στο πάνω μέρος της σελίδας.
// Άλλαξε το κείμενο εδώ:
const TEXT = "Πεινάσαμε??? Ψητοπωλείο Παπαχρήστου και χορτάσαμε...!!! Τα καλύτερα ψητά της πόλης";

export default function Marquee() {
  // Δύο ίδιες ομάδες δίπλα-δίπλα ώστε η κίνηση να επαναλαμβάνεται χωρίς κενό.
  const group = (key) => (
    <div className="marquee-group" key={key} aria-hidden={key === "b" ? "true" : undefined}>
      {[0, 1, 2, 3].map((i) => (
        <span key={i}>
          {TEXT}
          <span className="marquee-sep">✦</span>
        </span>
      ))}
    </div>
  );

  return (
    <div className="marquee" role="marquee" aria-label={TEXT}>
      <div className="marquee-track">
        {group("a")}
        {group("b")}
      </div>
    </div>
  );
}
