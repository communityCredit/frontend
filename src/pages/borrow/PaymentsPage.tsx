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
  Wallet,
  X,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { flowTestnet } from "viem/chains";
import ConnectWalletButton from "../../components/ConnectWalletButton";
import { FloatingOrbs } from "../../components/FloatingOrbs";
import { GlowingButton } from "../../components/GlowingButton";
import { CREDIT_MANAGER_ABI } from "../../contracts/abis/CreditManager";
import { USDC_ABI } from "../../contracts/abis/USDC";
import { getWalletClient, publicClient } from "../../utils/viemUtils";

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
          <p className="text-gray-400 text-sm">Point your camera at a QR code to scan the wallet address</p>
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

        <GlowingButton
          onClick={() => onPayment({ recipientAddress, paymentAmount })}
          className="w-full"
          disabled={!isValidPayment || isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Pay Now
              <Send className="w-5 h-5" />
            </>
          )}
        </GlowingButton>
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
            src: "/logo.png",
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
        return "Borrowed";
      case "repay":
        return "Repaid";
      case "stake":
        return "Staked Collateral";
      case "payment":
        return "Payment";
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
        <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
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
            <p className="text-gray-400 text-sm">Loading transaction history...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-3">
              <DollarSign className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-400 text-sm">No transactions found</p>
            <p className="text-gray-500 text-xs mt-1">Your transaction history will appear here</p>
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

export default function PaymentsPage() {
  const { authenticated, user, login } = usePrivy();

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

  const fetchUserData = async () => {
    if (!user?.wallet?.address) return;

    try {
      const data = await publicClient.readContract({
        address: CREDIT_MANAGER_ADDRESS as `0x${string}`,
        abi: CREDIT_MANAGER_ABI,
        functionName: "getCreditInfo",
        args: [user.wallet.address as `0x${string}`],
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
    if (!user?.wallet?.address) return;

    try {
      setLoadingTransactions(true);
      const userAddress = user.wallet.address as `0x${string}`;
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
    if (authenticated && user?.wallet?.address) {
      fetchUserData();
      fetchTransactionHistory();
    }
  }, [authenticated, user?.wallet?.address]);

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

    if (!user?.wallet?.address || amount <= 0) {
      setTransactionStatus({ status: "error", message: "Invalid payment details" });
      return;
    }

    try {
      setIsProcessing(true);
      setTransactionStatus({ status: "pending", message: "Preparing payment..." });

      const walletClient = getWalletClient(user.wallet.address);
      if (!walletClient) {
        throw new Error("Could not connect to wallet");
      }

      const amountInWei = BigInt(Math.floor(amount * 1e6));

      setTransactionStatus({ status: "pending", message: "Borrowing funds..." });

      const borrowTx = await walletClient.writeContract({
        address: CREDIT_MANAGER_ADDRESS as `0x${string}`,
        abi: CREDIT_MANAGER_ABI,
        functionName: "borrow",
        args: [amountInWei],
        account: user.wallet.address as `0x${string}`,
        chain: flowTestnet,
      });

      setTransactionStatus({ status: "pending", message: "Waiting for borrow confirmation..." });

      await publicClient.waitForTransactionReceipt({ hash: borrowTx });

      setTransactionStatus({ status: "pending", message: "Transferring funds to recipient..." });

      const transferTx = await walletClient.writeContract({
        address: USDC_ADDRESS as `0x${string}`,
        abi: USDC_ABI,
        functionName: "transfer",
        args: [recipientAddress as `0x${string}`, amountInWei],
        account: user.wallet.address as `0x${string}`,
        chain: flowTestnet,
      });

      setTransactionStatus({ status: "pending", message: "Waiting for transfer confirmation..." });

      await publicClient.waitForTransactionReceipt({ hash: transferTx });

      setTransactionStatus({
        status: "success",
        message: `Payment of $${amount.toLocaleString()} USDC sent successfully!`,
      });

      await Promise.all([fetchUserData(), fetchTransactionHistory()]);

      setRecipientAddress("");
      setPaymentAmount("");

      setTimeout(() => setTransactionStatus(null), 5000);
    } catch (error: any) {
      console.error("Payment error:", error);
      let errorMessage = "Payment failed. Please try again.";

      if (error.message?.includes("insufficient")) {
        errorMessage = "Insufficient credit limit for this payment.";
      } else if (error.message?.includes("rejected")) {
        errorMessage = "Transaction was rejected by user.";
      } else if (error.message?.includes("credit line")) {
        errorMessage = "Credit line not active. Please stake collateral first.";
      }

      setTransactionStatus({ status: "error", message: errorMessage });

      setTimeout(() => setTransactionStatus(null), 8000);
    } finally {
      setIsProcessing(false);
    }
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
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
            Use Your Credit
          </h1>
          <ConnectWalletButton />
        </div>

        <CreditSummaryBanner
          creditLimit={creditData.creditLimit}
          availableCredit={creditData.availableCredit}
          outstandingDebt={creditData.outstandingDebt}
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
                  <ReceiveSection walletAddress={user?.wallet?.address || ""} />
                </motion.div>
              )}
              <GlowingButton className="mt-4 w-full flex justify-center" onClick={() => navigate("/borrow/dashboard")}>
                Go to Dashboard
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
