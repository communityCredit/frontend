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
  DollarSign,
  Download,
  Info,
  Loader,
  Scan,
  Send,
  Settings,
  Wallet,
  X,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import React, { useEffect, useState } from "react";
import ConnectWalletButton from "../../components/ConnectWalletButton";
import { FloatingOrbs } from "../../components/FloatingOrbs";
import { GlowingButton } from "../../components/GlowingButton";

type TopBarProps = {
  onSettingsClick: () => void;
  isConnected: boolean;
  walletAddress: string;
  onConnect: () => void;
};

const TopBar = ({ onSettingsClick }: TopBarProps) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
          Use Your Credit
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSettingsClick}
          className="p-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-400 hover:text-white hover:border-purple-500/50 transition-all duration-300"
        >
          <Settings className="w-5 h-5" />
        </motion.button>
        <ConnectWalletButton />
      </div>
    </div>
  );
};

type CreditSummaryBannerProps = {
  creditLimit: number;
  availableCredit: number;
  outstandingDebt: number;
};

const CreditSummaryBanner = ({ creditLimit, availableCredit, outstandingDebt }: CreditSummaryBannerProps) => {
  const usagePercentage = ((creditLimit - availableCredit) / creditLimit) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 mb-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text">
            ${creditLimit.toLocaleString()}
          </div>
          <div className="text-gray-400 text-sm">Credit Limit</div>
        </div>

        <div className="text-center">
          <div className="text-3xl font-bold text-white">${availableCredit.toLocaleString()}</div>
          <div className="text-gray-400 text-sm">Available Credit</div>
        </div>

        <div className="text-center">
          <div className="text-3xl font-bold text-orange-400">${outstandingDebt.toFixed(2)}</div>
          <div className="text-gray-400 text-sm">Outstanding Debt</div>
        </div>
      </div>

      <div className="w-full bg-gray-700 rounded-full h-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${usagePercentage}%` }}
          transition={{ duration: 1, delay: 0.5 }}
          className="bg-gradient-to-r from-purple-500 to-cyan-500 h-3 rounded-full"
        />
      </div>
      <div className="flex justify-between mt-2 text-sm text-gray-400">
        <span>Used: ${(creditLimit - availableCredit).toLocaleString()}</span>
        <span>{usagePercentage.toFixed(1)}% utilized</span>
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
          <Send className="w-4 h-4" />
          Make a Payment
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

// QR Code Scanner Modal Component
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
      console.log("QR Code Scanned:", scanResult);
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
          <p className="text-gray-400 text-sm">Point your camera at a QR code to scan the wallet address</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

type PaymentSectionProps = {
  availableCredit: number;
  onPayment: (data: { recipientAddress: string; paymentAmount: string }) => void;
};

const PaymentSection = ({ availableCredit, onPayment }: PaymentSectionProps) => {
  const [recipientAddress, setRecipientAddress] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [showQRScanner, setShowQRScanner] = useState(false);

  const estimatedInterest = paymentAmount ? (parseFloat(paymentAmount) * 0.05) / 12 : 0;
  const isValidPayment =
    recipientAddress && paymentAmount && parseFloat(paymentAmount) > 0 && parseFloat(paymentAmount) <= availableCredit;

  const handleQRScan = (result: string) => {
    setRecipientAddress(result);
    setShowQRScanner(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 space-y-6"
      >
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
              className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none transition-all duration-300 pr-20"
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
              <span className="text-gray-400">USDC</span>
              <button
                onClick={() => setPaymentAmount(availableCredit.toString())}
                className="px-3 py-1 bg-purple-500/20 border border-purple-500/50 rounded-lg text-purple-400 hover:text-purple-300 transition-colors duration-300 text-sm font-medium"
              >
                MAX
              </button>
            </div>
          </div>

          {paymentAmount && (
            <div className="mt-2 text-sm text-gray-400">
              Estimated monthly interest: ${estimatedInterest.toFixed(2)} USDC
            </div>
          )}
        </div>

        {/* Pay Button */}
        <GlowingButton
          onClick={() => onPayment({ recipientAddress, paymentAmount })}
          className="w-full"
          disabled={!isValidPayment}
        >
          Pay Now
          <Send className="w-5 h-5" />
        </GlowingButton>

        {/* Info Note */}
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-300">
              Payments draw from your credit line. Interest applies after 30-day grace period.
            </p>
          </div>
        </div>
      </motion.div>

      {/* QR Scanner Modal */}
      <AnimatePresence>
        {showQRScanner && (
          <QRScannerModal isOpen={showQRScanner} onClose={() => setShowQRScanner(false)} onScan={handleQRScan} />
        )}
      </AnimatePresence>
    </>
  );
};

// QR Code Component for displaying wallet address
const QRCodeDisplay = ({ address }: { address: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple QR code placeholder - in real app, use a QR code library
  const qrCodeData = `data:image/svg+xml;base64,${btoa(`
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="white"/>
      <rect x="20" y="20" width="160" height="160" fill="black"/>
      <rect x="40" y="40" width="120" height="120" fill="white"/>
      <rect x="60" y="60" width="80" height="80" fill="black"/>
      <rect x="80" y="80" width="40" height="40" fill="white"/>
      <text x="100" y="105" text-anchor="middle" font-size="8" fill="black">QR</text>
    </svg>
  `)}`;

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="bg-white p-4 rounded-xl">
        <img src={qrCodeData} alt="QR Code" className="w-48 h-48" />
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-400 mb-2">Your Wallet Address</p>
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 flex items-center gap-2">
          <span className="text-sm text-white font-mono">{address}</span>
          <button onClick={handleCopy} className="p-1 hover:bg-gray-700/50 rounded transition-colors">
            {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
          </button>
        </div>
      </div>
    </div>
  );
};

type ReceiveSectionProps = {
  walletAddress: string;
};

const ReceiveSection = ({ walletAddress }: ReceiveSectionProps) => {
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
      <div className="bg-white p-4 mx-auto w-fit rounded-lg">
        <QRCodeSVG
          value={walletAddress}
          bgColor={"#ffffff"}
          fgColor={"#000000"}
          level={"L"}
          imageSettings={{
            src: "https://static.zpao.com/favicon.png",
            x: undefined,
            y: undefined,
            height: 24,
            width: 24,
            opacity: 1,
            excavate: true,
          }}
        />
      </div>
      <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-gray-300">
            Others can scan this QR code or use your wallet address to send you payments directly.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

type BorrowSectionProps = {
  availableCredit: number;
  onBorrow: (data: { borrowAmount: string }) => void;
};

const BorrowSection = ({ availableCredit, onBorrow }: BorrowSectionProps) => {
  const [borrowAmount, setBorrowAmount] = useState("");

  const interestRate = 5.0; // 5% APR
  const gracePeriod = 30; // days
  const isValidBorrow = borrowAmount && parseFloat(borrowAmount) > 0 && parseFloat(borrowAmount) <= availableCredit;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 space-y-6"
    >
      {/* Borrow Amount */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-gray-400">Borrow Amount</label>
          <span className="text-sm text-gray-400">Available: ${availableCredit.toLocaleString()} USDC</span>
        </div>
        <div className="relative">
          <input
            type="number"
            value={borrowAmount}
            onChange={(e) => setBorrowAmount(e.target.value)}
            placeholder="0.00"
            className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none transition-all duration-300 pr-20"
          />
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            <span className="text-gray-400">USDC</span>
            <button
              onClick={() => setBorrowAmount(availableCredit.toString())}
              className="px-3 py-1 bg-purple-500/20 border border-purple-500/50 rounded-lg text-purple-400 hover:text-purple-300 transition-colors duration-300 text-sm font-medium"
            >
              MAX
            </button>
          </div>
        </div>
      </div>

      {/* Terms Summary */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Loan Terms</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-cyan-400">{interestRate}%</div>
            <div className="text-gray-400 text-sm">Annual Interest Rate</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">{gracePeriod}</div>
            <div className="text-gray-400 text-sm">Grace Period (Days)</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">Flexible</div>
            <div className="text-gray-400 text-sm">Repayment Terms</div>
          </div>
        </div>
      </div>

      {/* Borrow Button */}
      <GlowingButton onClick={() => onBorrow({ borrowAmount })} className="w-full" disabled={!isValidBorrow}>
        Borrow Now
        <Download className="w-5 h-5" />
      </GlowingButton>

      {/* Info Note */}
      <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-gray-300">
            Borrowed funds are transferred directly to your wallet. Interest accrues after the grace period.
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
};

const RecentTransactions = ({ transactions }: { transactions: Transaction[] }) => {
  const getTransactionIcon = (type: string): React.ReactElement => {
    switch (type) {
      case "payment":
        return <Send className="w-4 h-4 text-red-400" />;
      case "borrow":
        return <Download className="w-4 h-4 text-green-400" />;
      case "repay":
        return <ArrowUp className="w-4 h-4 text-cyan-400" />;
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6"
    >
      <h3 className="text-lg font-semibold text-white mb-4">Recent Transactions</h3>

      <div className="space-y-3">
        {transactions.map((tx, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
            className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                {getTransactionIcon(tx.type)}
              </div>
              <div>
                <div className="text-white font-medium capitalize">{tx.type}</div>
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
    </motion.div>
  );
};

export default function PaymentsPage() {
  const { ready, authenticated, user, login } = usePrivy();

  const [activeTab, setActiveTab] = useState("payment");
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatusState | null>(null);

  // Mock data
  const creditData = {
    creditLimit: 10000,
    availableCredit: 6500,
    outstandingDebt: 3587.5,
  };

  const recentTransactions = [
    { type: "payment", amount: 250, date: "2 hours ago", status: "completed" },
    { type: "borrow", amount: 1500, date: "1 day ago", status: "completed" },
    { type: "payment", amount: 75, date: "3 days ago", status: "completed" },
    { type: "repay", amount: 500, date: "1 week ago", status: "completed" },
  ];

  interface PaymentData {
    recipientAddress: string;
    paymentAmount: string;
  }

  interface TransactionStatusState {
    status: "pending" | "success" | "error";
    message: string;
  }

  const handlePayment = (data: PaymentData): void => {
    setTransactionStatus({ status: "pending", message: "Processing payment..." });

    setTimeout(() => {
      setTransactionStatus({ status: "success", message: "Payment sent successfully!" });
      setTimeout(() => setTransactionStatus(null), 3000);
    }, 2000);
  };

  interface BorrowData {
    borrowAmount: string;
  }

  const handleBorrow = (data: BorrowData): void => {
    setTransactionStatus({ status: "pending", message: "Processing loan..." });

    setTimeout(() => {
      setTransactionStatus({ status: "success", message: "Funds borrowed successfully!" });
      setTimeout(() => setTransactionStatus(null), 3000);
    }, 2000);
  };

  const handleSettingsClick = () => {
    console.log("Navigate to Dashboard");
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-black text-white">
        <FloatingOrbs />

        <div className="relative z-10 max-w-2xl mx-auto px-4 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 text-center"
          >
            <Wallet className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Connect Wallet to Access Payments</h2>
            <p className="text-gray-400 mb-6">Connect your wallet to make payments and manage your credit line</p>
            <GlowingButton onClick={login}>
              Connect Wallet
              <ArrowRight className="w-5 h-5" />
            </GlowingButton>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <FloatingOrbs />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Top Bar */}
        <TopBar
          onSettingsClick={handleSettingsClick}
          isConnected={authenticated}
          walletAddress={user?.wallet?.address || ""}
          onConnect={login}
        />

        {/* Credit Summary Banner */}
        <CreditSummaryBanner
          creditLimit={creditData.creditLimit}
          availableCredit={creditData.availableCredit}
          outstandingDebt={creditData.outstandingDebt}
        />

        {/* Tab Toggle */}
        <TabToggle activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            {/* Action Section */}
            <AnimatePresence mode="wait">
              {activeTab === "payment" ? (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <PaymentSection availableCredit={creditData.availableCredit} onPayment={handlePayment} />
                </motion.div>
              ) : (
                <motion.div
                  key="receive"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ReceiveSection walletAddress={user?.wallet?.address || ""} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Transaction Status */}
            <TransactionStatus status={transactionStatus?.status} message={transactionStatus?.message} />
          </div>

          {/* Recent Transactions */}
          <RecentTransactions transactions={recentTransactions} />
        </div>
      </div>
    </div>
  );
}
