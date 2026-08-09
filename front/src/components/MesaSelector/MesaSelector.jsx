import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { fetchTables } from '../../api/orderApi';
import styles from './MesaSelector.module.css';

const MesaSelector = () => {
  const { selectedMesa, setMesa } = useCart();
  const [mesas, setMesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadMesas = async () => {
      try {
        const data = await fetchTables();
        setMesas(data);
        setError(null);
      } catch (err) {
        setError('No se pudieron cargar las mesas');
      } finally {
        setLoading(false);
      }
    };
    loadMesas();
  }, []);

  const handleChange = (e) => {
    const value = e.target.value;
    if (value === '') {
      setMesa(null);
    } else {
      const mesa = mesas.find((m) => m.id === parseInt(value));
      setMesa(mesa);
    }
  };

  return (
    <div className={styles['mesa-selector']}>
      <label htmlFor="mesa-select">Mesa:</label>
      {loading ? (
        <span className={styles.loading}>Cargando mesas...</span>
      ) : error ? (
        <span className={styles.error}>{error}</span>
      ) : (
        <select
          id="mesa-select"
          value={selectedMesa ? selectedMesa.id : ''}
          onChange={handleChange}
          className={styles.select}
        >
          <option value="">Seleccionar mesa</option>
          {mesas.map((mesa) => (
            <option key={mesa.id} value={mesa.id}>
              Mesa {mesa.numeroMesa} — {mesa.mesero}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default MesaSelector;
