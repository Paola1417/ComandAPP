import React, { useState, useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import styles from './NavBar.module.css';

const NavBar = () => {
  const { itemCount } = useCart();
  const [showCart, setShowCart] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('¿Está seguro que desea cerrar sesión?')) {
      alert('Sesión cerrada correctamente');
      navigate('/');
      setShowCart(false);
    }
  };

  const toggleCart = () => {
    setShowCart(!showCart);
    if (!showCart) {
      navigate('/');
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles['header-left']}>
        <div className={styles.logo}>
          <svg
            className={styles['logo-img']}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20 70C10 60 10 40 20 30C30 20 40 25 35 35C30 45 25 40 25 50C25 60 35 65 40 55"
              stroke="#ff6b00"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M35 55C40 50 50 45 55 50C60 55 55 65 50 70C45 75 40 70 45 65"
              stroke="#ff6b00"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M55 30C60 20 75 15 80 25C85 35 75 40 70 35"
              stroke="#ff6b00"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M70 35C75 40 80 50 75 60C70 70 60 75 55 65C50 55 60 50 65 55"
              stroke="#ff6b00"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
            <path d="M65 50L75 42L82 48L72 56Z" fill="#ff6b00" />
          </svg>
          <div className={styles['logo-text']}>
            <h1>SISTEMA INTELIGENTE DE PEDIDOS</h1>
            <span>Restaurante Fast Casual</span>
          </div>
        </div>
      </div>
      <nav className={styles.nav}>
        <NavLink to="/" className={styles['nav-link']} end>
          Inicio
        </NavLink>
        <NavLink to="/menu" className={styles['nav-link']}>
          Menú
        </NavLink>
        <NavLink to="/pedidos" className={styles['nav-link']}>
          Pedidos
        </NavLink>
        <NavLink to="/reportes" className={styles['nav-link']}>
          Reportes
        </NavLink>
        <button className={styles['btn-cerrar']} onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </nav>
    </header>
  );
};

export default NavBar;
