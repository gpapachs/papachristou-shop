import { getMenu } from "../../lib/store";
import { getVivaAccessToken, VIVA_API_URL, VIVA_CHECKOUT_URL } from "../../lib/viva";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { items, customer } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Άδειο καλάθι." });
    }

    const { products } = await getMenu();

    // Ξαναϋπολογίζουμε το ποσό από τη ΔΙΚΗ ΜΑΣ αποθηκευμένη τιμή διανομής,
    // ποτέ από ό,τι στέλνει ο browser.
    let amountCents = 0;
    const lines = items.map(({ id, qty }) => {
      const product = products.find((p) => p.id === id && p.available);
      if (!product) throw new Error(`Προϊόν μη διαθέσιμο: ${id}`);
      const quantity = Math.max(1, Math.min(20, parseInt(qty, 10) || 1));
      amountCents += product.priceDeliveryCents * quantity;
      return `${quantity}x ${product.name}`;
    });

    const token = await getVivaAccessToken();

    const orderRes = await fetch(`${VIVA_API_URL}/checkout/v2/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountCents,
        customerTrns: lines.join(", ").slice(0, 200),
        merchantTrns: "Ψητοπωλείο Παπαχρήστου",
        sourceCode: process.env.VIVA_SOURCE_CODE || "Default",
        paymentTimeout: 1800,
        preauth: false,
        allowRecurring: false,
        maxInstalments: 1,
        paymentNotification: true,
        disableExactAmount: false,
        disableCash: true,
        disableWallet: true,
        customer: customer
          ? {
              email: customer.email,
              fullName: customer.fullName,
              phone: customer.phone,
              countryCode: "GR",
              requestLang: "el-GR",
            }
          : undefined,
      }),
    });

    if (!orderRes.ok) {
      const text = await orderRes.text();
      throw new Error(`Viva order failed (${orderRes.status}): ${text}`);
    }

    const { orderCode } = await orderRes.json();
    res.status(200).json({ url: `${VIVA_CHECKOUT_URL}?ref=${orderCode}`, orderCode });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Σφάλμα στη δημιουργία πληρωμής." });
  }
}
