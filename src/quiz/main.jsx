import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { FreeAppGate } from "../lib/FreeAppGate.jsx";

createRoot(document.getElementById("root")).render(
  <FreeAppGate
    appId="quiztrc"
    appName="Regulation Profile Quiz"
    kicker="Free quiz"
    lede="Discover your child's regulation profile. Enter your email to take the quiz — we'll also send you the result."
    cta="Take the quiz"
  >
    <App />
  </FreeAppGate>
);
