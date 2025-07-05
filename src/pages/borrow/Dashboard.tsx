import { usePrivy } from "@privy-io/react-auth";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CreditCard,
  DollarSign,
  ExternalLink,
  Info,
  Plus,
  Shield,
  Target,
  Wallet,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ConnectWalletButton from "../../components/ConnectWalletButton";
import { FloatingOrbs } from "../../components/FloatingOrbs";
import { GlowingButton } from "../../components/GlowingButton";

type CreditSummaryCardProps = {
  creditLimit: number;
  usedCredit: number;
  availableCredit: number;
};

const CreditSummaryCard = ({ creditLimit, usedCredit, availableCredit }: CreditSummaryCardProps) => {
  const usagePercentage = (usedCredit / creditLimit) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 text-center"
    >
      <div className="flex items-center justify-center gap-2 mb-4">
        <CreditCard className="w-6 h-6 text-cyan-400" />
        <h2 className="text-xl font-semibold text-white">Credit Overview</h2>
      </div>

      <div className="mb-6">
        <div className="text-5xl font-bold text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text mb-2">
          ${creditLimit.toLocaleString()}
        </div>
        <div className="text-gray-400">Total Credit Limit</div>
      </div>

      <div className="mb-6">
        <div className="text-2xl font-bold text-white mb-2">${availableCredit.toLocaleString()}</div>
        <div className="text-gray-400 text-sm">Available Credit</div>
      </div>

      {/* Credit Usage Bar */}
      <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${usagePercentage}%` }}
          transition={{ duration: 1, delay: 0.5 }}
          className="bg-gradient-to-r from-purple-500 to-cyan-500 h-3 rounded-full"
        />
      </div>
      <div className="flex justify-between text-sm text-gray-400">
        <span>Used: ${usedCredit.toLocaleString()}</span>
        <span>{usagePercentage.toFixed(1)}% utilized</span>
      </div>
    </motion.div>
  );
};

type CollateralCardProps = {
  stakedAmount: number;
  onStakeMore: () => void;
};

const CollateralCard = ({ stakedAmount, onStakeMore }: CollateralCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="flex flex-col justify-between bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Collateral</h3>
        </div>
        <div className="group relative">
          <Info className="w-4 h-4 text-gray-400 cursor-help" />
          <div className="absolute right-0 top-6 w-64 bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            Your staked USDC acts as collateral and determines your credit limit
          </div>
        </div>
      </div>

      <div className="text-center mb-6">
        <div className="text-3xl font-bold text-white mb-1">${stakedAmount.toLocaleString()}</div>
        <div className="text-gray-400 text-sm">USDC Staked</div>
      </div>

      <GlowingButton onClick={onStakeMore} className="w-full">
        <Plus className="w-4 h-4" />
        Stake More
      </GlowingButton>
    </motion.div>
  );
};

type OutstandingLoanCardProps = {
  principal: number;
  interest: number;
  isOverdue: boolean;
  daysUntilDue: number;
  onRepay: () => void;
};

const OutstandingLoanCard = ({ principal, interest, isOverdue, daysUntilDue, onRepay }: OutstandingLoanCardProps) => {
  const totalDebt = principal + interest;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className={`flex flex-col justify-between bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border rounded-2xl p-6 ${
        isOverdue ? "border-red-500/50" : "border-gray-700/50"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">Outstanding Loan</h3>
        </div>
        {(isOverdue || daysUntilDue <= 3) && (
          <div className="flex items-center gap-1 text-orange-400">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">{isOverdue ? "Overdue" : `${daysUntilDue} days left`}</span>
          </div>
        )}
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between">
          <span className="text-gray-400">Principal</span>
          <span className="text-white font-medium">${principal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Interest</span>
          <span className="text-white font-medium">${interest.toFixed(2)}</span>
        </div>
        <div className="border-t border-gray-700 pt-3">
          <div className="flex justify-between">
            <span className="text-white font-semibold">Total Debt</span>
            <span className="text-xl font-bold text-cyan-400">${totalDebt.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <GlowingButton onClick={onRepay} className="w-full">
        Make Repayment
        <ArrowRight className="w-4 h-4" />
      </GlowingButton>
    </motion.div>
  );
};

type ReputationCardProps = {
  creditScore: number;
  potentialIncrease: number;
  onViewDetails: () => void;
};

const ReputationCard = ({ creditScore, potentialIncrease, onViewDetails }: ReputationCardProps) => {
  const scorePercentage = (creditScore / 850) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="flex flex-col justify-between bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-white">Credit Score</h3>
      </div>

      <div className="text-center mb-6">
        <div className="text-4xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text mb-2">
          {creditScore}
        </div>
        <div className="text-gray-400 text-sm">Your Credit Score</div>
      </div>

      {/* Score Progress Bar */}
      <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${scorePercentage}%` }}
          transition={{ duration: 1, delay: 0.8 }}
          className="bg-gradient-to-r from-purple-500 to-cyan-500 h-2 rounded-full"
        />
      </div>

      <div className="text-center mb-4">
        <div className="text-sm text-gray-400 mb-1">Potential Credit Increase</div>
        <div className="text-lg font-semibold text-cyan-400">+${potentialIncrease.toLocaleString()}</div>
      </div>

      <GlowingButton onClick={onViewDetails} variant="secondary" className="w-full">
        View Details
        <ExternalLink className="w-4 h-4" />
      </GlowingButton>
    </motion.div>
  );
};

type ActivityType = "borrow" | "repay" | "stake" | "payment" | string;
type ActivityStatus = "completed" | "pending" | "failed" | string;

type RecentActivityProps = {
  activities: {
    type: ActivityType;
    amount: number;
    date: string;
    status: ActivityStatus;
  }[];
  onViewAll: () => void;
};

const RecentActivity = ({ activities, onViewAll }: RecentActivityProps) => {
  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case "borrow":
        return <ArrowDown className="w-4 h-4 text-red-400" />;
      case "repay":
        return <ArrowUp className="w-4 h-4 text-green-400" />;
      case "stake":
        return <Shield className="w-4 h-4 text-purple-400" />;
      case "payment":
        return <DollarSign className="w-4 h-4 text-cyan-400" />;
      default:
        return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: ActivityStatus): string => {
    switch (status) {
      case "completed":
        return "text-green-400";
      case "pending":
        return "text-yellow-400";
      case "failed":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
        </div>
        <GlowingButton onClick={onViewAll} variant="secondary">
          View All
        </GlowingButton>
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
            className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                {getActivityIcon(activity.type)}
              </div>
              <div>
                <div className="text-white font-medium capitalize">{activity.type}</div>
                <div className="text-gray-400 text-sm">{activity.date}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white font-medium">${activity.amount.toLocaleString()}</div>
              <div className={`text-sm capitalize ${getStatusColor(activity.status)}`}>{activity.status}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default function BorrowerDashboard() {
  const { ready, authenticated, user, login } = usePrivy();
  const naviagte = useNavigate();

  // Mock data
  const dashboardData = {
    creditLimit: 10000,
    usedCredit: 3500,
    availableCredit: 6500,
    stakedCollateral: 8500,
    loanPrincipal: 3500,
    loanInterest: 87.5,
    isOverdue: false,
    daysUntilDue: 5,
    creditScore: 720,
    potentialIncrease: 2500,
    recentActivities: [
      { type: "borrow", amount: 1500, date: "2 days ago", status: "completed" },
      { type: "stake", amount: 2000, date: "1 week ago", status: "completed" },
      { type: "repay", amount: 500, date: "2 weeks ago", status: "completed" },
      { type: "borrow", amount: 2000, date: "3 weeks ago", status: "completed" },
      { type: "payment", amount: 125, date: "1 month ago", status: "completed" },
    ],
  };

  const handleStakeMore = () => {
    naviagte("/borrow/stake");
    console.log("Navigate to Stake Collateral page");
  };

  const handleRepay = () => {
    console.log("Navigate to Repay Loan page");
  };

  const handleViewReputation = () => {
    console.log("Navigate to Reputation Details page");
  };

  const handleViewAllActivity = () => {
    console.log("Navigate to Activity Log page");
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-black text-white">
        <FloatingOrbs />
        <ConnectWalletButton />

        <div className="relative z-10 max-w-2xl mx-auto px-4 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 text-center"
          >
            <Wallet className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Connect Wallet to View Dashboard</h2>
            <p className="text-gray-400 mb-6">
              Connect your wallet to access your borrower dashboard and manage your credit
            </p>
            <GlowingButton onClick={login} className="text-lg px-8 py-4">
              Connect Wallet
              <ArrowRight className="w-5 h-5" />
            </GlowingButton>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <FloatingOrbs />
      <ConnectWalletButton />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
            Your Credit Overview
          </h1>
        </motion.div>

        {/* Credit Summary - Full Width */}
        <div className="mb-8">
          <CreditSummaryCard
            creditLimit={dashboardData.creditLimit}
            usedCredit={dashboardData.usedCredit}
            availableCredit={dashboardData.availableCredit}
          />
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <CollateralCard stakedAmount={dashboardData.stakedCollateral} onStakeMore={handleStakeMore} />

          <OutstandingLoanCard
            principal={dashboardData.loanPrincipal}
            interest={dashboardData.loanInterest}
            isOverdue={dashboardData.isOverdue}
            daysUntilDue={dashboardData.daysUntilDue}
            onRepay={handleRepay}
          />

          <ReputationCard
            creditScore={dashboardData.creditScore}
            potentialIncrease={dashboardData.potentialIncrease}
            onViewDetails={handleViewReputation}
          />
        </div>

        {/* Recent Activity - Full Width */}
        <RecentActivity activities={dashboardData.recentActivities} onViewAll={handleViewAllActivity} />
      </div>
    </div>
  );
}
