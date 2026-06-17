import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import UserManagement from "./pages/UserManagement";
import MasterDesa from "./pages/MasterDesa";
import Pencatatan from "./pages/Pencatatan";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Navigate to="/pencatatan" />} />
          <Route path="/users" element={user.role === "KUadmin" ? <UserManagement /> : <Navigate to="/pencatatan" />} />
          <Route path="/master-desa" element={user.role === "KUadmin" ? <MasterDesa /> : <Navigate to="/pencatatan" />} />
          <Route path="/pencatatan" element={<Pencatatan user={user} />} />
          <Route path="*" element={<Navigate to="/pencatatan" />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
