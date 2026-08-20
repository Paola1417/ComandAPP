import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { fetchMesasPublicas } from '../../api/orderApi';
import styles from './SeleccionMesa.module.css';

const SeleccionMesa = () => {
  const navigate = useNavigate();
  const { data: mesas, loading, error } = useApi(fetchMesasPublicas);
  const [navigating, setNavigating] = useState(false);

  const handleSeleccionar = (accessToken) => {
    if (!accessToken) return;
    setNavigating(true);
    navigate(`/pedido/${accessToken}`);
  };

  if (loading) {
    return <div className={styles['loading-state']}>Cargando mesas...</div>;
  }

  if (error) {
    return (
      <div className={styles['error-state']}>
        Error al cargar las mesas: {error.message}
      </div>
    );
  }

  if (!mesas || mesas.length === 0) {
    return (
      <div className={styles['empty-state']}>
        <div className={styles['icono-grande']}>📭</div>
        <h3>No hay mesas disponibles</h3>
        <p>Pregunta al mesero para comenzar tu pedido.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles['header-title']}>
        <h2>🍽️ Pedidos</h2>
        <p>Selecciona tu mesa para comenzar</p>
      </div>

      <div className={styles.grid}>
        {mesas.map((mesa) => (
           <div
             key={mesa.id}
             className={styles.card}
             onClick={() => handleSeleccionar(mesa.accessToken)}
              style={{ cursor: navigating ? 'wait' : 'pointer' }}
           >
            <h3>Mesa {mesa.numeroMesa}</h3>
            {mesa.mesero ? <p>Mesero: {mesa.mesero}</p> : <p>Sin mesero asignado</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SeleccionMesa;
