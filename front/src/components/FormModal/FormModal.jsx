import React, { useState } from 'react';
import styles from './FormModal.module.css';

const FormModal = ({ titulo, fields, onSubmit, onClose, loading, initialValues, closeOnOutsideClick = true, submitLabel = 'Guardar', error: errorProp }) => {
  const [values, setValues] = useState(() => {
    const initial = {};
    fields.forEach((f) => {
      initial[f.name] = initialValues?.[f.name] ?? f.value ?? '';
    });
    return initial;
  });
  const [error, setError] = useState(errorProp || null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await onSubmit(values);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'No se pudo completar la operación';
      setError(msg);
    }
  };

  return (
    <div className={styles['modal-overlay']} onClick={closeOnOutsideClick ? onClose : undefined}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button className={styles['btn-cerrar']} onClick={onClose}>
          ✕
        </button>
        <h3 className={styles.titulo}>{titulo}</h3>

        {error && <div className={styles.error}>{error}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
          {fields.map((field) => (
            <div key={field.name} className={styles['field-group']}>
              <label htmlFor={field.name} className={styles.label}>
                {field.label}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  id={field.name}
                  name={field.name}
                  value={values[field.name]}
                  onChange={handleChange}
                  className={styles['input-textarea']}
                  rows={field.rows || 3}
                  disabled={loading}
                  placeholder={field.placeholder}
                />
              ) : (
                <input
                  id={field.name}
                  type={field.type || 'text'}
                  name={field.name}
                  value={values[field.name]}
                  onChange={handleChange}
                  className={styles['input-text']}
                  disabled={loading}
                  placeholder={field.placeholder}
                  min={field.min}
                  step={field.step}
                />
              )}
            </div>
          ))}

          <div className={styles['actions']}>
            <button
              type="button"
              className={styles['btn-cancelar']}
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles['btn-guardar']}
              disabled={loading}
            >
              {loading ? 'Guardando...' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormModal;
