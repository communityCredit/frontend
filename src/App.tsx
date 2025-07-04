import { BrowserRouter, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Lend from "./pages/Lend/Deposit";
import LendLayout from "./pages/Lend/LendLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<LendLayout />}>
          <Route path="/lend/deposit" element={<Lend />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
