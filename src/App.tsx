import { BrowserRouter, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LendLayout from "./pages/Lend/LendLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<LendLayout />}>
          <Route path="/lend/deposit" element={<div>Lend</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
