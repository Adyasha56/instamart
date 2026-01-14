/**
 * CART USAGE EXAMPLES
 * Common patterns and recipes for using the cart system
 */

import { useCart } from './context/CartContext';

// ============================================
// EXAMPLE 1: Simple Add to Cart Button
// ============================================
function SimpleAddButton({ product }) {
  const { addToCart } = useCart();
  
  return (
    <button onClick={() => addToCart(product)}>
      Add to Cart
    </button>
  );
}

// ============================================
// EXAMPLE 2: Smart Button (Add or Show Quantity)
// ============================================
function SmartCartButton({ product }) {
  const { isInCart, getItemQuantity, addToCart, incrementQuantity, decrementQuantity } = useCart();
  
  if (isInCart(product.id)) {
    const quantity = getItemQuantity(product.id);
    return (
      <div className="quantity-controls">
        <button onClick={() => decrementQuantity(product.id)}>−</button>
        <span>{quantity}</span>
        <button onClick={() => incrementQuantity(product.id)}>+</button>
      </div>
    );
  }
  
  return (
    <button onClick={() => addToCart(product)}>
      Add to Cart
    </button>
  );
}

// ============================================
// EXAMPLE 3: Cart Badge in Header
// ============================================
function CartBadge() {
  const { cartCount } = useCart();
  
  return (
    <button className="cart-button">
      🛒 Cart
      {cartCount > 0 && (
        <span className="badge">{cartCount}</span>
      )}
    </button>
  );
}

// ============================================
// EXAMPLE 4: Cart Total Display
// ============================================
function CartSummary() {
  const { cartTotal, cartCount } = useCart();
  
  return (
    <div className="cart-summary">
      <p>Total Items: {cartCount}</p>
      <p>Total Price: ₹{cartTotal.toFixed(2)}</p>
    </div>
  );
}

// ============================================
// EXAMPLE 5: Mini Cart Preview
// ============================================
function MiniCart() {
  const { cartItems, cartTotal, removeFromCart } = useCart();
  
  return (
    <div className="mini-cart">
      <h3>Your Cart</h3>
      {cartItems.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <>
          {cartItems.slice(0, 3).map(item => (
            <div key={item.id} className="cart-item">
              <img src={item.image} alt={item.name} />
              <div>
                <p>{item.name}</p>
                <p>₹{item.price} × {item.quantity}</p>
              </div>
              <button onClick={() => removeFromCart(item.id)}>×</button>
            </div>
          ))}
          
          {cartItems.length > 3 && (
            <p>+ {cartItems.length - 3} more items</p>
          )}
          
          <div className="total">
            <strong>Total: ₹{cartTotal.toFixed(2)}</strong>
          </div>
          
          <button>Checkout</button>
        </>
      )}
    </div>
  );
}

// ============================================
// EXAMPLE 6: Product with Stock Check
// ============================================
function ProductWithStock({ product }) {
  const { addToCart, getItemQuantity } = useCart();
  const currentQuantity = getItemQuantity(product.id);
  const maxStock = product.stock || 10;
  const outOfStock = currentQuantity >= maxStock;
  
  return (
    <button 
      onClick={() => addToCart(product)}
      disabled={outOfStock}
    >
      {outOfStock ? 'Out of Stock' : 'Add to Cart'}
    </button>
  );
}

// ============================================
// EXAMPLE 7: Clear Cart with Confirmation
// ============================================
function ClearCartButton() {
  const { clearCart, cartCount } = useCart();
  
  const handleClearCart = () => {
    if (window.confirm(`Remove all ${cartCount} items from cart?`)) {
      clearCart();
    }
  };
  
  return (
    <button onClick={handleClearCart} disabled={cartCount === 0}>
      Clear Cart
    </button>
  );
}

