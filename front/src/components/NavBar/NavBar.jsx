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

  return (
    <header className={styles.header}>
      <div className={styles["header-left"]}>
        <div className={styles.logo}>
          <img
            src="/favicon.svg"
            alt="Logo ComandAPP"
            className={styles["logo-img"]}
          />
          <div className={styles["logo-text"]}>
            <h1>ComandAPP</h1>
          </div>
        </div>
      </div>
      <nav className={styles.nav}>
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
        {user ? (
          <button
            className={styles["nav-link"]}
            style={{ background: "none", border: "none", color: "inherit", cursor: "pointer" }}
            onClick={handleLogout}
          >
            Cerrar sesión
          </button>
        ) : (
          <NavLink to="/login" className={styles["nav-link"]}>
            Login
          </NavLink>
        )}
      </nav>
    </header>
  );
};

export default NavBar;
