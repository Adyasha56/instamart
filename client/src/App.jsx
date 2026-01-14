import { BrowserRouter, Route, Routes } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import Layout from "./layouts/Layout";
import CategoryPage from "./pages/CategoryPage";
import Home from "./pages/Home";


export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}
