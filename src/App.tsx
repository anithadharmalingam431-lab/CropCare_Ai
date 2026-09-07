import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Detect from "./pages/Detect";
import Result from "./pages/Result";
import History from "./pages/History";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/detect" element={<Detect />} />
        <Route path="/result" element={<Result />} />
        <Route path="/history" element={<History />} />
      </Route>
    </Routes>
  );
}
