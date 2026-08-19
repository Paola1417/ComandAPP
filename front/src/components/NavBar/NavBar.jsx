import React, { useState, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import styles from "./NavBar.module.css";

const NavBar = () => {
  const { itemCount } = useCart();
  const [showCart, setShowCart] = useState(false);
  const navigate = useNavigate();

  const toggleCart = () => {
    setShowCart(!showCart);
    if (!showCart) {
      navigate("/");
    }
  };

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
        <NavLink to="/menu" className={styles["nav-link"]}>
          Menú
        </NavLink>
        <NavLink to="/mesas" className={styles["nav-link"]}>
          Mesas
        </NavLink>
        <NavLink to="/pedidos" className={styles["nav-link"]}>
          Pedidos
        </NavLink>
        <NavLink to="/reportes" className={styles["nav-link"]}>
          Reportes
        </NavLink>
      </nav>
    </header>
  );
};

export default NavBar;
