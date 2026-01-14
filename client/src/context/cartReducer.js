/**
 * Cart Reducer - Handles all cart state mutations
 * Follows immutability principles and returns new state objects
 */

// Action Types - Centralized for consistency and maintainability
export const CART_ACTIONS = {
  ADD_TO_CART: 'ADD_TO_CART',
  REMOVE_FROM_CART: 'REMOVE_FROM_CART',
  INCREMENT_QUANTITY: 'INCREMENT_QUANTITY',
  DECREMENT_QUANTITY: 'DECREMENT_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  LOAD_CART: 'LOAD_CART',
};

/**
 * Cart Reducer Function
 * @param {Array} state - Current cart items array
 * @param {Object} action - Action object with type and payload
 * @returns {Array} - New cart state
 */
export function cartReducer(state, action) {
  switch (action.type) {
    case CART_ACTIONS.ADD_TO_CART: {
      const { id, name, price, img } = action.payload;
      
      // Check if item already exists in cart
      const existingItemIndex = state.findIndex(item => item.id === id);
      
      if (existingItemIndex > -1) {
        // Item exists - increment quantity
        const newState = [...state];
        newState[existingItemIndex] = {
          ...newState[existingItemIndex],
          quantity: newState[existingItemIndex].quantity + 1,
        };
        return newState;
      }
      
      // Item doesn't exist - add new item with quantity 1
      return [
        ...state,
        {
          id,
          name,
          price,
          image: img, // Normalize field name
          quantity: 1,
        },
      ];
    }

    case CART_ACTIONS.REMOVE_FROM_CART: {
      // Remove item completely from cart
      return state.filter(item => item.id !== action.payload.id);
    }

    case CART_ACTIONS.INCREMENT_QUANTITY: {
      return state.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    }

    case CART_ACTIONS.DECREMENT_QUANTITY: {
      return state.map(item => {
        if (item.id === action.payload.id) {
          const newQuantity = item.quantity - 1;
          
          // If quantity becomes 0, we could either:
          // 1. Remove the item (current implementation)
          // 2. Keep it at 0 (uncomment alternative below)
          
          if (newQuantity <= 0) {
            return null; // Will be filtered out below
          }
          
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(Boolean); // Remove null items (items with quantity 0)
      
      // Alternative: Keep minimum quantity at 1
      // return state.map(item =>
      //   item.id === action.payload.id
      //     ? { ...item, quantity: Math.max(1, item.quantity - 1) }
      //     : item
      // );
    }

    case CART_ACTIONS.CLEAR_CART: {
      // Empty the cart
      return [];
    }

    case CART_ACTIONS.LOAD_CART: {
      // Load cart from localStorage (used on initial mount)
      return action.payload || [];
    }

    default:
      return state;
  }
}
