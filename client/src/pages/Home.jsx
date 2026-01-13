import Navbar from "../components/Navbar";
import Products from "../components/Products";

export default function Home() {
  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <Products />
    </div>
  );
}
