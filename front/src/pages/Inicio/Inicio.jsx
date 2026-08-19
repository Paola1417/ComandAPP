import React, { useState, useEffect, useMemo } from 'react';
import { useApi } from '../../hooks/useApi';
import { fetchCategories } from '../../api/orderApi';
import CategoryFilter from '../../components/CategoryFilter/CategoryFilter';
import ProductCard from '../../components/ProductCard/ProductCard';
import CartPanel from '../../components/CartPanel/CartPanel';
import { getCategoryIcon } from '../../utils/format';
import styles from './Inicio.module.css';

const Inicio = () => {
  const { data: categories, loading, error } = useApi(fetchCategories);
  const [activeCategoryId, setActiveCategoryId] = useState(null);

  useEffect(() => {
    if (categories && categories.length > 0 && !activeCategoryId) {
      setActiveCategoryId(categories[0].id);
    }
  }, [categories, activeCategoryId]);

  const activeCategory = useMemo(() => {
    if (!categories) return null;
    return categories.find((cat) => cat.id === activeCategoryId) || null;
  }, [categories, activeCategoryId]);

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
        Error al cargar las categorías: {error.message}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <CategoryFilter
        categories={categories || []}
        activeCategory={activeCategoryId}
        onSelectCategory={setActiveCategoryId}
      />

      <main className={styles['productos-area']}>
        <h2>
          {activeCategory
            ? `${getCategoryIcon(activeCategory.nombre)} ${activeCategory.nombre}`
            : 'Selecciona una categoría'}
        </h2>
        <div className={styles['grid-productos']}>
          {activeCategory?.productos?.length ? (
            activeCategory.productos.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <p className={styles['empty-state']}>No hay productos en esta categoría</p>
          )}
        </div>
      </main>

      <CartPanel />
    </div>
  );
};

export default Inicio;
