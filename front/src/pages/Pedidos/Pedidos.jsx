import React, { useState, useMemo } from 'react';
import { useApi } from '../../hooks/useApi';
import { fetchOrders, updateOrderEstado, deleteOrder } from '../../api/orderApi';
import { formatCurrency, formatDate, formatOrderId } from '../../utils/format';
import Modal from '../../components/Modal/Modal';
import styles from './Pedidos.module.css';

const ESTADOS = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en preparación', label: 'En Preparación' },
  { value: 'listo para entrega', label: 'Listo para Entrega' },
  { value: 'entregado', label: 'Entregado' },
  { value: 'cancelado', label: 'Cancelado' },
];
const ESTADO_LABELS = Object.fromEntries(ESTADOS.map((e) => [e.value, e.label]));

const EstadoBadge = ({ estado }) => {
  const label = ESTADO_LABELS[estado] || estado;
  const colors = {
    pendiente: styles.estadoPendiente,
    'en preparación': styles.estadoPreparacion,
    'listo para entrega': styles.estadoListo,
    entregado: styles.estadoExito,
    cancelado: styles.estadoError,
  };
  const colorClass = colors[estado] || '';
  return <span className={`${styles.estado} ${colorClass}`}>{label}</span>;
};

const Pedidos = () => {
  const { data: orders, loading, error, refetch } = useApi(fetchOrders);
  const [feedback, setFeedback] = useState(null);
  const [accion, setAccion] = useState(null);
  const closeFeedback = () => setFeedback(null);
  const closeAccion = () => setAccion(null);

  const ordenes = useMemo(() => {
    if (!orders) return [];
    return [...orders].reverse();
  }, [orders]);

  const setFeedbackMsg = (tipo, titulo, mensaje, detalle) => {
    setFeedback({ tipo, titulo, mensaje, detalle });
  };

  const handleUpdateEstado = async (order, nuevoEstado) => {
    if (!nuevoEstado) return;
    if (nuevoEstado === order.estado) {
      closeAccion();
      return;
    }
    setAccion(null);
    try {
      const actualizado = await updateOrderEstado(order.id, nuevoEstado);
      await refetch();
      setFeedbackMsg(
        'exito',
        'Estado actualizado',
        `Pedido ${formatOrderId(order.id)} actualizado a "${ESTADO_LABELS[nuevoEstado] || nuevoEstado}".`,
      );
    } catch (err) {
      setFeedbackMsg(
        'error',
        'Error al actualizar',
        err.response?.data?.message || 'No se pudo actualizar el estado del pedido.',
      );
    }
  };

  const handleDelete = async (order) => {
    if (
      !window.confirm(
        `¿Estás seguro de eliminar el pedido ${formatOrderId(order.id)}? Esta acción no se puede deshacer.`,
      )
    ) {
      return;
    }
    try {
      await deleteOrder(order.id);
      await refetch();
      setFeedbackMsg(
        'exito',
        'Pedido eliminado',
        `El pedido ${formatOrderId(order.id)} fue eliminado.`,
      );
    } catch (err) {
      setFeedbackMsg(
        'error',
        'Error al eliminar',
        err.response?.data?.message || 'No se pudo eliminar el pedido.',
      );
    }
  };

  if (loading) {
    return (
      <div className={styles['loading-state']}>
        Cargando pedidos...
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles['error-state']}>
        Error al cargar los pedidos: {error.message}
      </div>
    );
  }

  return (
    <div className={styles['pedidos-container']}>
      <div className={styles['pedidos-header']}>
        <h2>📦 Historial de Pedidos</h2>
        <p>Registro de todos los pedidos confirmados</p>
      </div>

      <div className={styles['lista-pedidos']}>
        {ordenes.length ? (
          ordenes.map((order) => (
            <div key={order.id} className={styles['pedido-card']}>
              <div className={styles['pedido-header']}>
                <h4>{formatOrderId(order.id)}</h4>
                <EstadoBadge estado={order.estado} />
              </div>

              <div className={styles['pedido-acciones']}>
                <select
                  className={styles['select-estado']}
                  value={accion?.order.id === order.id ? accion.estado : order.estado}
                  onChange={(e) =>
                    setAccion({ order, estado: e.target.value })
                  }
                  aria-label="Cambiar estado del pedido"
                >
                  {ESTADOS.map((e) => (
                    <option key={e.value} value={e.value}>
                      {e.label}
                    </option>
                  ))}
                </select>
                <button
                  className={styles['btn-guardar']}
                  disabled={accion?.order.id !== order.id || !accion}
                  onClick={() =>
                    accion && accion.order.id === order.id
                      ? handleUpdateEstado(order, accion.estado)
                      : null
                  }
                >
                  💾 Guardar
                </button>
                <button
                  className={styles['btn-eliminar']}
                  title="Eliminar pedido"
                  onClick={() => handleDelete(order)}
                >
                  🗑️
                </button>
              </div>

              {order.mesa && (
                <div className={styles['pedido-mesa']}>
                  Mesa {order.mesa.numeroMesa} — Mesero: {order.mesa.mesero}
                </div>
              )}

              <div className={styles['pedido-items']}>
                {order.items?.map((item) => (
                  <div key={item.id} className={styles['pedido-item']}>
                    <span className={styles['item-nombre']}>
                      {item.productName} x{item.cantidad}
                    </span>
                    <span className={styles['item-detalle']}>
                      {formatCurrency(Number(item.precio) * item.cantidad)}
                    </span>
                  </div>
                ))}
              </div>

              {order.observaciones && (
                <div className={styles['pedido-observaciones']}>
                  {order.observaciones}
                </div>
              )}

              <div className={styles['pedido-total']}>
                Total: {formatCurrency(order.total)}
              </div>

              <div className={styles['pedido-fecha']}>
                {formatDate(order.createdAt)}
              </div>
            </div>
          ))
        ) : (
          <div className={styles['pedidos-vacio']}>
            <div className={styles['icono-grande']}>📭</div>
            <h3>No hay pedidos registrados</h3>
            <p>Los pedidos confirmados aparecerán aquí</p>
          </div>
        )}
      </div>

      {feedback && (
        <Modal
          id="feedback-modal"
          tipo={feedback.tipo}
          titulo={feedback.titulo}
          mensaje={feedback.mensaje}
          detalle={feedback.detalle}
          onClose={closeFeedback}
        />
      )}
    </div>
  );
};

export default Pedidos;
