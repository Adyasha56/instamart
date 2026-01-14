// @ts-nocheck
import { useState } from "react";

import Hero from "../components/Hero";
import TrendingNow from "../components/TrendingNow";
import OfferBanner from "../components/OfferBanner";
import ProductCategories from "../components/ProductCategories";
import FeaturedProducts from "../components/FeaturedProducts";

export default function Home() {
  // ✅ THIS WAS MISSING
  const [selectedCategory, setSelectedCategory] = useState("All");

  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <TrendingNow />
      <OfferBanner />

      <ProductCategories
        selectedCategory={selectedCategory}
        onSelect={setSelectedCategory}
      />

      <FeaturedProducts
        selectedCategory={selectedCategory}
      />
    </div>
  );
}
