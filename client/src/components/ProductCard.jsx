// @ts-nocheck
import { useState } from "react";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product }) {
  const { addToCart, isInCart, getItemQuantity, incrementQuantity, decrementQuantity } = useCart();
  const [showFeedback, setShowFeedback] = useState(false);

  const inCart = isInCart(product.id);
  const quantity = getItemQuantity(product.id);

  // Handle add to cart with visual feedback
  const handleAddToCart = () => {
    addToCart(product);
    
    // Show feedback animation
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 1000);
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow relative">
      {/* Added to Cart Feedback */}
      {showFeedback && (
        <div className="absolute inset-0 bg-green-500 bg-opacity-90 flex items-center justify-center z-10 animate-pulse">
          <div className="text-white text-center">
            <svg
              className="w-12 h-12 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <p className="font-semibold">Added to Cart!</p>
          </div>
        </div>
      )}

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
          <button className="bg-green-500 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-green-600 transition-colors">
            View
          </button>
          
          {/* Show quantity controls if item is in cart, otherwise show Add button */}
          {inCart ? (
            <div className="flex items-center border border-green-500 rounded-lg overflow-hidden">
              <button
                onClick={() => decrementQuantity(product.id)}
                className="px-3 py-1 hover:bg-gray-100 transition-colors text-sm"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="px-3 py-1 bg-green-50 text-green-700 font-semibold text-sm min-w-9 text-center">
                {quantity}
              </span>
              <button
                onClick={() => incrementQuantity(product.id)}
                className="px-3 py-1 hover:bg-gray-100 transition-colors text-sm"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              className="border border-green-500 text-green-600 text-sm px-4 py-1.5 rounded-lg hover:bg-green-50 transition-colors font-medium"
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
