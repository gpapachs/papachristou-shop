import fs from "fs";
import path from "path";

const LOCAL_PATH = path.join(process.cwd(), "data", "menu.json");
const ROW_ID = "main";

function hasSupabase() {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

async function getClient() {
  const { createClient } = await import("@supabase/supabase-js");
  // Χρησιμοποιούμε το service role key — έχει πλήρη πρόσβαση και δουλεύει
  // ΜΟΝΟ server-side (μέσα σε API routes / getServerSideProps), ποτέ στον
  // browser, άρα είναι ασφαλές να το κρατάμε ως μυστικό env var.
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function getMenu() {
  if (hasSupabase()) {
    const supabase = await getClient();
    const { data, error } = await supabase
      .from("menu")
      .select("data")
      .eq("id", ROW_ID)
      .maybeSingle();

    if (error) throw new Error(`Supabase read failed: ${error.message}`);
    if (data) return data.data;

    // Πρώτη φορά: γεμίζουμε τον πίνακα με τα αρχικά δεδομένα του data/menu.json
    const seed = JSON.parse(fs.readFileSync(LOCAL_PATH, "utf-8"));
    const { error: insertError } = await supabase.from("menu").insert({ id: ROW_ID, data: seed });
    if (insertError) throw new Error(`Supabase seed failed: ${insertError.message}`);
    return seed;
  }
  return JSON.parse(fs.readFileSync(LOCAL_PATH, "utf-8"));
}

export async function saveMenu(data) {
  if (hasSupabase()) {
    const supabase = await getClient();
    const { error } = await supabase
      .from("menu")
      .upsert({ id: ROW_ID, data, updated_at: new Date().toISOString() });
    if (error) throw new Error(`Supabase write failed: ${error.message}`);
    return;
  }
  // Τοπικά (npm run dev) γράφουμε κατευθείαν στο αρχείο.
  // ΠΡΟΣΟΧΗ: αυτό ΔΕΝ δουλεύει όταν το site τρέχει live στο Vercel —
  // εκεί ΠΡΕΠΕΙ να έχεις συνδέσει Supabase (βλ. README), αλλιώς
  // το διαχειριστικό δεν θα μπορεί να αποθηκεύσει αλλαγές.
  fs.writeFileSync(LOCAL_PATH, JSON.stringify(data, null, 2));
}
