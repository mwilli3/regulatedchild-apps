import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { FreeAppGate } from "../lib/FreeAppGate.jsx";

createRoot(document.getElementById("root")).render(
  <FreeAppGate
    appId="scripts"
    appName="In-the-Moment Scripts"
    kicker="Free pack"
    lede="What to say when it counts. Enter your email for instant access — we'll also send you a copy."
  >
    <App />
  </FreeAppGate>
);
