import { useRouter } from "next/router";

export default function Success() {
  const router = useRouter();
  // Το Viva προσθέτει αυτές τις παραμέτρους στο URL όταν σε στέλνει πίσω:
  // s = κωδικός παραγγελίας, t = κωδικός συναλλαγής
  const { s, t } = router.query;

  return (
    <div className="wrap" style={{ paddingTop: 80, textAlign: "center" }}>
      <h1 style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic" }}>Ευχαριστούμε! 🎉</h1>
      <p style={{ opacity: 0.8, maxWidth: 480, margin: "0 auto 24px" }}>
        Η πληρωμή σου ολοκληρώθηκε. Θα ετοιμάσουμε την παραγγελία σου αμέσως —
        αν χρειαστεί, θα σε καλέσουμε στο τηλέφωνο που άφησες.
      </p>
      {(s || t) && (
        <p style={{ fontSize: 12, opacity: 0.4 }}>
          Αριθμός παραγγελίας: {s || t}
        </p>
      )}
      <a href="/" className="btn" style={{ display: "inline-block", marginTop: 20, textDecoration: "none" }}>
        Πίσω στο μενού
      </a>
    </div>
  );
}
