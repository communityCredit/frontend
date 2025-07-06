import { execHaloCmdWeb } from "@arx-research/libhalo/api/web";
import { AnimatePresence, motion } from "framer-motion";
import { CreditCard, Globe, Shield, Smartphone, TrendingUp, Wallet, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FloatingOrbs } from "../components/FloatingOrbs";
import { GlowingButton } from "../components/GlowingButton";
import { useHaloWallet } from "../hooks/useHaloWallet";
import type { HaloCommand, HaloOptions, HaloResponse } from "../interface/global";
import { cleanAddress } from "../utils/addressUtils";

const FeatureCard = ({
  icon: Icon,
  title,
  description,
  delay = 0,
}: {
  icon: any;
  title: string;
  description: string;
  delay?: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4 hover:border-purple-500/50 transition-all duration-300 group"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h3 className="font-semibold text-white text-sm">{title}</h3>
          <p className="text-gray-400 text-xs">{description}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default function WelcomeScreen() {
  const navigate = useNavigate();
  const { isConnected, saveWalletToStorage } = useHaloWallet();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isConnected) {
      console.log(isLoading);
      navigate("/borrow");
    }
  }, [isConnected, navigate]);

  const loadWallet = async (): Promise<void> => {
    setIsLoading(true);

    const command: HaloCommand = {
      name: "sign",
      keyNo: 1,
      message: "0123",
    };

    let res: HaloResponse;

    try {
      const options: HaloOptions = {
        statusCallback: (cause: string) => {
          switch (cause) {
            case "init":
              toast.loading("Tap your HaLo card to your phone", {
                duration: 5000,
                icon: "📱",
                style: {
                  background: "rgba(17, 24, 39, 0.95)",
                  color: "#fff",
                  border: "1px solid rgba(107, 114, 128, 0.5)",
                },
              });
              break;
            case "retry":
              toast.error("Please try tapping again", {
                duration: 3000,
                icon: "🔄",
                style: {
                  background: "rgba(17, 24, 39, 0.95)",
                  color: "#fff",
                  border: "1px solid rgba(239, 68, 68, 0.5)",
                },
              });
              break;
            case "scanned":
              toast.success("Card detected! Processing...", {
                duration: 2000,
                icon: "✅",
                style: {
                  background: "rgba(17, 24, 39, 0.95)",
                  color: "#fff",
                  border: "1px solid rgba(34, 197, 94, 0.5)",
                },
              });
              break;
            default:
              toast.error(cause, {
                duration: 3000,
                icon: "⚠️",
                style: {
                  background: "rgba(17, 24, 39, 0.95)",
                  color: "#fff",
                  border: "1px solid rgba(239, 68, 68, 0.5)",
                },
              });
          }
        },
      };

      res = (await execHaloCmdWeb(command, options)) as HaloResponse;

      const walletData = {
        address: cleanAddress(res.etherAddress),
        publicKey: res.publicKey,
        isConnected: true,
      };

      saveWalletToStorage(walletData);

      toast.success("Zivo wallet connected successfully!", {
        duration: 3000,
        icon: "🎉",
        style: {
          background: "rgba(17, 24, 39, 0.95)",
          color: "#fff",
          border: "1px solid rgba(34, 197, 94, 0.5)",
        },
      });

      // Add a small delay for better UX
      setTimeout(() => {
        navigate("/borrow");
      }, 1000);
    } catch (e) {
      toast.error("Connection failed: " + (e instanceof Error ? e.message : String(e)), {
        duration: 5000,
        icon: "❌",
        style: {
          background: "rgba(17, 24, 39, 0.95)",
          color: "#fff",
          border: "1px solid rgba(239, 68, 68, 0.5)",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: CreditCard,
      title: "Virtual Credit Card",
      description: "Instant crypto credit payments",
    },
    {
      icon: Shield,
      title: "NFC Security",
      description: "Hardware-grade protection",
    },
    {
      icon: Globe,
      title: "Cross-Chain",
      description: "Multi-blockchain support",
    },
    {
      icon: TrendingUp,
      title: "Build Credit",
      description: "Improve your DeFi reputation",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <FloatingOrbs />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="pt-8 px-6"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
              Zivo
            </h1>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 space-y-8">
          {/* Title and Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-center space-y-4"
          >
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
              Welcome to the Future
            </h2>
            <p className="text-gray-400 text-lg max-w-md mx-auto">
              Crypto credit payments made simple with your HaLo card.
              <span className="text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text">
                {" "}
                Tap, Pay, Prosper. 🚀
              </span>
            </p>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="grid grid-cols-2 gap-3 max-w-md w-full"
          >
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={0.8 + index * 0.1}
              />
            ))}
          </motion.div>

          {/* Connection Status */}
          <AnimatePresence>
            {!isConnected && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4 max-w-md w-full"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">Ready to Connect</p>
                    <p className="text-gray-400 text-xs">Tap your HaLo card to get started</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="p-6 mx-auto"
        >
          <GlowingButton onClick={loadWallet}>
            <Smartphone className="w-5 h-5" />
            Connect HaLo Card
          </GlowingButton>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="text-center text-gray-500 text-xs mt-4"
          >
            Secure • Decentralized • Your Keys, Your Control
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
