import { usePrivy } from "@privy-io/react-auth";
import { Scanner } from "@yudiel/react-qr-scanner";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CheckCircle,
  Copy,
  CreditCard,
  DollarSign,
  Download,
  Eye,
  EyeOff,
  Info,
  Loader,
  Lock,
  Scan,
  Send,
  Shield,
  Smartphone,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { encodeFunctionData } from "viem";
import { flowTestnet } from "viem/chains";
import { FloatingOrbs } from "../../components/FloatingOrbs";
import { GlowingButton } from "../../components/GlowingButton";
import { CREDIT_MANAGER_ABI } from "../../contracts/abis/CreditManager";
import { USDC_ABI } from "../../contracts/abis/USDC";
import { useHaloWallet } from "../../hooks/useHaloWallet";
import { HaloWallet } from "../../lib/HaloWallet";
import { getWalletClient, publicClient } from "../../utils/viemUtils";

type CreditSummaryBannerProps = {
  creditLimit: number;
  availableCredit: number;
  outstandingDebt: number;
};

const VirtualCreditCard = ({
  creditLimit,
  availableCredit,
  outstandingDebt,
  userAddress,
  isProcessing = false,
}: CreditSummaryBannerProps & {
  userAddress: string;
  isProcessing?: boolean;
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showPaymentEffect, setShowPaymentEffect] = useState(false);
  const usagePercentage = ((creditLimit - availableCredit) / creditLimit) * 100;

  // Generate card number from wallet address
  const cardNumber = userAddress
    ? `4532 ${userAddress.slice(2, 6).toUpperCase()} ${userAddress.slice(6, 10).toUpperCase()} ${userAddress.slice(-4).toUpperCase()}`
    : "4532 •••• •••• ••••";

  // Payment animation effect
  useEffect(() => {
    if (isProcessing) {
      setShowPaymentEffect(true);
      setIsFlipped(true);

      // Reset after animation
      const timer = setTimeout(() => {
        setShowPaymentEffect(false);
        setIsFlipped(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isProcessing]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="perspective-1000 mb-8"
    >
      <motion.div
        className="relative w-full max-w-md mx-auto"
        animate={{
          rotateY: isFlipped ? 180 : 0,
          scale: isProcessing ? 1.1 : 1,
          rotateX: isProcessing ? 5 : 0,
        }}
        whileHover={{
          rotateY: !isProcessing && showDetails ? 180 : !isProcessing ? 5 : 0,
          scale: !isProcessing ? 1.05 : 1.1,
        }}
        transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Credit Card Front */}
        <motion.div
          className={`relative w-full h-56 bg-gradient-to-br from-purple-600 via-purple-700 to-cyan-600 rounded-2xl shadow-2xl p-6 text-white ${
            isFlipped ? "backface-hidden" : ""
          }`}
          animate={{
            boxShadow: isProcessing
              ? [
                  "0 25px 50px -12px rgba(147, 51, 234, 0.5)",
                  "0 25px 50px -12px rgba(6, 182, 212, 0.5)",
                  "0 25px 50px -12px rgba(147, 51, 234, 0.5)",
                ]
              : "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          }}
          transition={{
            boxShadow: { duration: 1.5, repeat: isProcessing ? Infinity : 0 },
          }}
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* Payment Wave Effect */}
          <AnimatePresence>
            {showPaymentEffect && (
              <motion.div
                initial={{ scale: 0, opacity: 0.8 }}
                animate={{ scale: 3, opacity: 0 }}
                exit={{ scale: 3, opacity: 0 }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="absolute inset-0 rounded-2xl border-4 border-green-400"
              />
            )}
          </AnimatePresence>

          {/* Card Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-2xl overflow-hidden">
            <div className="absolute top-4 right-4 w-16 h-16 border-2 border-white/20 rounded-full"></div>
            <div className="absolute top-8 right-8 w-8 h-8 border-2 border-white/30 rounded-full"></div>

            {/* Animated particles during payment */}
            <AnimatePresence>
              {isProcessing &&
                [...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{
                      x: Math.random() * 100 + "%",
                      y: Math.random() * 100 + "%",
                      scale: 0,
                      opacity: 0,
                    }}
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                      x: [Math.random() * 100 + "%", Math.random() * 100 + "%", Math.random() * 100 + "%"],
                      y: [Math.random() * 100 + "%", Math.random() * 100 + "%", Math.random() * 100 + "%"],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.3,
                    }}
                    className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                  />
                ))}
            </AnimatePresence>
          </div>

          {/* Card Content */}
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={isProcessing ? { rotate: 360 } : { rotate: 0 }}
                  transition={{ duration: 1, repeat: isProcessing ? Infinity : 0 }}
                >
                  <Zap className="w-6 h-6 text-yellow-400" />
                </motion.div>
                <span className="font-bold text-lg">Zivo</span>
              </div>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="p-1 rounded-full hover:bg-white/20 transition-colors"
                disabled={isProcessing}
              >
                {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="space-y-4">
              <motion.div
                className="text-xl font-mono tracking-wider"
                animate={
                  isProcessing
                    ? {
                        textShadow: [
                          "0 0 0px rgba(255,255,255,0)",
                          "0 0 10px rgba(255,255,255,0.8)",
                          "0 0 0px rgba(255,255,255,0)",
                        ],
                      }
                    : {}
                }
                transition={{ duration: 1, repeat: isProcessing ? Infinity : 0 }}
              >
                {showDetails ? cardNumber : cardNumber.replace(/\d(?=\d{4})/g, "•")}
              </motion.div>

              <div className="flex justify-between items-end">
                <div>
                  <div className="text-xs text-white/70 uppercase tracking-wide">Available Credit</div>
                  <motion.div
                    className="text-2xl font-bold"
                    animate={isProcessing ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                    transition={{ duration: 0.5, repeat: isProcessing ? Infinity : 0 }}
                  >
                    ${availableCredit.toLocaleString()}
                  </motion.div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-white/70 uppercase tracking-wide">Expires</div>
                  <div className="font-mono">12/28</div>
                </div>
              </div>
            </div>
          </div>

          {/* Chip with glow effect */}
          <motion.div
            className="absolute top-16 left-6 w-10 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-md"
            animate={
              isProcessing
                ? {
                    boxShadow: [
                      "0 0 0px rgba(251, 191, 36, 0)",
                      "0 0 20px rgba(251, 191, 36, 0.8)",
                      "0 0 0px rgba(251, 191, 36, 0)",
                    ],
                  }
                : {}
            }
            transition={{ duration: 1, repeat: isProcessing ? Infinity : 0 }}
          />

          {/* Contactless symbol with animation */}
          <div className="absolute top-16 right-20">
            <div className="flex space-x-1">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className={`w-3 h-3 border-2 border-white/60 rounded-full ${i > 0 ? "opacity-40" : ""}`}
                  animate={
                    isProcessing
                      ? {
                          scale: [1, 1.3, 1],
                          opacity: [0.6, 1, 0.6],
                        }
                      : {}
                  }
                  transition={{
                    duration: 0.8,
                    repeat: isProcessing ? Infinity : 0,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Credit Card Back (for flip effect) */}
        <motion.div
          className={`absolute inset-0 w-full h-56 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl ${
            isFlipped ? "" : "backface-hidden"
          }`}
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="h-full flex flex-col justify-center items-center text-white p-6">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4"
            >
              <CheckCircle className="w-8 h-8 text-white" />
            </motion.div>
            <div className="text-xl font-bold mb-2">Payment Processing</div>
            <div className="text-gray-300 text-center">
              Your transaction is being
              <br />
              securely processed on the blockchain
            </div>
          </div>
        </motion.div>

        {/* Usage indicator */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-4 bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4"
        >
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Credit Usage</span>
            <span>{usagePercentage.toFixed(1)}% used</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${usagePercentage}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className={`h-2 rounded-full ${
                usagePercentage > 80
                  ? "bg-gradient-to-r from-red-500 to-orange-500"
                  : usagePercentage > 60
                    ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                    : "bg-gradient-to-r from-green-500 to-cyan-500"
              }`}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Limit: ${creditLimit.toLocaleString()}</span>
            <span>Debt: ${outstandingDebt.toFixed(2)}</span>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

type QuickActionsProps = {
  onQuickAmount: (amount: string) => void;
  availableCredit: number;
};

const QuickActions = ({ onQuickAmount, availableCredit }: QuickActionsProps) => {
  const quickAmounts = [25, 50, 100, 250, 500].filter((amount) => amount <= availableCredit);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="mb-6"
    >
      <h3 className="text-sm font-medium text-gray-400 mb-3">Quick Amounts</h3>
      <div className="flex flex-wrap gap-2">
        {quickAmounts.map((amount) => (
          <motion.button
            key={amount}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onQuickAmount(amount.toString())}
            className="px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-300 hover:border-purple-500/50 hover:text-white transition-all duration-300"
          >
            ${amount}
          </motion.button>
        ))}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onQuickAmount(availableCredit.toString())}
          className="px-4 py-2 bg-purple-500/20 border border-purple-500/50 rounded-lg text-purple-300 hover:bg-purple-500/30 transition-all duration-300"
        >
          MAX
        </motion.button>
      </div>
    </motion.div>
  );
};

type TabToggleProps = {
  activeTab: string;
  onTabChange: (tab: string) => void;
};

const TabToggle = ({ activeTab, onTabChange }: TabToggleProps) => {
  return (
    <div className="flex bg-gray-800/50 border border-gray-700/50 rounded-xl p-1 mb-8">
      <motion.button
        whileHover={{ scale: 1.02 }}
        onClick={() => onTabChange("payment")}
        className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-300 relative ${
          activeTab === "payment" ? "text-white" : "text-gray-400 hover:text-white"
        }`}
      >
        {activeTab === "payment" && (
          <motion.div
            layoutId="activeTab"
            className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
        <span className="relative flex items-center gap-2 justify-center">
          <CreditCard className="w-4 h-4" />
          Pay with Credit
        </span>
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.02 }}
        onClick={() => onTabChange("receive")}
        className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-300 relative ${
          activeTab === "receive" ? "text-white" : "text-gray-400 hover:text-white"
        }`}
      >
        {activeTab === "receive" && (
          <motion.div
            layoutId="activeTab"
            className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
        <span className="relative flex items-center gap-2 justify-center">
          <ArrowDown className="w-4 h-4" />
          Receive Payments
        </span>
      </motion.button>
    </div>
  );
};

type QRScannerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onScan: (result: string) => void;
};

const QRScannerModal = ({ isOpen, onClose, onScan }: QRScannerModalProps) => {
  const [scanResult, setScanResult] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (scanResult) {
      onScan(scanResult);
      setScanResult(undefined);
    }
  }, [scanResult, onScan]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 max-w-md w-full"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">Scan QR Code</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="relative mb-4">
          <Scanner
            onScan={(results) => {
              if (Array.isArray(results) && results.length > 0 && results[0].rawValue) {
                setScanResult(results[0].rawValue);
              }
            }}
          />
          <p className="text-gray-400 text-sm mt-2">Point your camera at a QR code to scan the wallet address</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

type PaymentSectionProps = {
  availableCredit: number;
  onPayment: (data: { recipientAddress: string; paymentAmount: string }) => void;
  recipientAddress: string;
  setRecipientAddress: (address: string) => void;
  paymentAmount: string;
  setPaymentAmount: (amount: string) => void;
  isProcessing: boolean;
};

const CREDIT_MANAGER_ADDRESS = import.meta.env.VITE_CREDIT_MANAGER_ADDRESS;
const USDC_ADDRESS = import.meta.env.VITE_USDC_TOKEN_CONTRACT_ADDRESS;

const PaymentSection = ({
  availableCredit,
  onPayment,
  recipientAddress,
  setRecipientAddress,
  paymentAmount,
  setPaymentAmount,
  isProcessing,
}: PaymentSectionProps) => {
  const [showQRScanner, setShowQRScanner] = useState(false);

  const estimatedInterest = paymentAmount ? (parseFloat(paymentAmount) * 0.05) / 12 : 0;
  const isValidPayment =
    recipientAddress && paymentAmount && parseFloat(paymentAmount) > 0 && parseFloat(paymentAmount) <= availableCredit;

  const handleQRScan = (result: string) => {
    setRecipientAddress(result);
    setShowQRScanner(false);
  };

  const handlePasteAddress = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setRecipientAddress(text);
    } catch (err) {
      console.error("Failed to read clipboard:", err);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 space-y-6"
      >
        {/* Security Badge */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
          <Shield className="w-4 h-4 text-green-400" />
          <span>Secured by blockchain technology</span>
          <Lock className="w-4 h-4 text-green-400" />
        </div>

        <QuickActions onQuickAmount={setPaymentAmount} availableCredit={availableCredit} />

        {/* Recipient Address */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Recipient Wallet Address</label>
          <div className="relative">
            <input
              type="text"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              placeholder="0x... or ENS name"
              className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none transition-all duration-300 pr-32"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowQRScanner(true)}
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-300"
                title="Scan QR Code"
              >
                <Scan className="w-4 h-4 text-gray-400" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePasteAddress}
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-300"
                title="Paste from clipboard"
              >
                <Copy className="w-4 h-4 text-gray-400" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Payment Amount */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-400">Payment Amount</label>
            <span className="text-sm text-gray-400">Available: ${availableCredit.toLocaleString()} USDC</span>
          </div>
          <div className="relative">
            <input
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none transition-all duration-300 pr-20 text-2xl font-bold"
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
              <span className="text-gray-400 font-medium">USDC</span>
            </div>
          </div>

          {paymentAmount && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg"
            >
              <div className="flex items-center gap-2 text-sm text-blue-300">
                <Info className="w-4 h-4" />
                <span>Estimated monthly interest: ${estimatedInterest.toFixed(2)} USDC (5% APR)</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Payment Button */}
        <GlowingButton
          onClick={() => onPayment({ recipientAddress, paymentAmount })}
          className="w-full py-4 text-lg font-semibold"
          disabled={!isValidPayment || isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader className="w-6 h-6 animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              <CreditCard className="w-6 h-6" />
              Pay ${paymentAmount || "0"} with Credit
              <Send className="w-6 h-6" />
            </>
          )}
        </GlowingButton>

        {/* Payment Info */}
        <div className="flex items-center gap-2 text-xs text-gray-500 justify-center">
          <Lock className="w-3 h-3" />
          <span>Your payment will be processed instantly on the Flow blockchain</span>
        </div>
      </motion.div>

      <AnimatePresence>
        {showQRScanner && (
          <QRScannerModal isOpen={showQRScanner} onClose={() => setShowQRScanner(false)} onScan={handleQRScan} />
        )}
      </AnimatePresence>
    </>
  );
};

type ReceiveSectionProps = {
  walletAddress: string;
};

const ReceiveSection = ({ walletAddress }: ReceiveSectionProps) => {
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy address:", err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 space-y-6"
    >
      <div className="text-center">
        <h3 className="text-xl font-semibold text-white mb-2">Receive Payments</h3>
        <p className="text-gray-400 text-sm">Share your QR code or wallet address to receive payments</p>
      </div>

      <div className="bg-white p-6 mx-auto w-fit rounded-xl shadow-lg">
        <QRCodeSVG
          value={walletAddress}
          size={200}
          bgColor={"#ffffff"}
          fgColor={"#000000"}
          level={"M"}
          imageSettings={{
            src: "/logo.png",
            x: undefined,
            y: undefined,
            height: 32,
            width: 32,
            opacity: 1,
            excavate: true,
          }}
        />
      </div>

      <div className="space-y-3">
        <div className="text-center">
          <p className="text-sm text-gray-400 mb-2">Your Wallet Address</p>
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 flex items-center justify-between">
            <span className="text-sm font-mono text-gray-300 truncate">
              {walletAddress.slice(0, 16)}...{walletAddress.slice(-6)}
            </span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={copyAddress}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
            </motion.button>
          </div>
        </div>
      </div>

      <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-gray-300">
            Others can scan this QR code or use your wallet address to send you payments directly to your wallet.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

type TransactionStatusProps = {
  status?: "pending" | "success" | "error" | null;
  message?: string;
};

const TransactionStatus = ({ status, message }: TransactionStatusProps) => {
  const getStatusIcon = () => {
    switch (status) {
      case "pending":
        return <Loader className="w-5 h-5 animate-spin" />;
      case "success":
        return <CheckCircle className="w-5 h-5" />;
      case "error":
        return <AlertCircle className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "pending":
        return "text-yellow-400 border-yellow-500/20 bg-yellow-500/10";
      case "success":
        return "text-green-400 border-green-500/20 bg-green-500/10";
      case "error":
        return "text-red-400 border-red-500/20 bg-red-500/10";
      default:
        return "";
    }
  };

  if (!status) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border rounded-xl p-4 ${getStatusColor()}`}
    >
      <div className="flex items-center gap-3">
        {getStatusIcon()}
        <span className="font-medium">{message}</span>
      </div>
    </motion.div>
  );
};

type Transaction = {
  type: string;
  amount: number;
  date: string;
  status: string;
  hash?: string;
  blockNumber?: number;
};

const RecentTransactions = ({
  transactions,
  loading,
  onRefresh,
}: {
  transactions: Transaction[];
  loading: boolean;
  onRefresh?: () => void;
}) => {
  const getTransactionIcon = (type: string): React.ReactElement => {
    switch (type) {
      case "payment":
        return <Send className="w-4 h-4 text-red-400" />;
      case "borrow":
        return <Download className="w-4 h-4 text-green-400" />;
      case "repay":
        return <ArrowUp className="w-4 h-4 text-cyan-400" />;
      case "stake":
        return <Wallet className="w-4 h-4 text-purple-400" />;
      default:
        return <DollarSign className="w-4 h-4 text-gray-400" />;
    }
  };

  interface StatusColorMap {
    [key: string]: string;
  }

  const getStatusColor = (status: string): string => {
    const statusColorMap: StatusColorMap = {
      completed: "text-green-400",
      pending: "text-yellow-400",
      failed: "text-red-400",
    };
    return statusColorMap[status] || "text-gray-400";
  };

  const getTransactionLabel = (type: string): string => {
    switch (type) {
      case "borrow":
        return "Credit Used";
      case "repay":
        return "Payment Made";
      case "stake":
        return "Collateral Added";
      case "payment":
        return "Credit Payment";
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  const openTransactionHash = (hash?: string) => {
    if (hash) {
      window.open(`https://evm-testnet.flowscan.io/tx/${hash}`, "_blank");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-purple-400" />
          Recent Activity
        </h3>
        {onRefresh && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRefresh}
            disabled={loading}
            className="p-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-400 hover:text-white hover:border-purple-500/50 transition-all duration-300 disabled:opacity-50"
            title="Refresh transactions"
          >
            <motion.div
              animate={loading ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 1, repeat: loading ? Infinity : 0, ease: "linear" }}
            >
              <ArrowRight className="w-4 h-4 transform rotate-45" />
            </motion.div>
          </motion.button>
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="text-center py-8">
            <Loader className="w-8 h-8 text-purple-400 mx-auto mb-3 animate-spin" />
            <p className="text-gray-400 text-sm">No activity yet</p>
            <p className="text-gray-500 text-xs mt-1">Your credit card activity will appear here</p>
          </div>
        ) : (
          <div
            className="h-full overflow-y-auto space-y-3 scrollbar-hide pr-2"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {transactions.map((tx, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl hover:bg-gray-800/70 transition-colors cursor-pointer"
                onClick={() => openTransactionHash(tx.hash)}
                title={tx.hash ? "Click to view on explorer" : undefined}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                    {getTransactionIcon(tx.type)}
                  </div>
                  <div>
                    <div className="text-white font-medium">{getTransactionLabel(tx.type)}</div>
                    <div className="text-gray-400 text-sm">{tx.date}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">${tx.amount.toLocaleString()}</div>
                  <div className={`text-sm capitalize ${getStatusColor(tx.status)}`}>{tx.status}</div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

type WalletType = "privy" | "halo" | null;

type WalletSelectorProps = {
  onSelectWallet: (type: WalletType) => void;
  selectedWallet: WalletType;
};

const WalletSelector = ({ onSelectWallet, selectedWallet }: WalletSelectorProps) => {
  const { login: privyLogin } = usePrivy();
  const navigate = useNavigate();

  const handlePrivyConnect = () => {
    onSelectWallet("privy");
    privyLogin();
  };

  const handleHaloConnect = () => {
    onSelectWallet("halo");
    navigate("/welcome"); // Navigate to HaLo connection flow
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8"
    >
      <div className="text-center mb-8">
        <CreditCard className="w-16 h-16 text-purple-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-4">Choose Your Wallet</h2>
        <p className="text-gray-400">
          Connect with a traditional software wallet or use your HaLo NFC hardware wallet for enhanced security
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Privy Wallet Option */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handlePrivyConnect}
          className={`p-6 rounded-xl border-2 transition-all duration-300 text-left ${
            selectedWallet === "privy"
              ? "border-purple-500 bg-purple-500/20"
              : "border-gray-700 hover:border-purple-500/50 bg-gray-800/50"
          }`}
        >
          <div className="flex items-center mb-4">
            <Wallet className="w-8 h-8 text-purple-400 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-white">Software Wallet</h3>
              <p className="text-sm text-gray-400">MetaMask, WalletConnect, etc.</p>
            </div>
          </div>
          <ul className="text-sm text-gray-300 space-y-2">
            <li className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
              Quick setup
            </li>
            <li className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
              Multiple wallet support
            </li>
            <li className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
              Cross-platform
            </li>
          </ul>
        </motion.button>

        {/* HaLo Wallet Option */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleHaloConnect}
          className={`p-6 rounded-xl border-2 transition-all duration-300 text-left ${
            selectedWallet === "halo"
              ? "border-cyan-500 bg-cyan-500/20"
              : "border-gray-700 hover:border-cyan-500/50 bg-gray-800/50"
          }`}
        >
          <div className="flex items-center mb-4">
            <Smartphone className="w-8 h-8 text-cyan-400 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-white">HaLo NFC Wallet</h3>
              <p className="text-sm text-gray-400">Hardware security card</p>
            </div>
          </div>
          <ul className="text-sm text-gray-300 space-y-2">
            <li className="flex items-center">
              <Shield className="w-4 h-4 text-cyan-400 mr-2" />
              Hardware security
            </li>
            <li className="flex items-center">
              <Shield className="w-4 h-4 text-cyan-400 mr-2" />
              NFC signing
            </li>
            <li className="flex items-center">
              <Shield className="w-4 h-4 text-cyan-400 mr-2" />
              Air-gapped security
            </li>
          </ul>
        </motion.button>
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">Both options provide secure access to your virtual credit card</p>
      </div>
    </motion.div>
  );
};

export default function PaymentsPage() {
  const { authenticated, user } = usePrivy();
  const { isConnected: haloConnected, address: haloAddress, clearWalletStorage } = useHaloWallet();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("payment");
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatusState | null>(null);
  const [creditData, setCreditData] = useState({
    creditLimit: 0,
    availableCredit: 0,
    outstandingDebt: 0,
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [recipientAddress, setRecipientAddress] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<WalletType>(null);

  // Determine which wallet is connected and active
  const isWalletConnected = authenticated || haloConnected;
  const currentWalletAddress = authenticated ? user?.wallet?.address : haloAddress;
  const currentWalletType: WalletType = authenticated ? "privy" : haloConnected ? "halo" : null;

  useEffect(() => {
    if (authenticated) {
      setSelectedWallet("privy");
    } else if (haloConnected) {
      setSelectedWallet("halo");
    }
  }, [authenticated, haloConnected]);

  const fetchUserData = async () => {
    if (!currentWalletAddress) return;

    try {
      const data = await publicClient.readContract({
        address: CREDIT_MANAGER_ADDRESS as `0x${string}`,
        abi: CREDIT_MANAGER_ABI,
        functionName: "getCreditInfo",
        args: [currentWalletAddress as `0x${string}`],
      });

      if (data && Array.isArray(data)) {
        const [, creditLimit, borrowedAmount, , totalDebt, , isActive] = data;

        if (!isActive) {
          navigate("/borrow/stake");
          return;
        }

        const creditLimitUSDC = Number(creditLimit) / 1e6;
        const borrowedAmountUSDC = Number(borrowedAmount) / 1e6;
        const totalDebtUSDC = Number(totalDebt) / 1e6;
        const availableCreditUSDC = creditLimitUSDC - borrowedAmountUSDC;

        setCreditData({
          creditLimit: creditLimitUSDC,
          availableCredit: availableCreditUSDC,
          outstandingDebt: totalDebtUSDC,
        });
      }
    } catch (error) {
      console.error("Error fetching credit info:", error);
      navigate("/borrow/stake");
    }
  };

  const fetchTransactionHistory = async () => {
    if (!currentWalletAddress) return;

    try {
      setLoadingTransactions(true);
      const userAddress = currentWalletAddress as `0x${string}`;
      const contractAddress = CREDIT_MANAGER_ADDRESS as `0x${string}`;

      const currentBlock = await publicClient.getBlockNumber();
      let fromBlock = currentBlock - 50000n;

      let borrowEvents: any[] = [];
      let repayEvents: any[] = [];
      let creditOpenedEvents: any[] = [];
      let usdcTransferEvents: any[] = [];

      try {
        [borrowEvents, repayEvents, creditOpenedEvents, usdcTransferEvents] = await Promise.all([
          publicClient.getLogs({
            address: contractAddress,
            event: {
              anonymous: false,
              inputs: [
                { indexed: true, name: "borrower", type: "address" },
                { indexed: false, name: "amount", type: "uint256" },
                { indexed: false, name: "totalBorrowed", type: "uint256" },
                { indexed: false, name: "dueDate", type: "uint256" },
                { indexed: false, name: "timestamp", type: "uint256" },
              ],
              name: "Borrowed",
              type: "event",
            },
            args: { borrower: userAddress },
            fromBlock,
            toBlock: currentBlock,
          }),
          publicClient.getLogs({
            address: contractAddress,
            event: {
              anonymous: false,
              inputs: [
                { indexed: true, name: "borrower", type: "address" },
                { indexed: false, name: "principalAmount", type: "uint256" },
                { indexed: false, name: "interestAmount", type: "uint256" },
                { indexed: false, name: "remainingBalance", type: "uint256" },
                { indexed: false, name: "timestamp", type: "uint256" },
              ],
              name: "Repaid",
              type: "event",
            },
            args: { borrower: userAddress },
            fromBlock,
            toBlock: currentBlock,
          }),
          publicClient.getLogs({
            address: contractAddress,
            event: {
              anonymous: false,
              inputs: [
                { indexed: true, name: "borrower", type: "address" },
                { indexed: false, name: "collateralAmount", type: "uint256" },
                { indexed: false, name: "creditLimit", type: "uint256" },
                { indexed: false, name: "timestamp", type: "uint256" },
              ],
              name: "CreditOpened",
              type: "event",
            },
            args: { borrower: userAddress },
            fromBlock,
            toBlock: currentBlock,
          }),
          publicClient.getLogs({
            address: USDC_ADDRESS as `0x${string}`,
            event: {
              anonymous: false,
              inputs: [
                { indexed: true, name: "from", type: "address" },
                { indexed: true, name: "to", type: "address" },
                { indexed: false, name: "value", type: "uint256" },
              ],
              name: "Transfer",
              type: "event",
            },
            args: { from: userAddress },
            fromBlock,
            toBlock: currentBlock,
          }),
        ]);
      } catch (error) {
        console.warn("Failed to fetch events with large block range, trying without block range:", error);

        try {
          [borrowEvents, repayEvents, creditOpenedEvents, usdcTransferEvents] = await Promise.all([
            publicClient.getLogs({
              address: contractAddress,
              event: {
                anonymous: false,
                inputs: [
                  { indexed: true, name: "borrower", type: "address" },
                  { indexed: false, name: "amount", type: "uint256" },
                  { indexed: false, name: "totalBorrowed", type: "uint256" },
                  { indexed: false, name: "dueDate", type: "uint256" },
                  { indexed: false, name: "timestamp", type: "uint256" },
                ],
                name: "Borrowed",
                type: "event",
              },
              args: { borrower: userAddress },
            }),
            publicClient.getLogs({
              address: contractAddress,
              event: {
                anonymous: false,
                inputs: [
                  { indexed: true, name: "borrower", type: "address" },
                  { indexed: false, name: "principalAmount", type: "uint256" },
                  { indexed: false, name: "interestAmount", type: "uint256" },
                  { indexed: false, name: "remainingBalance", type: "uint256" },
                  { indexed: false, name: "timestamp", type: "uint256" },
                ],
                name: "Repaid",
                type: "event",
              },
              args: { borrower: userAddress },
            }),
            publicClient.getLogs({
              address: contractAddress,
              event: {
                anonymous: false,
                inputs: [
                  { indexed: true, name: "borrower", type: "address" },
                  { indexed: false, name: "collateralAmount", type: "uint256" },
                  { indexed: false, name: "creditLimit", type: "uint256" },
                  { indexed: false, name: "timestamp", type: "uint256" },
                ],
                name: "CreditOpened",
                type: "event",
              },
              args: { borrower: userAddress },
            }),
            publicClient.getLogs({
              address: USDC_ADDRESS as `0x${string}`,
              event: {
                anonymous: false,
                inputs: [
                  { indexed: true, name: "from", type: "address" },
                  { indexed: true, name: "to", type: "address" },
                  { indexed: false, name: "value", type: "uint256" },
                ],
                name: "Transfer",
                type: "event",
              },
              args: { from: userAddress },
            }),
          ]);
        } catch (fallbackError) {
          console.error("Failed to fetch events even without block range:", fallbackError);
        }
      }

      const allTransactions: Transaction[] = [];

      borrowEvents.forEach((event) => {
        if (event.args) {
          const amount = Number(event.args.amount) / 1e6;
          const timestamp = Number(event.args.timestamp) * 1000;
          allTransactions.push({
            type: "borrow",
            amount,
            date: new Date(timestamp).toLocaleDateString(),
            status: "completed",
            hash: event.transactionHash,
            blockNumber: Number(event.blockNumber),
          });
        }
      });

      repayEvents.forEach((event) => {
        if (event.args) {
          const amount = (Number(event.args.principalAmount) + Number(event.args.interestAmount)) / 1e6;
          const timestamp = Number(event.args.timestamp) * 1000;
          allTransactions.push({
            type: "repay",
            amount,
            date: new Date(timestamp).toLocaleDateString(),
            status: "completed",
            hash: event.transactionHash,
            blockNumber: Number(event.blockNumber),
          });
        }
      });

      creditOpenedEvents.forEach((event) => {
        if (event.args) {
          const amount = Number(event.args.collateralAmount) / 1e6;
          const timestamp = Number(event.args.timestamp) * 1000;
          allTransactions.push({
            type: "stake",
            amount,
            date: new Date(timestamp).toLocaleDateString(),
            status: "completed",
            hash: event.transactionHash,
            blockNumber: Number(event.blockNumber),
          });
        }
      });

      usdcTransferEvents.forEach((event) => {
        if (event.args) {
          const amount = Number(event.args.value) / 1e6;
          if (amount > 0.01) {
            const blockAge = Number(currentBlock - event.blockNumber) * 15;
            const estimatedTimestamp = Date.now() - blockAge * 1000;

            allTransactions.push({
              type: "payment",
              amount,
              date: new Date(estimatedTimestamp).toLocaleDateString(),
              status: "completed",
              hash: event.transactionHash,
              blockNumber: Number(event.blockNumber),
            });
          }
        }
      });

      allTransactions.sort((a, b) => (b.blockNumber || 0) - (a.blockNumber || 0));

      const sortedTransactions = allTransactions.slice(0, 5);

      setTransactions(sortedTransactions);
    } catch (error) {
      console.error("Error fetching transaction history:", error);
      setTransactions([]);
    } finally {
      setLoadingTransactions(false);
    }
  };

  useEffect(() => {
    if (isWalletConnected && currentWalletAddress) {
      fetchUserData();
      fetchTransactionHistory();
    }
  }, [isWalletConnected, currentWalletAddress]);

  const recentTransactions = transactions;

  interface PaymentData {
    recipientAddress: string;
    paymentAmount: string;
  }

  interface TransactionStatusState {
    status: "pending" | "success" | "error";
    message: string;
  }

  const handlePayment = async (data: PaymentData): Promise<void> => {
    const { recipientAddress, paymentAmount } = data;
    const amount = parseFloat(paymentAmount);

    if (!currentWalletAddress || amount <= 0) {
      setTransactionStatus({ status: "error", message: "Invalid payment details" });
      return;
    }

    try {
      setIsProcessing(true);
      setTransactionStatus({ status: "pending", message: "Preparing credit payment..." });

      const amountInWei = BigInt(Math.floor(amount * 1e6));

      if (currentWalletType === "halo") {
        // Handle HaLo wallet payment
        const haloWallet = new HaloWallet(currentWalletAddress, publicClient);

        setTransactionStatus({ status: "pending", message: "Please tap your HaLo card to sign..." });

        toast.loading("Tap your HaLo card to sign the credit transaction", {
          duration: 0,
          id: "halo-signing",
        });

        // Borrow from credit line
        const borrowTx = {
          to: CREDIT_MANAGER_ADDRESS as `0x${string}`,
          data: encodeFunctionData({
            abi: CREDIT_MANAGER_ABI,
            functionName: "borrow",
            args: [amountInWei],
          }),
          value: 0n,
        };

        const borrowTxHash = await haloWallet.sendTransaction(borrowTx);

        setTransactionStatus({ status: "pending", message: "Confirming credit usage..." });

        await publicClient.waitForTransactionReceipt({ hash: borrowTxHash });

        setTransactionStatus({ status: "pending", message: "Tap HaLo card again to send payment..." });

        // Transfer to recipient
        const transferTx = {
          to: USDC_ADDRESS as `0x${string}`,
          data: encodeFunctionData({
            abi: USDC_ABI,
            functionName: "transfer",
            args: [recipientAddress as `0x${string}`, amountInWei],
          }),
          value: 0n,
        };

        const transferTxHash = await haloWallet.sendTransaction(transferTx);

        await publicClient.waitForTransactionReceipt({ hash: transferTxHash });

        toast.dismiss("halo-signing");
        toast.success("Payment signed and sent with HaLo!");
      } else {
        // Handle Privy wallet payment
        const walletClient = getWalletClient(currentWalletAddress);
        if (!walletClient) {
          throw new Error("Could not connect to wallet");
        }

        setTransactionStatus({ status: "pending", message: "Using credit line..." });

        const borrowTx = await walletClient.writeContract({
          address: CREDIT_MANAGER_ADDRESS as `0x${string}`,
          abi: CREDIT_MANAGER_ABI,
          functionName: "borrow",
          args: [amountInWei],
          account: currentWalletAddress as `0x${string}`,
          chain: flowTestnet,
        });

        setTransactionStatus({ status: "pending", message: "Confirming credit usage..." });

        await publicClient.waitForTransactionReceipt({ hash: borrowTx });

        setTransactionStatus({ status: "pending", message: "Sending payment to recipient..." });

        const transferTx = await walletClient.writeContract({
          address: USDC_ADDRESS as `0x${string}`,
          abi: USDC_ABI,
          functionName: "transfer",
          args: [recipientAddress as `0x${string}`, amountInWei],
          account: currentWalletAddress as `0x${string}`,
          chain: flowTestnet,
        });

        setTransactionStatus({ status: "pending", message: "Finalizing payment..." });

        await publicClient.waitForTransactionReceipt({ hash: transferTx });
      }

      setTransactionStatus({
        status: "success",
        message: `Credit payment of ${amount.toLocaleString()} USDC sent successfully with ${currentWalletType === "halo" ? "HaLo" : "Privy"}!`,
      });

      await Promise.all([fetchUserData(), fetchTransactionHistory()]);

      setRecipientAddress("");
      setPaymentAmount("");

      setTimeout(() => setTransactionStatus(null), 5000);
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.dismiss("halo-signing");

      let errorMessage = "Credit payment failed. Please try again.";

      if (error.message?.includes("insufficient")) {
        errorMessage = "Insufficient credit limit for this payment.";
      } else if (error.message?.includes("rejected")) {
        errorMessage = "Transaction was rejected by user.";
      } else if (error.message?.includes("credit line")) {
        errorMessage = "Credit line not active. Please activate your credit card first.";
      } else if (currentWalletType === "halo" && error.message?.includes("HaLo")) {
        errorMessage = "HaLo card signing failed. Please try tapping your card again.";
      }

      setTransactionStatus({ status: "error", message: errorMessage });

      setTimeout(() => setTransactionStatus(null), 8000);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDisconnectWallet = () => {
    if (currentWalletType === "halo") {
      clearWalletStorage();
      toast.success("HaLo wallet disconnected");
    }
    setSelectedWallet(null);
    navigate("/welcome");
  };

  // Show wallet selector if no wallet is connected
  if (!isWalletConnected) {
    return (
      <div className="min-h-screen bg-black text-white">
        <FloatingOrbs />

        <div className="relative z-10 max-w-2xl mx-auto px-4 py-24">
          <WalletSelector onSelectWallet={setSelectedWallet} selectedWallet={selectedWallet} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <FloatingOrbs />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
                Virtual Credit Card
              </h1>
              <p className="text-gray-400 mt-2 text-lg">
                Pay instantly with your crypto credit line • Connected via{" "}
                {currentWalletType === "halo" ? "HaLo NFC" : "Privy"}
              </p>
            </div>

            {/* Wallet Info and Disconnect */}
            <div className="flex items-center gap-4">
              {/* <div className="text-right">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  {currentWalletType === "halo" ? (
                    <Smartphone className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <Wallet className="w-4 h-4 text-purple-400" />
                  )}
                  <span className="font-mono">
                    {currentWalletAddress?.slice(0, 6)}...{currentWalletAddress?.slice(-4)}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {currentWalletType === "halo" ? "HaLo NFC Wallet" : "Software Wallet"}
                </div>
              </div> */}

              {/* <button
                onClick={handleDisconnectWallet}
                className="text-red-400 hover:text-red-300 text-sm px-3 py-1 border border-red-400/30 rounded-lg hover:border-red-400/50 transition-colors"
              >
                Disconnect
              </button> */}
            </div>
          </div>
        </div>

        <VirtualCreditCard
          creditLimit={creditData.creditLimit}
          availableCredit={creditData.availableCredit}
          outstandingDebt={creditData.outstandingDebt}
          userAddress={currentWalletAddress || ""}
          isProcessing={isProcessing}
        />

        <TabToggle activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-6 flex flex-col">
            <AnimatePresence mode="wait">
              {activeTab === "payment" ? (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="flex-1"
                >
                  <PaymentSection
                    availableCredit={creditData.availableCredit}
                    onPayment={handlePayment}
                    recipientAddress={recipientAddress}
                    setRecipientAddress={setRecipientAddress}
                    paymentAmount={paymentAmount}
                    setPaymentAmount={setPaymentAmount}
                    isProcessing={isProcessing}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="receive"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="flex-1"
                >
                  <ReceiveSection walletAddress={currentWalletAddress || ""} />
                </motion.div>
              )}

              {/* Wallet-specific navigation */}
              <GlowingButton
                className="mt-4 w-full flex justify-center"
                onClick={() => navigate(currentWalletType === "halo" ? "/borrow/halo" : "/borrow/dashboard")}
              >
                <Wallet className="w-5 h-5" />
                Go to {currentWalletType === "halo" ? "HaLo" : "Credit"} Dashboard
                <ArrowRight className="w-5 h-5" />
              </GlowingButton>
            </AnimatePresence>

            <TransactionStatus status={transactionStatus?.status} message={transactionStatus?.message} />
          </div>

          <div className="lg:h-full">
            <RecentTransactions
              transactions={recentTransactions}
              loading={loadingTransactions}
              onRefresh={fetchTransactionHistory}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
