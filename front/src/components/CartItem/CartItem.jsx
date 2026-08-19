import React from 'react';
import { useCart } from '../../context/CartContext';
import styles from './CartItem.module.css';

const CartItem = ({ item }) => {
  const { updateQuantity, removeItem, formatCurrency } = useCart();

  const subtotal = item.precio * item.cantidad;

  return (
    <div className={styles['pedido-item']}>
      {item.imagen ? (
        <img src={item.imagen} alt={item.nombre} />
      ) : (
        <div className={styles['img-placeholder']}>🍽️</div>
      )}
      <div className={styles['pedido-item-info']}>
        <h5>{item.nombre}</h5>
        <div className={styles['precio-item']}>{formatCurrency(item.precio)}</div>
      </div>
      <div className={styles['pedido-item-controles']}>
        <button
          className={styles['btn-cantidad']}
          onClick={() => updateQuantity(item.id, -1)}
        >
          −
        </button>
        <span className={styles['cantidad-num']}>{item.cantidad}</span>
        <button
          className={styles['btn-cantidad']}
          onClick={() => updateQuantity(item.id, 1)}
        >
          +
        </button>
      </div>
      <div className={styles['pedido-item-subtotal']}>
        {formatCurrency(subtotal)}
      </div>
      <button
        className={styles['btn-eliminar']}
        onClick={() => removeItem(item.id)}
      >
        🗑
      </button>
    </div>
  );
};

export default CartItem;
