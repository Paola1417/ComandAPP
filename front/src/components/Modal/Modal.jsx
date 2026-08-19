import React from 'react';
import styles from './Modal.module.css';

const Modal = ({ id, titulo, mensaje, detalle, tipo = 'exito', onClose }) => {
  return (
    <div id={id} className={`${styles['modal-overlay']} ${styles.activo}`}>
      <div className={styles.modal}>
        <div
          className={
            tipo === 'error'
              ? styles['modal-icono.error']
              : styles['modal-icono.exito']
          }
        >
          {tipo === 'error' ? '⚠' : '✓'}
        </div>
        <h3>{titulo}</h3>
        {mensaje && <p>{mensaje}</p>}
        {detalle && <p className={styles.detalle}>{detalle}</p>}
        <button className={styles['btn-modal']} onClick={onClose}>
          Entendido
        </button>
      </div>
    </div>
  );
};

export default Modal;
