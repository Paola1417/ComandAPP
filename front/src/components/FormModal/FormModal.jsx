import React, { useState, useRef } from 'react';
import styles from './FormModal.module.css';

const FormModal = ({ titulo, fields, onSubmit, onClose, loading, initialValues, closeOnOutsideClick = true, submitLabel = 'Guardar', error: errorProp, onFileUpload }) => {
  const [values, setValues] = useState(() => {
    const initial = {};
    fields.forEach((f) => {
      initial[f.name] = initialValues?.[f.name] ?? f.value ?? '';
    });
    return initial;
  });
  const [error, setError] = useState(errorProp || null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputs = useRef({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleFileChange = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!onFileUpload) return;

    setUploadingFile(true);
    setError(null);
    try {
      const url = await onFileUpload(file);
      const target = field.target || 'imagen';
      setValues((prev) => ({ ...prev, [target]: url }));
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'No se pudo subir la imagen';
      setError(msg);
    } finally {
      setUploadingFile(false);
      if (fileInputs.current[field.name]) {
        fileInputs.current[field.name].value = '';
      }
    }
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
                  disabled={loading || uploadingFile}
                  placeholder={field.placeholder}
                />
              ) : field.type === 'file' ? (
                <input
                  id={field.name}
                  name={field.name}
                  type="file"
                  ref={(el) => { fileInputs.current[field.name] = el; }}
                  accept={field.accept}
                  onChange={(e) => handleFileChange(e, field)}
                  className={styles['input-file']}
                  disabled={loading || uploadingFile}
                />
              ) : (
                <input
                  id={field.name}
                  type={field.type || 'text'}
                  name={field.name}
                  value={values[field.name]}
                  onChange={handleChange}
                  className={styles['input-text']}
                  disabled={loading || uploadingFile}
                  placeholder={field.placeholder}
                  min={field.min}
                  step={field.step}
                />
              )}
              {field.preview && values[field.name] ? (
                <div className={styles['img-preview']}>
                  <img src={values[field.name]} alt="Vista previa" />
                </div>
              ) : null}
            </div>
          ))}

          {uploadingFile && <div className={styles['uploading-note']}>Subiendo imagen...</div>}

          <div className={styles['actions']}>
            <button
              type="button"
              className={styles['btn-cancelar']}
              onClick={onClose}
              disabled={loading || uploadingFile}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles['btn-guardar']}
              disabled={loading || uploadingFile}
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
