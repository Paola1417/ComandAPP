import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import {
  fetchTables,
  createTable,
  updateTable,
  deleteTable,
} from '../../api/orderApi';
import FormModal from '../../components/FormModal/FormModal';
import Modal from '../../components/Modal/Modal';
import styles from './Mesas.module.css';

const MESA_FIELDS = [
  {
    name: 'numeroMesa',
    label: 'Número de mesa',
    type: 'number',
    placeholder: 'Ej: 4',
    min: '1',
    required: true,
  },
  {
    name: 'mesero',
    label: 'Mesero',
    type: 'text',
    placeholder: 'Ej: Ana Pérez',
  },
];

const buildPayload = (values) => ({
  numeroMesa: Number(values.numeroMesa),
  mesero: (values.mesero || '').trim(),
});

const Mesas = () => {
  const { data: mesas, loading, error, refetch } = useApi(fetchTables);
  const [modal, setModal] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const openModal = (type, mesa = null) => setModal({ type, mesa });
  const closeModal = () => setModal(null);
  const closeFeedback = () => setFeedback(null);

  const setFb = (tipo, titulo, mensaje, detalle) =>
    setFeedback({ tipo, titulo, mensaje, detalle });

  const handleCreate = async (values) => {
    const payload = buildPayload(values);
    if (!payload.numeroMesa || payload.numeroMesa < 1) {
      throw new Error('El número de mesa es obligatorio y debe ser mayor a 0');
    }
    const created = await createTable(payload);
    await refetch();
    setFb(
      'exito',
      'Mesa creada',
      `La mesa ${created.numeroMesa} fue creada correctamente.`,
    );
  };

  const handleEdit = async (values) => {
    if (!modal.mesa) return;
    const payload = buildPayload(values);
    const updated = await updateTable(modal.mesa.id, payload);
    await refetch();
    setFb(
      'exito',
      'Mesa actualizada',
      `La mesa ${updated.numeroMesa} fue actualizada correctamente.`,
    );
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      if (modal.type === 'edit') {
        await handleEdit(values);
      } else {
        await handleCreate(values);
      }
      closeModal();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (mesa) => {
    if (
      !window.confirm(
        `¿Estás seguro de eliminar la mesa ${mesa.numeroMesa} (${mesa.mesero ||
          'sin mesero'})? Esta acción no se puede deshacer.`,
      )
    ) {
      return;
    }
    try {
      await deleteTable(mesa.id);
      await refetch();
      setFb('exito', 'Mesa eliminada', `La mesa ${mesa.numeroMesa} fue eliminada.`);
    } catch (err) {
      setFb(
        'error',
        'Error al eliminar',
        err.response?.data?.message ||
          'No se pudo eliminar la mesa. Puede estar asociada a órdenes.',
      );
    }
  };

  const getModalTitle = () => {
    if (modal.type === 'edit') {
      return `Editar Mesa ${modal.mesa?.numeroMesa}`;
    }
    return 'Crear Nueva Mesa';
  };

  const getInitialValues = () => {
    if (modal.type === 'edit' && modal.mesa) {
      return {
        numeroMesa: String(modal.mesa.numeroMesa),
        mesero: modal.mesa.mesero || '',
      };
    }
    return { numeroMesa: '', mesero: '' };
  };

  if (loading) {
    return (
      <div className={styles['loading-state']}>
        Cargando mesas...
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles['error-state']}>
        Error al cargar las mesas: {error.message}
      </div>
    );
  }

  return (
    <div className={styles['mesas-container']}>
      <div className={styles['mesas-header']}>
        <div className={styles['header-title']}>
          <h2>🪑 Mesas</h2>
          <p>Gestión de mesas del restaurante</p>
        </div>
        <button
          className={styles['btn-agregar']}
          onClick={() => openModal('create')}
        >
          + Nueva Mesa
        </button>
      </div>

      <div className={styles['grid-mesas']}>
        {mesas?.length ? (
          mesas.map((mesa) => (
            <div key={mesa.id} className={styles['mesa-card']}>
              <div className={styles['mesa-header']}>
                <h3>Mesa {mesa.numeroMesa}</h3>
                <div className={styles['mesa-acciones']}>
                  <button
                    className={styles['btn-icono']}
                    title="Editar mesa"
                    onClick={() => openModal('edit', mesa)}
                  >
                    ✏️
                  </button>
                  <button
                    className={styles['btn-icono']}
                    title="Eliminar mesa"
                    onClick={() => handleDelete(mesa)}
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className={styles['mesa-mesero']}>
                Mesero: {mesa.mesero || 'Sin asignar'}
              </div>

              <div className={styles['mesa-fecha']}>
                {new Date(mesa.createdAt).toLocaleDateString('es-CO', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                })}
              </div>
            </div>
          ))
        ) : (
          <div className={styles['mesas-vacio']}>
            <div className={styles['icono-grande']}>📭</div>
            <h3>No hay mesas registradas</h3>
            <p>Crea una mesa para comenzar</p>
          </div>
        )}
      </div>

      {modal && (
        <FormModal
          titulo={getModalTitle()}
          fields={MESA_FIELDS}
          initialValues={getInitialValues()}
          onSubmit={handleSubmit}
          onClose={closeModal}
          loading={submitting}
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

export default Mesas;