// ============================================
// EXAMPLE 8: Checkout Page
// ============================================
function CheckoutPage() {
  const { cartItems, cartTotal, cartCount } = useCart();
  
  if (cartCount === 0) {
    return <div>Your cart is empty. Start shopping!</div>;
  }
  
  return (
    <div className="checkout">
      <h1>Checkout</h1>
      
      <div className="order-summary">
        <h2>Order Summary ({cartCount} items)</h2>
        {cartItems.map(item => (
          <div key={item.id} className="checkout-item">
            <span>{item.name} × {item.quantity}</span>
            <span>₹{(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        
        <div className="checkout-total">
          <span>Subtotal:</span>
          <span>₹{cartTotal.toFixed(2)}</span>
        </div>
        <div className="checkout-total">
          <span>Delivery:</span>
          <span className="free">FREE</span>
        </div>
        <div className="checkout-total final">
          <strong>Total:</strong>
          <strong>₹{cartTotal.toFixed(2)}</strong>
        </div>
        
        <button className="place-order-btn">
          Place Order
        </button>
      </div>
    </div>
  );
}

// ============================================
// EXAMPLE 9: Custom Hook for Cart Operations
// ============================================
function useProductCart(productId) {
  const { 
    isInCart, 
    getItemQuantity, 
    addToCart, 
    incrementQuantity, 
    decrementQuantity,
    removeFromCart 
  } = useCart();
  
  const inCart = isInCart(productId);
  const quantity = getItemQuantity(productId);
  
  return {
    inCart,
    quantity,
    addToCart,
    increment: () => incrementQuantity(productId),
    decrement: () => decrementQuantity(productId),
    remove: () => removeFromCart(productId),
  };
}

// Usage:
function ProductCard({ product }) {
  const { inCart, quantity, addToCart, increment, decrement } = useProductCart(product.id);
  
  return (
    <div>
      {inCart ? (
        <div>
          <button onClick={decrement}>−</button>
          <span>{quantity}</span>
          <button onClick={increment}>+</button>
        </div>
      ) : (
        <button onClick={() => addToCart(product)}>Add</button>
      )}
    </div>
  );
}

// ============================================
// EXAMPLE 10: Cart Analytics Wrapper
// ============================================
function ProductWithAnalytics({ product }) {
  const { addToCart } = useCart();
  
  const handleAddToCart = () => {
    // Add to cart
    addToCart(product);
    
    // Track analytics (Google Analytics, Mixpanel, etc.)
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'add_to_cart', {
        currency: 'INR',
        value: product.price,
        items: [{
          item_id: product.id,
          item_name: product.name,
          price: product.price,
          quantity: 1,
        }]
      });
    }
    
    // Show toast notification
    // toast.success('Added to cart!');
  };
  
  return (
    <button onClick={handleAddToCart}>
      Add to Cart
    </button>
  );
}

// ============================================
// EXAMPLE 11: Bulk Add to Cart
// ============================================
function AddMultipleProducts({ products }) {
  const { addToCart } = useCart();
  
  const addAllToCart = () => {
    products.forEach(product => {
      addToCart(product);
    });
  };
  
  return (
    <button onClick={addAllToCart}>
      Add All {products.length} Items to Cart
    </button>
  );
}

// ============================================
// EXAMPLE 12: Cart with Loading State
// ============================================
function ProductCardWithLoading({ product }) {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  
  const handleAddToCart = async () => {
    setIsAdding(true);
    
    // Simulate API call (e.g., checking stock)
    await new Promise(resolve => setTimeout(resolve, 500));
    
    addToCart(product);
    setIsAdding(false);
  };
  
  return (
    <button onClick={handleAddToCart} disabled={isAdding}>
      {isAdding ? 'Adding...' : 'Add to Cart'}
    </button>
  );
}

// ============================================
// EXAMPLE 13: Protected Cart (Require Login)
// ============================================
function ProtectedAddToCart({ product, isLoggedIn }) {
  const { addToCart } = useCart();
  
  const handleClick = () => {
    if (!isLoggedIn) {
      // Redirect to login
      window.location.href = '/login?redirect=cart';
      return;
    }
    
    addToCart(product);
  };
  
  return (
    <button onClick={handleClick}>
      {isLoggedIn ? 'Add to Cart' : 'Login to Add'}
    </button>
  );
}

export {
    AddMultipleProducts, CartBadge,
    CartSummary, CheckoutPage, ClearCartButton, MiniCart, ProductCardWithLoading, ProductWithAnalytics, ProductWithStock, ProtectedAddToCart, SimpleAddButton,
    SmartCartButton, useProductCart
};

