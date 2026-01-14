// @ts-nocheck
import { products } from "../data/product"
import ProductCard from "./ProductCard";

export default function FeaturedProducts({ selectedCategory }) {
  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter(
          (p) => p.category === selectedCategory
        );

  return (
    <div className="mt-8 mx-10 mb-7">
      <h2 className="text-lg font-semibold mb-4">
        Featured Products
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {filteredProducts.map((item) => (
          <ProductCard
            key={item.id}   
            product={item}
          />
        ))}
      </div>
    </div>
  );
}
