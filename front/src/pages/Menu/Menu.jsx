import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  createCategoryProduct,
  updateProduct,
  deleteProduct,
} from '../../api/orderApi';
import ProductCard from '../../components/ProductCard/ProductCard';
import FormModal from '../../components/FormModal/FormModal';
import Modal from '../../components/Modal/Modal';
import { getCategoryIcon } from '../../utils/format';
import styles from './Menu.module.css';

const CATEGORY_FIELDS = [
  { name: 'nombre', label: 'Nombre de la categoría', type: 'text', placeholder: 'Ej: Hamburguesas', required: true },
  { name: 'descripcion', label: 'Descripción', type: 'textarea', placeholder: 'Descripción opcional de la categoría', rows: 3 },
];

const PRODUCT_FIELDS = [
  { name: 'tipo', label: 'Tipo', type: 'text', placeholder: 'Ej: Hamburguesa', required: true },
  { name: 'nombre', label: 'Nombre del producto', type: 'text', placeholder: 'Ej: Big Burger', required: true },
  { name: 'precio', label: 'Precio', type: 'number', placeholder: '0.00', min: '0', step: '0.01', required: true },
  { name: 'caracteristicas', label: 'Características', type: 'textarea', placeholder: 'Ingredientes, descripción, etc.', rows: 3 },
  { name: 'imagen', label: 'URL de imagen', type: 'text', placeholder: 'https://...' },
];

const buildProductPayload = (values, categoryId = null) => ({
  tipo: values.tipo.trim(),
  nombre: values.nombre.trim(),
  precio: parseFloat(values.precio),
  caracteristicas: values.caracteristicas.trim() || null,
  imagen: values.imagen.trim() || null,
  ...(categoryId ? { categoryId } : {}),
});

const buildCategoryPayload = (values) => ({
  nombre: values.nombre.trim(),
  descripcion: values.descripcion.trim() || null,
});

