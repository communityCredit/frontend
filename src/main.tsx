// Import polyfills first, before any other imports
import "./polyfills";

import { PrivyProvider } from "@privy-io/react-auth";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { flowTestnet } from "viem/chains";
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
        defaultChain: flowTestnet,
        supportedChains: [flowTestnet],
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
        },
        appearance: {
          theme: "dark",
          logo: "/logo.png",
          landingHeader: "Welcome to FlowCredit",
          loginMessage: "Connect your wallet or create an account to access decentralized credit",
        },
      }}
    >
      <App />
    </PrivyProvider>
  </StrictMode>
);
