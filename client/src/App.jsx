import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./layouts/Layout";
import Home from "./pages/Home";
import CategoryPage from "./pages/CategoryPage";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
        </Route>
       

      </Routes>
    </BrowserRouter>
  );
}
