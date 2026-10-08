// Μικρή ένδειξη έκδοσης, π.χ. "v1.4.0 · a1b2c3d".
// Το δεύτερο κομμάτι είναι ο κωδικός του commit από το GitHub/Vercel (εμφανίζεται μόνο online).
export default function VersionTag() {
  const version = process.env.NEXT_PUBLIC_APP_VERSION;
  const commit = process.env.NEXT_PUBLIC_APP_COMMIT;
  const label = "v" + version + (commit ? " · " + commit : "");
  return (
    <span className="version-tag" title="Έκδοση / commit">
      {label}
    </span>
  );
}
