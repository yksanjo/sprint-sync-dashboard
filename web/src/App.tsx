import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ConfigForm from './pages/ConfigForm';
import Pricing from './pages/Pricing';
import ToastContainer from './components/ToastContainer';

function App() {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('token')
  );

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);
  }, []);

  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        <Route
          path="/login"
          element={token ? <Navigate to="/dashboard" /> : <Login setToken={setToken} />}
        />
        <Route
          path="/register"
          element={token ? <Navigate to="/dashboard" /> : <Register setToken={setToken} />}
        />
        <Route
          path="/dashboard"
          element={token ? <Dashboard token={token} /> : <Navigate to="/login" />}
        />
        <Route
          path="/config/new"
          element={token ? <ConfigForm token={token} /> : <Navigate to="/login" />}
        />
        <Route
          path="/config/:id"
          element={token ? <ConfigForm token={token} /> : <Navigate to="/login" />}
        />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;



