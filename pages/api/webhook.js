// Το Viva λειτουργεί λίγο διαφορετικά από το Stripe:
// 1) Όταν καταχωρείς αυτό το URL ως webhook στο Viva dashboard, σου δείχνει
//    ένα "Verification Key". Το βάζεις στο VIVA_WEBHOOK_VERIFICATION_KEY.
// 2) Το Viva κάνει ένα GET σε αυτό το URL για να επιβεβαιώσει ότι το ελέγχεις —
//    πρέπει να απαντήσουμε με { "Key": "<το ίδιο κλειδί>" }.
// 3) Μετά, για κάθε πληρωμή, το Viva στέλνει POST με τα στοιχεία της συναλλαγής.
// Έγγραφα: https://developer.viva.com/webhooks-for-payments/

export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({ Key: process.env.VIVA_WEBHOOK_VERIFICATION_KEY });
  }

  if (req.method === "POST") {
    const event = req.body;

    // EventTypeId 1796 = Transaction Payment Created (επιτυχής πληρωμή)
    if (event?.EventTypeId === 1796) {
      const { OrderCode, Amount, Email, FullName } = event.EventData || {};
      // ΕΔΩ μπαίνει ό,τι θες να γίνεται όταν επιβεβαιωθεί μια παραγγελία:
      // π.χ. ειδοποίηση στο κατάστημα (email/SMS/Slack/Telegram),
      // καταγραφή σε βάση δεδομένων κ.λπ. Προς το παρόν απλώς το καταγράφουμε.
      console.log("Νέα πληρωμένη παραγγελία:", { OrderCode, Amount, Email, FullName });
    }

    return res.status(200).json({ received: true });
  }

  res.status(405).end();
}
