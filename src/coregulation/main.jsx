import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { FreeAppGate } from "../lib/FreeAppGate.jsx";

createRoot(document.getElementById("root")).render(
  <FreeAppGate
    appId="regulate"
    appName="The Co-Regulation Guide"
    kicker="Free guide"
    lede="Steady your child by steadying yourself. Enter your email for instant access — we'll also send you a copy."
  >
    <App />
  </FreeAppGate>
);
