import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// UI LIBS
import 'mdb-ui-kit/css/mdb.min.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import "bootstrap-icons/font/bootstrap-icons.css"
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

// ROUTER
import { BrowserRouter } from "react-router-dom"

// PDF
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

// ✅ GOOGLE OAUTH
//import { GoogleOAuthProvider } from "@react-oauth/google"

// 🔥 ADD YOUR CLIENT ID HERE
//const GOOGLE_CLIENT_ID = "593269339291-kleojkcokfijos790jnpsqujd1gk8jkd.apps.googleusercontent.com";

createRoot(document.getElementById("root")).render(
  <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>
  
);