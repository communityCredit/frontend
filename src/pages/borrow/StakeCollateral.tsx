import { usePrivy } from "@privy-io/react-auth";
import { motion } from "framer-motion";
import { ArrowRight, DollarSign, Wallet } from "lucide-react";
import { useState } from "react";
import ConnectWalletButton from "../../components/ConnectWalletButton";
import { FloatingOrbs } from "../../components/FloatingOrbs";
import { GlowingButton } from "../../components/GlowingButton";

export default function StakeCollateral() {
  const { ready, authenticated, user, login } = usePrivy();
  const [stakeAmount, setStakeAmount] = useState("");
  const [walletAddress] = useState("0x4f2a...8c3d");

  const usdcBalance = 5420.75;
  const reputationMultiplier = 1.25;
  const baseCreditRatio = 0.8;

  const calculateCreditLimit = () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) return 0;
    return parseFloat(stakeAmount) * baseCreditRatio * reputationMultiplier;
  };

  const handleStake = () => {
    if (!authenticated) {
      login();
      return;
    }

    if (!stakeAmount || parseFloat(stakeAmount) <= 0) return;

    console.log("Staking:", {
      amount: stakeAmount,
      expectedCreditLimit: calculateCreditLimit(),
    });
  };

  const isValidAmount = stakeAmount && parseFloat(stakeAmount) > 0 && parseFloat(stakeAmount) <= usdcBalance;

  return (
    <div className="min-h-screen bg-black text-white">
      <FloatingOrbs />

      {/* Wallet Connection Status */}
      <ConnectWalletButton />

      <div className="relative z-10 max-w-lg mx-auto px-4 py-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
            Stake USDC as Collateral
          </h1>
        </motion.div>

        {!authenticated ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 text-center"
          >
            <Wallet className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Connect Wallet to Continue</h2>
            <p className="text-gray-400 mb-6">Connect your wallet to stake USDC and establish your credit line</p>
            <GlowingButton onClick={login} className="text-lg px-8 py-4">
              Connect Wallet
              <ArrowRight className="w-5 h-5" />
            </GlowingButton>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8"
          >
            {/* Amount Input */}
            <div className="mb-8">
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 focus-within:border-purple-500/50 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <input
                    type="number"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    placeholder="0.00"
                    className="bg-transparent text-4xl font-bold text-white placeholder-gray-500 focus:outline-none w-full"
                  />
                  <div className="flex items-center gap-3">
                    <span className="text-xl text-gray-400">USDC</span>
                    <button
                      onClick={() => setStakeAmount(usdcBalance.toString())}
                      className="px-3 py-1 bg-purple-500/20 border border-purple-500/50 rounded-lg text-purple-400 hover:text-purple-300 transition-colors duration-300 text-sm font-medium"
                    >
                      MAX
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-3 px-2">
                <span className="text-gray-400 text-sm">Balance: {usdcBalance.toFixed(2)} USDC</span>
              </div>
            </div>

            {/* Estimated Credit Limit */}
            {stakeAmount && parseFloat(stakeAmount) > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-800/50 border border-cyan-500/30 rounded-xl p-6 mb-8"
              >
                <div className="text-center">
                  <div className="text-gray-400 text-sm mb-2">Estimated Credit Limit</div>
                  <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text">
                    ${calculateCreditLimit().toFixed(2)}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Info Text */}
            <div className="text-center text-gray-400 text-sm mb-8 leading-relaxed">
              Your staked USDC secures your credit line and determines your initial borrowing power.
            </div>

            {/* Stake Button */}
            <GlowingButton onClick={handleStake} className="w-full text-xl py-6" disabled={!isValidAmount}>
              Confirm & Stake
              <DollarSign className="w-6 h-6" />
            </GlowingButton>
          </motion.div>
        )}
      </div>
    </div>
  );
}
