import { createContext, useContext, useState } from 'react';

export const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  const makeCartKey = (productId, selectedOptions = []) => {
    const opts = [...selectedOptions]
      .sort((a, b) => a.categoryId.localeCompare(b.categoryId))
      .map((o) => `${o.categoryId}:${o.valueId}`);
    return [productId, ...opts].join('::');
  };

  const addItem = (product, quantity = 1, selectedOptions = []) => {
    setItems((prev) => {
      const cartKey = makeCartKey(product.id, selectedOptions);
      const existing = prev.find((i) => i.cartKey === cartKey);
      if (existing) {
        return prev.map((i) =>
          i.cartKey === cartKey ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      const optionTotal = selectedOptions.reduce(
        (sum, o) => sum + Number(o.priceExtra || 0),
        0
      );
      return [
        ...prev,
        {
          ...product,
          id: product.id,
          cartKey,
          quantity: Math.max(1, quantity),
          selectedOptions,
          basePrice: Number(product.price || 0),
          unitPrice: Number(product.price || 0) + optionTotal,
        },
      ];
    });
  };

  const removeItem = (cartKey) => {
    setItems((prev) => prev.filter((i) => i.cartKey !== cartKey));
  };

  const updateQuantity = (cartKey, quantity) => {
    setItems((prev) =>
      prev.map((i) =>
        i.cartKey === cartKey ? { ...i, quantity: Math.max(0, quantity) } : i
      )
    );
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, total, count: items.length }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
