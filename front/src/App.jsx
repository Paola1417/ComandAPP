import { Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar/NavBar';
import Inicio from './pages/Inicio/Inicio';
import Menu from './pages/Menu/Menu';
import Mesas from './pages/Mesas/Mesas';
import Pedidos from './pages/Pedidos/Pedidos';
import Reportes from './pages/Reportes/Reportes';

function App() {
  return (
    <div className="app">
      <NavBar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/mesas" element={<Mesas />} />
          <Route path="/pedidos" element={<Pedidos />} />
          <Route path="/reportes" element={<Reportes />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
