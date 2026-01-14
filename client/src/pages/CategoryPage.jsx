// @ts-nocheck
import { useParams } from "react-router-dom";
import CategoryHero from "../components/category/CategoryHero";
import SubCategoryBar from "../components/category/SubCategoryBar";
import CategoryPromos from "../components/category/CategoryPromos";
import CategoryProducts from "../components/category/CategoryProducts";

import { categories } from "../data/categories";
import { subCategories } from "../data/subCategories";
import { products } from "../data/product"

export default function CategoryPage() {
  const { slug } = useParams();

  const category = categories.find((c) => c.slug === slug);

  // Category not found safety
  if (!category) {
    return (
      <div className="pt-24 text-center text-xl text-gray-700">
        Category not found
      </div>
    );
  }

  // Products filtered by category
  const filteredProducts = products.filter(
    (p) => p.category === slug
  );

  return (
    <div className="bg-white pt-4">

      {/* Hero Banner */}
      <CategoryHero
        title={category.name}
        banner={category.banner}
      />

      {/* Sub Category Nav */}
      <SubCategoryBar
        items={subCategories[slug] || []}
      />

      {/* Sort & Filter */}
      <div className="sticky top-[72px] z-20 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          <div className="text-sm font-semibold text-gray-800">
            {filteredProducts.length} results
          </div>
          <div className="flex gap-4">
            <select className="text-sm p-2 border bg-white rounded">
              <option>Sort by</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Popularity</option>
            </select>
            {/* Filter button (for mobile) */}
            <button className="text-sm px-4 py-2 bg-gray-100 rounded">
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Promo Banners */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <CategoryPromos promos={category.promos || []} />
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <CategoryProducts products={filteredProducts} />
      </div>
    </div>
  );
}
