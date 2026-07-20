/**
 * Central API Configuration
 * Leverages Vite environment variables with dynamic browser runtime fallbacks
 * to ensure compatibility with local development, containerized setups, testing, and production builds.
 */

// Primary backend domain configuration
const BACKEND_HOST = import.meta.env?.VITE_API_URL 
  || (typeof window !== 'undefined' ? `http://${window.location.hostname}:8000` : 'http://localhost:8000');

export const API_BASE_URL = BACKEND_HOST;
export const API_URL = `${API_BASE_URL}/api`;

