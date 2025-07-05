import { usePrivy } from "@privy-io/react-auth";
import { motion } from "framer-motion";
import { Wallet } from "lucide-react";

export default function ConnectWalletButton() {
  const { ready, authenticated, user, login, logout } = usePrivy();

  return (
    <div className="fixed top-6 right-6 z-50">
      {authenticated ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => logout()}
          className="flex items-center gap-3 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/50 rounded-xl px-8 py-2 backdrop-blur-xl"
        >
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <div className=" font-medium text-white">Disconnect</div>
          <Wallet className="w-5 h-5 text-purple-400" />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => login()}
          className="flex items-center gap-3 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/50 rounded-xl px-8 py-2 backdrop-blur-xl"
        >
          <div className=" font-medium text-white">Connect</div>
          <Wallet className="w-5 h-5 text-purple-400" />
        </motion.div>
      )}
    </div>
  );
}
