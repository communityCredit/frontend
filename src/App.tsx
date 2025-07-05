import { BrowserRouter, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Lend from "./pages/Lend/Deposit";
import LendLayout from "./pages/Lend/LendLayout";
import Portfolio from "./pages/Lend/Portfolio";
import BorrowerDashboard from "./pages/borrow/Dashboard";
import PaymentsPage from "./pages/borrow/PaymentsPage";
import StakeCollateral from "./pages/borrow/StakeCollateral";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<LendLayout />}>
          <Route path="/lend/deposit" element={<Lend />} />
          <Route path="/lend/portfolio" element={<Portfolio />} />
        </Route>
        <Route path="/borrow" element={<PaymentsPage />} />
        <Route path="/borrow/dashboard" element={<BorrowerDashboard />} />
        <Route path="/borrow/stake" element={<StakeCollateral />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
