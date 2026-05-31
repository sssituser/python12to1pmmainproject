import { lazy } from "react";

export const lazyWithRetry = (componentImport) =>
  lazy(async () => {
    try {
      return await componentImport();
    } catch (error) {
      console.error("Chunk loading failed, reloading...", error);
      const lastReload = window.sessionStorage.getItem("last-chunk-reload");
      const now = Date.now();
      
      // Reload the page to load fresh assets, limiting to once every 5 seconds to prevent infinite reload loops
      if (!lastReload || now - parseInt(lastReload, 10) > 5000) {
        window.sessionStorage.setItem("last-chunk-reload", now.toString());
        window.location.reload();
        return new Promise(() => {}); // Keep React in fallback state while the browser reloads
      }
      throw error;
    }
  });
