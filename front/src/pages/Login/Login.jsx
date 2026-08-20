import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Login.module.css';

const Login = () => {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg(null);
    try {
      const result = await login(correo, password);
      const userRol = result?.user?.rol;
      if (userRol === 'administrador') navigate('/');
      else if (userRol === 'cocina') navigate('/cocina');
      else navigate('/');
    } catch (err) {
      setMsg(err?.response?.data?.message || 'Credenciales inválidas');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles['login-container']}>
      <div className={styles['login-card']}>
        <div className={styles['login-header']}>
          <img src="/favicon.svg" alt="Logo ComandAPP" className={styles['login-logo']} />
          <h1>ComandAPP</h1>
          <p>Ingreso para el personal</p>
        </div>

        <form className={styles['login-form']} onSubmit={handleSubmit}>
          <div className={styles['form-group']}>
            <label htmlFor="correo">Correo electrónico</label>
            <input
              id="correo"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="Ingrese su correo"
              required
              disabled={submitting}
            />
          </div>

          <div className={styles['form-group']}>
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingrese su contraseña"
              required
              disabled={submitting}
            />
          </div>

          {msg && <div className={styles['error-msg']}>{msg}</div>}

          <button
            type="submit"
            className={styles['btn-login']}
            disabled={submitting || !correo || !password}
          >
            {submitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>

        <div className={styles['login-footer']}>
          <p>Usuarios de prueba:</p>
          <p>admin@comandapp.com / admin123</p>
          <p>cocina@comandapp.com / cocina123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
