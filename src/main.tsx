import { PrivyProvider } from "@privy-io/react-auth";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const appId = import.meta.env.VITE_PRIVY_APP_ID;
const clientId = import.meta.env.VITE_PRIVY_CLIENT_ID;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PrivyProvider
      appId={appId}
      clientId={clientId}
      config={{
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
        },
        appearance: {
          theme: "dark",
          // logo: "",
          landingHeader: "Welcome to FlowCredit",
          loginMessage: "Connect your wallet or create an account to access decentralized credit",
        },
      }}
    >
      <App />
    </PrivyProvider>
  </StrictMode>
);
