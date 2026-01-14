// @ts-nocheck
export default function ProductCard({ product }) {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm">
      <img
        src={product.img}
        alt={product.name}
        className="w-full h-40 object-cover"
      />

      <div className="p-4">
        <h3 className="font-semibold text-sm mb-1">
          {product.name}
        </h3>

        <p className="text-green-600 font-semibold mb-3">
          ₹{product.price}
        </p>

        <div className="flex gap-2">
          <button className="bg-green-500 text-white text-sm px-4 py-1.5 rounded-lg">
            View
          </button>
          <button className="border border-gray-300 text-sm px-4 py-1.5 rounded-lg">
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
