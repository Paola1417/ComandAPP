import React from 'react';
import { useApi } from '../../hooks/useApi';
import { fetchOrders } from '../../api/orderApi';
import { formatCurrency, formatDate, formatOrderId } from '../../utils/format';
import styles from './Pedidos.module.css';

const EstadoBadge = ({ estado }) => {
  const labels = {
    pendiente: 'Pendiente',
    'en preparación': 'En Preparación',
    'listo para entrega': 'Listo para Entrega',
    entregado: 'Entregado',
    cancelado: 'Cancelado',
  };
  const colors = {
    pendiente: styles.estadoPendiente,
    'en preparación': styles.estadoPreparacion,
    'listo para entrega': styles.estadoListo,
    entregado: styles.estadoExito,
    cancelado: styles.estadoError,
  };
  const label = labels[estado] || estado;
  const colorClass = colors[estado] || '';
  return <span className={`${styles.estado} ${colorClass}`}>{label}</span>;
};

const Pedidos = () => {
  const { data: orders, loading, error } = useApi(fetchOrders);

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
        {orders?.length ? (
          [...orders]
            .reverse()
            .map((order) => (
              <div key={order.id} className={styles['pedido-card']}>
                <div className={styles['pedido-header']}>
                  <h4>{formatOrderId(order.id)}</h4>
                  <EstadoBadge estado={order.estado} />
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
    </div>
  );
};

export default Pedidos;
