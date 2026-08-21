import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  fetchMesaByToken,
  fetchProductosPublicos,
  createOrderPublica,
  updateOrderPublica,
  fetchEstadoPedido,
} from '../../api/orderApi';
import { formatCurrency, getCategoryIcon } from '../../utils/format';
import styles from './CustomerMenu.module.css';

const ESTADOS_LABELS = {
  pendiente: 'Pendiente',
  'en preparación': 'En Preparación',
  'listo para entrega': 'Listo para Entrega',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

const CustomerMenu = () => {
  const { token } = useParams();
  const [mesa, setMesa] = useState(null);
  const [categorias, setCategorias] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [pedidoConfirmado, setPedidoConfirmado] = useState(null);
  const [observaciones, setObservaciones] = useState('');
  const [estadoActual, setEstadoActual] = useState(null);
  const [pedidoActualId, setPedidoActualId] = useState(null);
  const [ultimaAccion, setUltimaAccion] = useState('crear');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const mesaData = await fetchMesaByToken(token);
        setMesa(mesaData);

        const cats = await fetchProductosPublicos(token);
        setCategorias(cats);

        if (cats && cats.length > 0 && !activeCategoryId) {
          setActiveCategoryId(cats[0].id);
        }

        try {
          const estado = await fetchEstadoPedido(token);
          setEstadoActual(estado);
          if (estado && estado.estado === 'pendiente') {
            setPedidoActualId(estado.id);
            setCartItems(
              estado.items.map((item) => ({
                id: item.productId,
                nombre: item.productName,
                precio: Number(item.precio),
                cantidad: item.cantidad,
                imagen: null,
                tipo: '',
              }))
            );
            setObservaciones(estado.observaciones || '');
          } else {
            setPedidoActualId(null);
            setCartItems([]);
          }
        } catch {
          setEstadoActual(null);
          setPedidoActualId(null);
          setCartItems([]);
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, [token, activeCategoryId]);

  const activeCategory = useMemo(() => {
    if (!categorias) return null;
    return categorias.find((cat) => cat.id === activeCategoryId) || null;
  }, [categorias, activeCategoryId]);

  const addItem = (product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, cantidad: item.cantidad + 1 } : item
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
          tipo: product.tipo || '',
        },
      ];
    });
  };

  const updateQuantity = (id, delta) => {
    setCartItems((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, cantidad: item.cantidad + delta } : item))
        .filter((item) => item.cantidad > 0)
    );
  };

  const removeItem = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const total = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  }, [cartItems]);

  const confirmarPedido = async () => {
    if (cartItems.length === 0) return;
    setSubmitting(true);
    try {
      const items = cartItems.map((item) => ({
        productId: item.id,
        cantidad: item.cantidad,
      }));
      const payload = {
        items,
        observaciones: observaciones || '',
      };

      let order;
      if (pedidoActualId) {
        order = await updateOrderPublica(token, pedidoActualId, payload);
        setUltimaAccion('actualizar');
      } else {
        order = await createOrderPublica(token, payload);
        setUltimaAccion('crear');
      }

      setPedidoConfirmado(order);
      setEstadoActual(order);
      setPedidoActualId(null);
      setCartItems([]);
      setObservaciones('');
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'No se pudo registrar el pedido');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className={styles['loading-state']}>Cargando menú de la mesa...</div>;
  }

  if (error) {
    return <div className={styles['error-state']}>{error}</div>;
  }

  if (pedidoConfirmado) {
    const estado = ESTADOS_LABELS[pedidoConfirmado.estado] || pedidoConfirmado.estado;
    return (
      <div className={styles['confirmacion-container']}>
        <div className={styles['confirmacion-card']}>
          <div className={styles['confirmacion-icon']}>✅</div>
          <h2>{ultimaAccion === 'actualizar' ? '¡Pedido Actualizado!' : '¡Pedido Confirmado!'}</h2>
          <p className={styles['pedido-num']}>Pedido #{pedidoConfirmado.id}</p>
          <p className={styles['pedido-estado']}>Estado: {estado}</p>
          <p className={styles['pedido-total']}>Total: {formatCurrency(pedidoConfirmado.total)}</p>
          <button
            className={styles['btn-volver']}
            onClick={() => {
              setPedidoConfirmado(null);
              setCartItems([]);
              setObservaciones('');
            }}
          >
            {ultimaAccion === 'actualizar' ? 'Volver al menú' : 'Realizar otro pedido'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles['customer-container']}>
      <header className={styles['customer-header']}>
        <h2>🍽️ Menú - Mesa {mesa?.numeroMesa}</h2>
        {mesa?.mesero && <p className={styles['mesero-info']}>Mesero: {mesa.mesero}</p>}
      </header>

      {estadoActual && (
        <div className={styles['estado-pedido']}>
          <h3>Tu pedido actual</h3>
          <p><strong>Pedido:</strong> #{estadoActual.id}</p>
          <p><strong>Estado:</strong> {ESTADOS_LABELS[estadoActual.estado] || estadoActual.estado}</p>
          {estadoActual.items?.length > 0 && (
            <ul className={styles['estado-items']}>
              {estadoActual.items.map((item) => (
                <li key={item.id}>
                  {item.cantidad} × {item.productName} — {formatCurrency(item.precio * item.cantidad)}
                </li>
              ))}
            </ul>
          )}
          <p><strong>Total:</strong> {formatCurrency(estadoActual.total)}</p>
          {estadoActual.estado === 'pendiente' && (
            <p className={styles['estado-edit-note']}>Este pedido aún puede modificarse en el carrito.</p>
          )}
        </div>
      )}

      <div className={styles['main-content']}>
        <div className={styles['menu-section']}>
          <div className={styles['category-filter']}>
            {categorias?.map((cat) => (
              <button
                key={cat.id}
                className={`${styles['cat-btn']} ${activeCategoryId === cat.id ? styles['cat-btn-activo'] : ''}`}
                onClick={() => setActiveCategoryId(cat.id)}
              >
                {getCategoryIcon(cat.nombre)} {cat.nombre}
              </button>
            ))}
          </div>

          <div className={styles['productos-grid']}>
            {activeCategory?.productos?.length ? (
              activeCategory.productos.map((product) => (
                <div key={product.id} className={styles['product-card']}>
                  {product.imagen ? (
                    <img src={product.imagen} alt={product.nombre} loading="lazy" />
                  ) : (
                    <div className={styles['img-placeholder']}>🍽️</div>
                  )}
                  <div className={styles['product-info']}>
                    <h4>{product.nombre}</h4>
                    <p className={styles['product-tipo']}>{product.tipo}</p>
                    {product.caracteristicas && <p className={styles['product-desc']}>{product.caracteristicas}</p>}
                    <div className={styles['product-precio']}>{formatCurrency(product.precio)}</div>
                    <button
                      className={styles['btn-agregar']}
                      onClick={() => addItem(product)}
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className={styles['empty-state']}>No hay productos en esta categoría</p>
            )}
          </div>
        </div>

        <aside className={styles['cart-panel']}>
          <h3>🛒 Tu Pedido</h3>

          {cartItems.length === 0 ? (
            <div className={styles['cart-empty']}>
              <p>Agrega productos a tu pedido</p>
            </div>
          ) : (
            <div className={styles['cart-items']}>
              {cartItems.map((item) => (
                <div key={item.id} className={styles['cart-item']}>
                  <div className={styles['cart-item-info']}>
                    <h5>{item.nombre}</h5>
                    <span className={styles['item-precio']}>{formatCurrency(item.precio)}</span>
                  </div>
                  <div className={styles['cart-item-controles']}>
                    <button
                      className={styles['btn-cant']}
                      onClick={() => updateQuantity(item.id, -1)}
                      disabled={submitting}
                    >
                      −
                    </button>
                    <span className={styles['cantidad']}>{item.cantidad}</span>
                    <button
                      className={styles['btn-cant']}
                      onClick={() => updateQuantity(item.id, 1)}
                      disabled={submitting}
                    >
                      +
                    </button>
                  </div>
                  <div className={styles['item-subtotal']}>
                    {formatCurrency(item.precio * item.cantidad)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {cartItems.length > 0 && (
            <div className={styles['cart-footer']}>
              <div className={styles['cart-total']}>
                <span>Total:</span>
                <span>{formatCurrency(total)}</span>
              </div>

              <div className={styles['form-group']}>
                <label htmlFor="observaciones">Observaciones (opcional)</label>
                <textarea
                  id="observaciones"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Ej: Sin cebolla, extra queso..."
                  rows="3"
                  disabled={submitting}
                />
              </div>

              <button
                className={styles['btn-confirmar']}
                onClick={confirmarPedido}
                disabled={submitting}
              >
                {submitting
                  ? pedidoActualId
                    ? 'Actualizando...'
                    : 'Confirmando...'
                  : pedidoActualId
                    ? 'Actualizar Pedido'
                    : 'Confirmar Pedido'}
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default CustomerMenu;
