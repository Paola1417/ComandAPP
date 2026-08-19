import React, { useMemo } from 'react';
import { useApi } from '../../hooks/useApi';
import { fetchOrders } from '../../api/orderApi';
import { formatCurrency } from '../../utils/format';
import styles from './Reportes.module.css';

const Reportes = () => {
  const { data: orders, loading, error } = useApi(fetchOrders);

  const stats = useMemo(() => {
    if (!orders || orders.length === 0) {
      return {
        totalVentas: 0,
        totalPedidos: 0,
        totalProductos: 0,
        productosVendidos: {},
      };
    }

    const totalPedidos = orders.length;
    const totalVentas = orders.reduce(
      (sum, order) => sum + Number(order.total || 0),
      0
    );

    const productosVendidos = {};
    let totalProductos = 0;

    orders.forEach((order) => {
      order.items?.forEach((item) => {
        const productKey = item.productId || item.productName;
        if (!productosVendidos[productKey]) {
          productosVendidos[productKey] = {
            nombre: item.productName || `Producto #${productKey}`,
            precio: Number(item.precio || 0),
            cantidad: 0,
          };
        }
        productosVendidos[productKey].cantidad += item.cantidad || 0;
        totalProductos += item.cantidad || 0;
      });
    });

    return {
      totalVentas,
      totalPedidos,
      totalProductos,
      productosVendidos,
    };
  }, [orders]);

  const topProductos = useMemo(() => {
    return Object.entries(stats.productosVendidos)
      .sort((a, b) => b[1].cantidad - a[1].cantidad)
      .slice(0, 5);
  }, [stats.productosVendidos]);

  if (loading) {
    return (
      <div className={styles['loading-state']}>
        Cargando reportes...
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles['error-state']}>
        Error al cargar los reportes: {error.message}
      </div>
    );
  }

  const promedio =
    stats.totalPedidos > 0
      ? Math.round(stats.totalVentas / stats.totalPedidos)
      : 0;

  return (
    <div className={styles['reportes-container']}>
      <div className={styles['reportes-header']}>
        <h2>📊 Reportes y Estadísticas</h2>
        <p>Resumen de ventas y productos más vendidos</p>
      </div>

      <div className={styles['reportes-grid']}>
        <div className={styles['reporte-card']}>
          <div className={styles['reporte-icono']}>💰</div>
          <h3>Ventas Totales</h3>
          <p className={styles['reporte-valor']}>
            {formatCurrency(stats.totalVentas)}
          </p>
          <span className={styles['reporte-sub']}>Ingresos acumulados</span>
        </div>

        <div className={styles['reporte-card']}>
          <div className={styles['reporte-icono']}>📦</div>
          <h3>Pedidos Realizados</h3>
          <p className={styles['reporte-valor']}>{stats.totalPedidos}</p>
          <span className={styles['reporte-sub']}>Total de pedidos</span>
        </div>

        <div className={styles['reporte-card']}>
          <div className={styles['reporte-icono']}>🍔</div>
          <h3>Productos Vendidos</h3>
          <p className={styles['reporte-valor']}>{stats.totalProductos}</p>
          <span className={styles['reporte-sub']}>Unidades totales</span>
        </div>

        <div className={styles['reporte-card']}>
          <div className={styles['reporte-icono']}>📈</div>
          <h3>Promedio por Pedido</h3>
          <p className={styles['reporte-valor']}>{formatCurrency(promedio)}</p>
          <span className={styles['reporte-sub']}>Valor promedio</span>
        </div>
      </div>

      <div className={styles['reporte-detalle']}>
        <h3>Productos más vendidos</h3>
        {topProductos.length === 0 ? (
          <p className={styles['empty-stats']}>
            Aún no hay datos de ventas
          </p>
        ) : (
          topProductos.map(([key, info], index) => {
            const maxCant = topProductos[0][1].cantidad;
            const porcentaje =
              maxCant > 0 ? (info.cantidad / maxCant) * 100 : 0;
            return (
              <div key={key} className={styles['top-producto']}>
                <div className={styles['top-rank']}>{index + 1}</div>
                <div className={styles['top-info']}>
                  <h5>{info.nombre}</h5>
                  <p>{info.cantidad} unidades vendidas</p>
                  <div className={styles['top-barra']}>
                    <div
                      className={styles['top-barra-fill']}
                      style={{ width: `${porcentaje}%` }}
                    />
                  </div>
                </div>
                <div className={styles['top-ventas']}>
                  {formatCurrency(info.cantidad * info.precio)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Reportes;
