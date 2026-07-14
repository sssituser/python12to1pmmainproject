/**
 * useSEO – Lightweight hook to set page <title> and meta description dynamically.
 * Usage: useSEO("Page Title | SSSIT", "Description here.")
 */
import { useEffect } from "react";

export function useSEO(title, description = "") {
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

    // Cleanup: restore defaults when component unmounts
    return () => {
      document.title = "SSSIT Placement Portal | Career & Assessment Hub";
    };
  }, [title, description]);
}

export default useSEO;
