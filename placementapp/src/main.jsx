import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// ⚡ Tailwind CSS only for performance.

// ROUTER
import { BrowserRouter } from "react-router-dom"


// ✅ GOOGLE OAUTH
import { GoogleOAuthProvider } from "@react-oauth/google"

// 🔥 ADD YOUR CLIENT ID HERE
const GOOGLE_CLIENT_ID = "593269339291-kleojkcokfijos790jnpsqujd1gk8jkd.apps.googleusercontent.com";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>
);
