import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { Token } from "../pages/Lend/types";
import { GlowingButton } from "./GlowingButton";

type ConfirmationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  amount: string | number;
  token: Token;
  type?: "deposit" | "withdraw";
};

export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  amount,
  token,
  type = "deposit",
}: ConfirmationModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 max-w-md w-full"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Confirm {type === "deposit" ? "Deposit" : "Withdrawal"}</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors duration-300">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400">Amount</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-white">{amount}</span>
                  <span className="text-purple-400">{token.symbol}</span>
                </div>
              </div>

              {type === "deposit" && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Estimated APY</span>
                  <span className="text-cyan-400 font-bold">12.5%</span>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <GlowingButton variant="secondary" onClick={onClose} className="flex-1">
                Cancel
              </GlowingButton>
              <GlowingButton variant={type === "deposit" ? "primary" : "danger"} onClick={onConfirm} className="flex-1">
                {type === "deposit" ? "Confirm Deposit" : "Confirm Withdrawal"}
              </GlowingButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
