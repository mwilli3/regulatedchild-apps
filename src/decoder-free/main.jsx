import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { FreeAppGate } from "../lib/FreeAppGate.jsx";

createRoot(document.getElementById("root")).render(
  <FreeAppGate
    appId="decode"
    appName="Behavior Decoder"
    kicker="Free tool"
    lede="Translate a behavior into a body state. Enter your email for instant access — we'll also send you a copy."
  >
    <App />
  </FreeAppGate>
);
