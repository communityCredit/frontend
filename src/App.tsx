import { HashRouter, Route, Routes } from "react-router-dom";
import BorrowerDashboard from "./pages/borrow/Dashboard";
import PaymentsPage from "./pages/borrow/PaymentsPage";
import StakeCollateral from "./pages/borrow/StakeCollateral";
import LandingPage from "./pages/LandingPage";
import Lend from "./pages/Lend/Deposit";
import LendLayout from "./pages/Lend/LendLayout";
import Portfolio from "./pages/Lend/Portfolio";
import WelcomeScreen from "./pages/Welcome";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<LendLayout />}>
          <Route path="/lend/deposit" element={<Lend />} />
          <Route path="/lend/portfolio" element={<Portfolio />} />
        </Route>
        <Route path="/borrow" element={<PaymentsPage />} />

        <Route path="/borrow/dashboard" element={<BorrowerDashboard />} />
        <Route path="/borrow/stake" element={<StakeCollateral />} />
        <Route path="/welcome" element={<WelcomeScreen />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
