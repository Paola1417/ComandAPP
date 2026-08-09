import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import CartItem from '../CartItem/CartItem';
import MesaSelector from '../MesaSelector/MesaSelector';
import Modal from '../Modal/Modal';
import styles from './CartPanel.module.css';

const CartPanel = () => {
  const { cartItems, total, itemCount, selectedMesa, submitOrder, formatCurrency } = useCart();
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null);

  const handleConfirmar = async () => {
    if (cartItems.length === 0) {
      setModal({ tipo: 'error', titulo: 'Debe seleccionar productos antes de continuar' });
      return;
    }
    if (!selectedMesa) {
      setModal({ tipo: 'error', titulo: 'Debe seleccionar una mesa antes de continuar' });
      return;
    }

    setLoading(true);
    try {
      const observaciones = '';
      const order = await submitOrder({ observaciones });
      setModal({
        tipo: 'exito',
        titulo: '¡Pedido confirmado!',
        detalle: `Número de pedido: #PED-${String(order.id).padStart(6, '0')}`,
      });
    } catch (err) {
      setModal({
        tipo: 'error',
        titulo: 'Error al confirmar pedido',
        mensaje: err.message || 'No se pudo registrar el pedido',
      });
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setModal(null);
  };

  return (
    <aside className={styles['pedido-panel']}>
      <h3>🛒 Pedido Actual</h3>

      <MesaSelector />

      <div className={styles['pedido-lista']}>
        {cartItems.length === 0 ? (
          <div className={styles['pedido-vacio']}>
            <div className={styles['icono-carrito']}>🛒</div>
            <p>No hay productos en el pedido.</p>
          </div>
        ) : (
          cartItems.map((item) => <CartItem key={item.id} item={item} />)
        )}
      </div>

      {cartItems.length > 0 && (
        <div className={styles['pedido-total']}>
          <div className={styles['total-label']}>Total:</div>
          <div className={styles['total-valor']}>{formatCurrency(total)}</div>
          <button
            className={styles['btn-confirmar']}
            onClick={handleConfirmar}
            disabled={loading}
          >
            {loading ? 'Confirmando...' : 'Confirmar Pedido'}
          </button>
        </div>
      )}

      {modal && (
        <Modal
          id="modal"
          tipo={modal.tipo}
          titulo={modal.titulo}
          mensaje={modal.mensaje}
          detalle={modal.detalle}
          onClose={closeModal}
        />
      )}
    </aside>
  );
};

export default CartPanel;
