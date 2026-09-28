import { useEffect } from "react";

// Εμφανίζει τη φωτογραφία σε μεγέθυνση πάνω από τη σελίδα.
// Κλείνει με κλικ οπουδήποτε, με το ✕ ή με το πλήκτρο Esc.
export default function Lightbox({ image, onClose }) {
  useEffect(() => {
    if (!image) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [image, onClose]);

  if (!image) return null;

  return (
    <div className="lightbox" onClick={onClose} role="dialog" aria-modal="true" aria-label={image.name}>
      <button className="lightbox-close" onClick={onClose} aria-label="Κλείσιμο">✕</button>
      <figure onClick={(e) => e.stopPropagation()}>
        <img src={image.src} alt={image.name} />
        <figcaption>{image.name}</figcaption>
      </figure>
    </div>
  );
}
