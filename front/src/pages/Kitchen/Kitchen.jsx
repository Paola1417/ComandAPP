import React, { useState, useMemo } from 'react';
import { useApi } from '../../hooks/useApi';
import { fetchOrders, updateOrderEstado } from '../../api/orderApi';
import { formatCurrency, formatOrderId } from '../../utils/format';
import Modal from '../../components/Modal/Modal';
import styles from './Kitchen.module.css';

const ESTADOS = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en preparación', label: 'En Preparación' },
  { value: 'listo para entrega', label: 'Listo para Entrega' },
  { value: 'entregado', label: 'Entregado' },
  { value: 'cancelado', label: 'Cancelado' },
];

const ESTADOS_LABELS = Object.fromEntries(ESTADOS.map((e) => [e.value, e.label]));

const EstadoBadge = ({ estado }) => {
  const colors = {
    pendiente: styles.estadoPendiente,
    'en preparación': styles.estadoPreparacion,
    'listo para entrega': styles.estadoListo,
    entregado: styles.estadoExito,
    cancelado: styles.estadoError,
  };
  return <span className={`${styles.estado} ${colors[estado] || ''}`}>{ESTADOS_LABELS[estado] || estado}</span>;
};

const Kitchen = () => {
  const { data: orders, loading, error, refetch } = useApi(fetchOrders);
  const [accion, setAccion] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const pedidosActivos = useMemo(() => {
    if (!orders) return [];
    return [...orders]
      .filter((o) => o.estado !== 'entregado' && o.estado !== 'cancelado')
      .reverse();
  }, [orders]);

  const pedidosCompletados = useMemo(() => {
    if (!orders) return [];
    return [...orders]
      .filter((o) => o.estado === 'entregado' || o.estado === 'cancelado')
      .reverse()
      .slice(0, 15);
  }, [orders]);

  const closeFeedback = () => setFeedback(null);
  const closeAccion = () => setAccion(null);

  const handleUpdateEstado = async (order, nuevoEstado) => {
    if (!nuevoEstado || nuevoEstado === order.estado) return;
    try {
      await updateOrderEstado(order.id, nuevoEstado);
      await refetch();
      setFeedback({
        tipo: 'exito',
        titulo: 'Estado actualizado',
        mensaje: `Pedido ${formatOrderId(order.id)} actualizado a "${ESTADOS_LABELS[nuevoEstado] || nuevoEstado}".`,
      });
    } catch (err) {
      setFeedback({
        tipo: 'error',
        titulo: 'Error',
        mensaje: err.response?.data?.message || 'No se pudo actualizar el estado.',
      });
    }
    setAccion(null);
  };

  if (loading) {
    return <div className={styles['loading-state']}>Cargando pedidos...</div>;
  }

  if (error) {
    return <div className={styles['error-state']}>Error: {error.message}</div>;
  }

  return (
    <div className={styles['kitchen-container']}>
      <div className={styles['kitchen-header']}>
        <h2>👨‍🍳 Panel de Cocina</h2>
        <p>Pedidos pendientes y en proceso</p>
      </div>

      <div className={styles['pedidos-section']}>
        <h3>Pedidos Activos ({pedidosActivos.length})</h3>
        {pedidosActivos.length === 0 ? (
          <div className={styles['vacio']}>
            <div className={styles['icono-grande']}>📭</div>
            <p>No hay pedidos activos</p>
          </div>
        ) : (
          <div className={styles['grid-pedidos']}>
            {pedidosActivos.map((order) => (
              <div key={order.id} className={styles['pedido-card']}>
                <div className={styles['pedido-header']}>
                  <h4>{formatOrderId(order.id)}</h4>
                  <EstadoBadge estado={order.estado} />
                </div>

                {order.mesa && (
                  <div className={styles['mesa-info']}>
                    Mesa {order.mesa.numeroMesa}
                    {order.mesa.mesero ? ` — ${order.mesa.mesero}` : ''}
                  </div>
                )}

                <div className={styles['pedido-items']}>
                  {order.items?.map((item) => (
                    <div key={item.id} className={styles['pedido-item']}>
                      <span className={styles['item-nombre']}>
                        {item.productName} x{item.cantidad}
                      </span>
                      <span className={styles['item-precio']}>
                        {formatCurrency(Number(item.precio) * item.cantidad)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className={styles['pedido-total']}>
                  Total: {formatCurrency(order.total)}
                </div>

                {order.observaciones && (
                  <div className={styles['observaciones']}>
                    <strong>Observaciones:</strong> {order.observaciones}
                  </div>
                )}

                <div className={styles['control-estado']}>
                  <select
                    className={styles['select-estado']}
                    value={accion?.order.id === order.id ? accion.estado : order.estado}
                    onChange={(e) => setAccion({ order, estado: e.target.value })}
                  >
                    {ESTADOS.map((e) => (
                      <option key={e.value} value={e.value}>{e.label}</option>
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
                    Guardar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {pedidosCompletados.length > 0 && (
        <div className={styles['completados-section']}>
          <h3>Pedidos recientes</h3>
          <div className={styles['grid-pedidos']}>
            {pedidosCompletados.map((order) => (
              <div key={order.id} className={styles['pedido-card-completado']}>
                <span>{formatOrderId(order.id)}</span>
                <EstadoBadge estado={order.estado} />
                <span>{formatCurrency(order.total)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {feedback && (
        <Modal
          id="feedback-modal"
          tipo={feedback.tipo}
          titulo={feedback.titulo}
          mensaje={feedback.mensaje}
          onClose={closeFeedback}
        />
      )}
    </div>
  );
};

export default Kitchen;
