// @ts-nocheck
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";
import { CART_ACTIONS, cartReducer } from "./cartReducer";

// Create Context
const CartContext = createContext();

// LocalStorage key constant
const CART_STORAGE_KEY = "instamart_cart";

/**
 * Safely load cart from localStorage
 * Handles JSON parsing errors and null checks
 */
const loadCartFromStorage = () => {
  try {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (storedCart) {
      const parsed = JSON.parse(storedCart);
      // Validate that parsed data is an array
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (error) {
    console.error("Failed to load cart from localStorage:", error);
  }
  return [];
};

/**
 * Safely save cart to localStorage
 */
const saveCartToStorage = (cart) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error("Failed to save cart to localStorage:", error);
  }
};

/**
 * CartProvider Component
 * Provides cart state and actions to all child components
 */
export function CartProvider({ children }) {
  // Initialize cart state with useReducer
  const [cartItems, dispatch] = useReducer(cartReducer, [], () => {
    // Lazy initialization - load from localStorage on mount
    return loadCartFromStorage();
  });

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    saveCartToStorage(cartItems);
  }, [cartItems]);

  // Memoized cart actions - prevent unnecessary re-renders
  const addToCart = useCallback((product) => {
    dispatch({
      type: CART_ACTIONS.ADD_TO_CART,
      payload: product,
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    dispatch({
      type: CART_ACTIONS.REMOVE_FROM_CART,
      payload: { id: productId },
    });
  }, []);

  const incrementQuantity = useCallback((productId) => {
    dispatch({
      type: CART_ACTIONS.INCREMENT_QUANTITY,
      payload: { id: productId },
    });
  }, []);

  const decrementQuantity = useCallback((productId) => {
    dispatch({
      type: CART_ACTIONS.DECREMENT_QUANTITY,
      payload: { id: productId },
    });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({
      type: CART_ACTIONS.CLEAR_CART,
    });
  }, []);

  // Memoized computed values - avoid recalculation on every render
  const cartCount = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  const cartTotal = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cartItems]);

  // Check if a product is in the cart
  const isInCart = useCallback((productId) => {
    return cartItems.some(item => item.id === productId);
  }, [cartItems]);

  // Get quantity of a specific product
  const getItemQuantity = useCallback((productId) => {
    const item = cartItems.find(item => item.id === productId);
    return item ? item.quantity : 0;
  }, [cartItems]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    cartItems,
    cartCount,
    cartTotal,
    addToCart,
    removeFromCart,
    incrementQuantity,
    decrementQuantity,
    clearCart,
    isInCart,
    getItemQuantity,
  }), [
    cartItems,
    cartCount,
    cartTotal,
    addToCart,
    removeFromCart,
    incrementQuantity,
    decrementQuantity,
    clearCart,
    isInCart,
    getItemQuantity,
  ]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

/**
 * Custom hook to use cart context
 * Throws error if used outside CartProvider
 */
export const useCart = () => {
  const context = useContext(CartContext);
  
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  
  return context;
};
