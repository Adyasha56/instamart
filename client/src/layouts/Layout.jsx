import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Categories from "../components/Categories";
import Footer from "../components/Footer";

export default function Layout() {
  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* HEADER */}
      <Navbar />

      {/* CATEGORY BAR */}
      <Categories />

      {/* MAIN CONTENT */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* FOOTER */}
      <Footer />

    </div>
  );
}
