import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { createOrder as createOrderAPI } from '../api/orderApi';
import { formatCurrency } from '../utils/format';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart debe usarse dentro de CartProvider');
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [selectedMesa, setSelectedMesa] = useState(null);

  const addItem = useCallback((product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          nombre: product.nombre,
          precio: Number(product.precio),
          cantidad: 1,
          imagen: product.imagen || null,
          descripcion: product.caracteristicas || '',
          tipo: product.tipo || '',
        },
      ];
    });
  }, []);

  const removeItem = useCallback((id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id, delta) => {
    setCartItems((prev) => {
      const updated = prev
        .map((item) =>
          item.id === id
            ? { ...item, cantidad: item.cantidad + delta }
            : item
        )
        .filter((item) => item.cantidad > 0);
      return updated;
    });
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const setMesa = useCallback((mesa) => {
    setSelectedMesa(mesa);
  }, []);

  const total = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + item.precio * item.cantidad,
      0
    );
  }, [cartItems]);

  const itemCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.cantidad, 0);
  }, [cartItems]);

  const submitOrder = useCallback(
    async ({ observaciones }) => {
      if (cartItems.length === 0) {
        throw new Error('Debe seleccionar productos antes de continuar');
      }
      if (!selectedMesa) {
        throw new Error('Debe seleccionar una mesa antes de continuar');
      }

      const items = cartItems.map((item) => ({
        productId: item.id,
        cantidad: item.cantidad,
      }));

      const orderData = {
        tableRestaurantId: selectedMesa.id,
        items,
        observaciones: observaciones || '',
      };

      const order = await createOrderAPI(orderData);

      setCartItems([]);
      setSelectedMesa(null);

      return order;
    },
    [cartItems, selectedMesa]
  );

  const value = {
    cartItems,
    selectedMesa,
    total,
    itemCount,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    setMesa,
    submitOrder,
    formatCurrency,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
