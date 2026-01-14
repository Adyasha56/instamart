// @ts-nocheck

import { products } from "../data/product";
import ProductCard from "./ProductCard";

export default function Products() {
  return (
    <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
      {products.map((item) => (
        <ProductCard key={item.id} product={item} />
      ))}
    </div>
  );
}
