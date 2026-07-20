import { useEffect } from "react";

export function useSEO(title, description = "", canonicalUrl = "") {
  useEffect(() => {
    // Set document title
    document.title = title
      ? `${title} | SSSIT Placement Portal`
      : "SSSIT Placement Portal | Career & Assessment Hub";

    // Set meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    if (description) {
      metaDesc.setAttribute("content", description);
    }

    // Set OG title
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle && title) ogTitle.setAttribute("content", title);

    // Set OG description
    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc && description) ogDesc.setAttribute("content", description);

    // Set canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    const finalCanonical = canonicalUrl || window.location.href;
    canonical.setAttribute("href", finalCanonical);

    // Cleanup: restore defaults when component unmounts
    return () => {
      document.title = "SSSIT Placement Portal | Career & Assessment Hub";
      if (canonical && canonical.parentNode) {
        // Keep canonical but set back to window location or default base URL
        canonical.setAttribute("href", window.location.origin);
      }
    };
  }, [title, description, canonicalUrl]);
}

export default useSEO;

