import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { FreeAppGate } from "../lib/FreeAppGate.jsx";

createRoot(document.getElementById("root")).render(
  <FreeAppGate
    appId="body"
    appName="The Body Behind the Behavior"
    kicker="Free guide"
    lede="See what your child's nervous system is really saying. Enter your email for instant access — we'll also send you a copy."
  >
    <App />
  </FreeAppGate>
);
