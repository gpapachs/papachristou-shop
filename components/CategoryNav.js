import { useEffect, useRef, useState } from "react";

// Μενού κατηγοριών στο πάνω μέρος: μένει κολλημένο όσο κάνεις scroll,
// πατάς μια κατηγορία και σε πάει εκεί, και τονίζει αυτόματα σε ποια βρίσκεσαι.
export default function CategoryNav({ categories }) {
  const [active, setActive] = useState(categories[0]?.id);
  const barRef = useRef(null);
  const pillRefs = useRef({});

  useEffect(() => {
    const els = categories.map((c) => document.getElementById("cat-" + c.id)).filter(Boolean);
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id.replace("cat-", ""));
      },
      { rootMargin: "-90px 0px -60% 0px", threshold: 0 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [categories]);

  // Κρατάμε την ενεργή κατηγορία ορατή μέσα στη μπάρα (σε κινητό που κάνει scroll πλάγια)
  useEffect(() => {
    const bar = barRef.current;
    const pill = pillRefs.current[active];
    if (!bar || !pill) return;
    bar.scrollTo({ left: pill.offsetLeft - bar.clientWidth / 2 + pill.clientWidth / 2, behavior: "smooth" });
  }, [active]);

  const go = (e, id) => {
    e.preventDefault();
    setActive(id);
    document.getElementById("cat-" + id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="cat-nav" ref={barRef}>
      {categories.map((c) => (
        <a
          key={c.id}
          href={"#cat-" + c.id}
          ref={(el) => (pillRefs.current[c.id] = el)}
          className={"cat-pill" + (active === c.id ? " active" : "")}
          onClick={(e) => go(e, c.id)}
        >
          {c.name}
        </a>
      ))}
    </div>
  );
}
