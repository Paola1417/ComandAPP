import React from 'react';
import { useApi } from '../../hooks/useApi';
import { fetchCategories } from '../../api/orderApi';
import ProductCard from '../../components/ProductCard/ProductCard';
import { getCategoryIcon } from '../../utils/format';
import styles from './Menu.module.css';

const Menu = () => {
  const { data: categories, loading, error } = useApi(fetchCategories);

  if (loading) {
    return (
      <div className={styles['loading-state']}>
        Cargando menú...
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles['error-state']}>
        Error al cargar el menú: {error.message}
      </div>
    );
  }

  return (
    <div className={styles['menu-container']}>
      <div className={styles['menu-header']}>
        <h2>📋 Menú Completo</h2>
        <p>Explora todos nuestros productos organizados por categoría</p>
      </div>

      <div className={styles['menu-content']}>
        {categories?.length ? (
          categories.map((categoria) => (
            <div key={categoria.id} className={styles['menu-categoria']}>
              <h3>
                {getCategoryIcon(categoria.nombre)} {categoria.nombre}
              </h3>
              <div className={styles['grid-productos']}>
                {categoria.productos?.length ? (
                  categoria.productos.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))
                ) : (
                  <p className={styles['empty-cat']}>Sin productos</p>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className={styles['empty-state']}>No hay categorías disponibles</p>
        )}
      </div>
    </div>
  );
};

export default Menu;
