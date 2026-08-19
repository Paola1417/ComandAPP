import React from 'react';
import { getCategoryIcon } from '../../utils/format';
import styles from './CategoryFilter.module.css';

const CategoryFilter = ({ categories, activeCategory, onSelectCategory }) => {
  return (
    <aside className={styles.sidebar}>
      <h3>Categorías</h3>
      <div className={styles['categoria-list']}>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`${styles['categoria-btn']} ${
              activeCategory === cat.id ? styles.activo : ''
            }`}
            onClick={() => onSelectCategory(cat.id)}
          >
            <span className={styles.icono}>{getCategoryIcon(cat.nombre)}</span>
            {cat.nombre}
          </button>
        ))}
      </div>
    </aside>
  );
};

export default CategoryFilter;
