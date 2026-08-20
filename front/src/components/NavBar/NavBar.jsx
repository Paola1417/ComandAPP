import React, { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import styles from "./NavBar.module.css";

const NavBar = () => {
  const { itemCount } = useCart();
  const { user, rol, logout } = useAuth();
  const [showCart, setShowCart] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleCart = () => {
    setShowCart(!showCart);
    if (!showCart) {
      navigate("/");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isAdmin = rol === "administrador";
  const isCocina = rol === "cocina";
  const isCustomerMenu = location.pathname.startsWith("/pedido/");

  const handleLogoClick = () => {
    if (isAdmin) navigate("/");
    else if (isCocina) navigate("/cocina");
    else navigate("/pedido");
  };

  return (
    <header className={styles.header}>
      <div className={styles["header-left"]}>
        <button
          type="button"
          className={styles.logo}
          onClick={handleLogoClick}
          title="ComandAPP"
        >
          <img
            src="/favicon.svg"
            alt="Logo ComandAPP"
            className={styles["logo-img"]}
          />
          <div className={styles["logo-text"]}>
            <h1>ComandAPP</h1>
          </div>
        </button>
      </div>
      <nav className={styles.nav}>
        {user ? (
          <>
            <NavLink to="/" className={styles["nav-link"]} end>
              Inicio
            </NavLink>
            {isAdmin && (
              <NavLink to="/menu" className={styles["nav-link"]}>
                Menú
              </NavLink>
            )}
            {isAdmin && (
              <NavLink to="/mesas" className={styles["nav-link"]}>
                Mesas
              </NavLink>
            )}
            {(isAdmin || isCocina) && (
              <NavLink to="/pedidos" className={styles["nav-link"]}>
                Pedidos
              </NavLink>
            )}
            {(isAdmin || isCocina) && (
              <NavLink to="/cocina" className={styles["nav-link"]}>
                Cocina
              </NavLink>
            )}
            {isAdmin && (
              <NavLink to="/reportes" className={styles["nav-link"]}>
                Reportes
              </NavLink>
            )}
            <button
              className={styles["btn-cerrar"]}
              onClick={handleLogout}
            >
              Cerrar sesión
            </button>
          </>
        ) : (
          isCustomerMenu && (
            <NavLink to="/pedido" className={styles["nav-link"]}>
              ← Volver a seleccionar mesa
            </NavLink>
          )
        )}
      </nav>
    </header>
  );
};

export default NavBar;
