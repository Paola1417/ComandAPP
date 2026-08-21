import { Routes, Route, Navigate } from 'react-router-dom';
import React from 'react';
import NavBar from './components/NavBar/NavBar';
import Inicio from './pages/Inicio/Inicio';
import Menu from './pages/Menu/Menu';
import Mesas from './pages/Mesas/Mesas';
import Pedidos from './pages/Pedidos/Pedidos';
import Reportes from './pages/Reportes/Reportes';
import Login from './pages/Login/Login';
import Kitchen from './pages/Kitchen/Kitchen';
import CustomerMenu from './pages/CustomerMenu/CustomerMenu';
import SeleccionMesa from './pages/SeleccionMesa/SeleccionMesa';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

function AppContent() {
  return (
    <>
      <NavBar />
      <main className="main-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/pedido" element={<SeleccionMesa />} />
          <Route path="/pedido/:token" element={<CustomerMenu />} />

          <Route
            path="/"
            element={
              <ProtectedRoute roles={["administrador", "cocina"]}>
                <Inicio />
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu"
            element={
              <ProtectedRoute roles={['administrador']}>
                <Menu />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mesas"
            element={
              <ProtectedRoute roles={['administrador']}>
                <Mesas />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pedidos"
            element={
              <ProtectedRoute roles={['administrador', 'cocina']}>
                <Pedidos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reportes"
            element={
              <ProtectedRoute roles={['administrador']}>
                <Reportes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cocina"
            element={
              <ProtectedRoute roles={['administrador', 'cocina']}>
                <Kitchen />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

function App() {
  return <AppContent />;
}

export default App;