const Menu = () => {
  const { data: categories, loading, error, refetch } = useApi(fetchCategories);
  const [modal, setModal] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const openModal = (type, categoria = null, product = null) => {
    setModal({ type, categoria, product });
  };
  const closeModal = () => {
    setModal(null);
  };
  const closeFeedback = () => {
    setFeedback(null);
  };

  const handleCreateCategory = async (values) => {
    const created = await createCategory(buildCategoryPayload(values));
    await refetch();
    setFeedback({
      tipo: 'exito',
      titulo: 'Categoría creada',
      mensaje: `La categoría "${created.nombre}" fue creada correctamente.`,
    });
  };

  const handleEditCategory = async (values) => {
    if (!modal.categoria) return;
    const updated = await updateCategory(modal.categoria.id, buildCategoryPayload(values));
    await refetch();
    setFeedback({
      tipo: 'exito',
      titulo: 'Categoría actualizada',
      mensaje: `La categoría "${updated.nombre}" fue actualizada correctamente.`,
    });
  };

  const handleCreateProduct = async (values) => {
    if (!modal.categoria) return;
    const created = await createCategoryProduct(
      modal.categoria.id,
      buildProductPayload(values)
    );
    await refetch();
    setFeedback({
      tipo: 'exito',
      titulo: 'Producto creado',
      mensaje: `El producto "${created.nombre}" fue creado en la categoría.`,
    });
  };

  const handleEditProduct = async (values) => {
    if (!modal.product) return;
    const updated = await updateProduct(
      modal.product.id,
      buildProductPayload(values, modal.product.categoryId)
    );
    await refetch();
    setFeedback({
      tipo: 'exito',
      titulo: 'Producto actualizado',
      mensaje: `El producto "${updated.nombre}" fue actualizado correctamente.`,
    });
  };

  const handleDeleteCategory = async (categoria) => {
    if (
      !window.confirm(
        `¿Estás seguro de eliminar la categoría "${categoria.nombre}"? Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }
    try {
      await deleteCategory(categoria.id);
      await refetch();
      setFeedback({
        tipo: 'exito',
        titulo: 'Categoría eliminada',
        detalle: `La categoría "${categoria.nombre}" fue eliminada.`,
      });
    } catch (err) {
      setFeedback({
        tipo: 'error',
        titulo: 'Error al eliminar',
        mensaje: err.response?.data?.message || 'No se pudo eliminar la categoría.',
      });
    }
  };

  const handleDeleteProduct = async (product) => {
    if (
      !window.confirm(
        `¿Estás seguro de eliminar el producto "${product.nombre}"? Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }
    try {
      await deleteProduct(product.id);
      await refetch();
      setFeedback({
        tipo: 'exito',
        titulo: 'Producto eliminado',
        detalle: `El producto "${product.nombre}" fue eliminado.`,
      });
    } catch (err) {
      setFeedback({
        tipo: 'error',
        titulo: 'Error al eliminar',
        mensaje: err.response?.data?.message || 'No se pudo eliminar el producto.',
      });
    }
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      switch (modal.type) {
        case 'createCategory':
          await handleCreateCategory(values);
          break;
        case 'editCategory':
          await handleEditCategory(values);
          break;
        case 'createProduct':
          await handleCreateProduct(values);
          break;
        case 'editProduct':
          await handleEditProduct(values);
          break;
        default:
          break;
      }
      closeModal();
    } finally {
      setSubmitting(false);
    }
  };

  const getModalTitle = () => {
    switch (modal.type) {
      case 'createCategory':
        return 'Crear Nueva Categoría';
      case 'editCategory':
        return `Editar Categoría: ${modal.categoria?.nombre || ''}`;
      case 'createProduct':
        return `Crear Producto en "${modal.categoria?.nombre || ''}"`;
      case 'editProduct':
        return `Editar Producto: ${modal.product?.nombre || ''}`;
      default:
        return '';
    }
  };

  const getModalFields = () => {
    return modal.type.includes('Category') ? CATEGORY_FIELDS : PRODUCT_FIELDS;
  };

  const getInitialValues = () => {
    switch (modal.type) {
      case 'editCategory':
        return {
          nombre: modal.categoria.nombre,
          descripcion: modal.categoria.descripcion || '',
        };
      case 'editProduct':
        return {
          tipo: modal.product.tipo,
          nombre: modal.product.nombre,
          precio: modal.product.precio,
          caracteristicas: modal.product.caracteristicas || '',
          imagen: modal.product.imagen || '',
        };
      default:
        return {};
    }
  };

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
        <div className={styles['header-title']}>
          <h2>📋 Menú Completo</h2>
          <p>Explora todos nuestros productos organizados por categoría</p>
        </div>
        <button
          className={styles['btn-agregar-cat']}
          onClick={() => openModal('createCategory')}
        >
          + Agregar Categoría
        </button>
      </div>

      <div className={styles['menu-content']}>
        {categories?.length ? (
          categories.map((categoria) => (
            <div key={categoria.id} className={styles['menu-categoria']}>
              <div className={styles['categoria-header']}>
                <h3>
                  {getCategoryIcon(categoria.nombre)} {categoria.nombre}
                </h3>
                <div className={styles['categoria-acciones']}>
                  <button
                    className={styles['btn-accion-cat']}
                    title="Editar categoría"
                    onClick={() => openModal('editCategory', categoria)}
                  >
                    ✏️
                  </button>
                  <button
                    className={styles['btn-accion-cat']}
                    title="Eliminar categoría"
                    onClick={() => handleDeleteCategory(categoria)}
                  >
                    🗑️
                  </button>
                  <button
                    className={styles['btn-agregar-prod']}
                    onClick={() => openModal('createProduct', categoria)}
                  >
                    + Producto
                  </button>
                </div>
              </div>

              <div className={styles['grid-productos']}>
                {categoria.productos?.length ? (
                  categoria.productos.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      editable={true}
                      onEdit={() => openModal('editProduct', categoria, product)}
                      onDelete={() => handleDeleteProduct(product)}
                    />
                  ))
                ) : (
                  <p className={styles['empty-cat']}>Sin productos</p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className={styles['empty-full']}>
            <button
              className={styles['btn-agregar-cat']}
              onClick={() => openModal('createCategory')}
            >
              + Crear primera categoría
            </button>
          </div>
        )}
      </div>

      {modal && (
        <FormModal
          titulo={getModalTitle()}
          fields={getModalFields()}
          initialValues={getInitialValues()}
          onSubmit={handleSubmit}
          onClose={closeModal}
          loading={submitting}
          closeOnOutsideClick={modal.type !== 'createProduct' && modal.type !== 'editProduct'}
          submitLabel="Guardar"
        />
      )}

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

export default Menu;
