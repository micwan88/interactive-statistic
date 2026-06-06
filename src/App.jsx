import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import BinomialNormal from "./pages/BinomialNormal.jsx";
import CLT from "./pages/CLT.jsx";
import RSquared from "./pages/RSquared.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/binomial-normal" element={<BinomialNormal />} />
      <Route path="/clt" element={<CLT />} />
      <Route path="/r-squared" element={<RSquared />} />
    </Routes>
  );
}
