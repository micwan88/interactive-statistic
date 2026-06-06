import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import BinomialNormal from "./pages/BinomialNormal";
import CLT from "./pages/CLT";
import RSquared from "./pages/RSquared";

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
