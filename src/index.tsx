import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Desktop, Mobile, Dashboard, Solutions } from "./screens";
import { useDeviceType } from "./hooks/useDeviceType";

const App = () => {
  const deviceType = useDeviceType();

  // Solutions page — biq product site
  return <Solutions />;
};

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
