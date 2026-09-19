import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Waiter from './pages/Waiter/Waiter';
import Reception from './pages/Reception/Reception';
import Warehouse from './pages/Warehouse/Warehouse';
import Kitchen from './pages/Kitchen/Kitchen';
import Manager from './pages/Manager/Manager';
import Admin from './pages/Admin/Admin';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        
        <Route path="/waiter" element={<Waiter />} />
        <Route path="/reception" element={<Reception />} />
        <Route path="/warehouse" element={<Warehouse />} />
        <Route path="/kitchen" element={<Kitchen />} />
        <Route path="/manager" element={<Manager />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;