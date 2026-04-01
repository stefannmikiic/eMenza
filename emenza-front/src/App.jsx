import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Pocetna from './pages/Pocetna';
import Login from './pages/Login';
import Register from './pages/Register';
import UplataNovca from './pages/UplataNovca';
import KupiObroke from './pages/KupiObroke';
import ProduziKarticu from './pages/ProduziKarticu';
import MojProfil from './components/MojProfil';
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './pages/NotFound';

function App() {

  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ProtectedRoute><Pocetna /></ProtectedRoute>} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/uplata-novca" element={<ProtectedRoute><UplataNovca /></ProtectedRoute>} />
          <Route path="/kupi-obroke" element={<ProtectedRoute><KupiObroke /></ProtectedRoute>} />
          <Route path="/produzi-karticu" element={<ProtectedRoute><ProduziKarticu /></ProtectedRoute>} />
          <Route path="/profil" element={<ProtectedRoute><MojProfil /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>

  )
}

export default App
