import React from 'react';
import { useCart } from '../../context/CartContext';
import styles from './ProductCard.module.css';

const ProductCard = ({ product, editable = false, onEdit, onDelete }) => {
  const { addItem } = useCart();

  const handleAdd = () => {
    addItem(product);
  };

  return (
    <div className={styles['card-producto']}>
      {editable && (
        <div className={styles['acciones']}>
          <button
            type="button"
            className={styles['btn-accion']}
            onClick={onEdit}
            title="Editar producto"
          >
            ✏️
          </button>
          <button
            type="button"
            className={styles['btn-accion']}
            onClick={onDelete}
            title="Eliminar producto"
          >
            🗑️
          </button>
        </div>
      )}
      {product.imagen ? (
        <img src={product.imagen} alt={product.nombre} loading="lazy" />
      ) : (
        <div className={styles['img-placeholder']}>🍽️</div>
      )}
      <div className={styles['card-producto-info']}>
        <h4>{product.nombre}</h4>
        <p>{product.caracteristicas || product.tipo || ''}</p>
        <div className={styles.precio}>
          ${Number(product.precio).toLocaleString('es-CO')}
        </div>
        <button className={styles['btn-agregar']} onClick={handleAdd}>
          Agregar
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
