import { Menu } from "lucide-react";
import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import ConnectWalletButton from "../../components/ConnectWalletButton";
import { Sidebar } from "../../components/Navigation/LendSidebar";

export default function LendLayout() {
  // const { ready, authenticated, user, login, logout } = usePrivy();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes("deposit")) return "deposit";
    if (path.includes("portfolio")) return "portfolio";
    return "deposit";
  };

  const handleMenuToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleTabChange = (tabId: string) => {
    if (tabId === "deposit") {
      navigate("/lend/deposit");
    } else if (tabId === "portfolio") {
      navigate("/lend/portfolio");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <ConnectWalletButton />
      {/* Mobile Menu Button */}
      <button
        onClick={handleMenuToggle}
        className="fixed top-6 left-6 z-50 lg:hidden bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-xl p-3 text-gray-400 hover:text-white transition-all duration-300 hover:border-purple-500/50"
      >
        <Menu className="w-6 h-6" />
      </button>

      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          activeTab={getActiveTab()}
          onTabChange={handleTabChange}
          isOpen={isSidebarOpen}
          onToggle={handleMenuToggle}
        />

        {/* Main Content Area */}
        <div className="flex-1 min-h-screen">
          <main className="h-full pt-20">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
