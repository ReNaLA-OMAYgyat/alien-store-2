import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import App from "./App.jsx";
import "./index.css";
import "animate.css/animate.min.css";
import axios from "axios";
import AOS from "aos";
import "aos/dist/aos.css";
// Initialize AOS animations once at startup
AOS.init({ duration: 700, easing: "ease-out-cubic", once: true });

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
