import { createRoot } from "react-dom/client";
import { PaymentPreview } from "../../../components/checkout/PaymentPreview";
import "../../../app/globals.css";

// Test-only component host. No fake credential/configuration switch ships.
createRoot(document.getElementById("root")!).render(<PaymentPreview keysAvailable
  summary={{ productName: "Örnek zeytin · test ürünü", amountKurus: 100, quantity: 1 }} />);
