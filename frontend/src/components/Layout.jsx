import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

function Layout({ user, onLogout, children }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const allMenuItems = [
    { path: "/pencatatan", label: "Pencatatan Keuangan", icon: "📊", roles: null },
    { path: "/master-desa", label: "Master Desa & Kelompok", icon: "🏘️", roles: ["KUadmin"] },
    { path: "/users", label: "User Management", icon: "👥", roles: ["KUadmin"] },
  ];

  const menuItems = allMenuItems.filter(
    (item) => !item.roles || item.roles.includes(user.role)
  );

  const handleNavClick = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="app-layout">
      {/* Mobile Header */}
      <header className="mobile-header">
        <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
        <h2>💰 KU Apps</h2>
        <span className="mobile-user-role">{user.role}</span>
      </header>

      {/* Overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>💰 KU Apps</h2>
          <p className="user-info">{user.nama}</p>
          <span className="user-role">{user.role}</span>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? "active" : ""}`}
              onClick={handleNavClick}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button onClick={onLogout} className="btn-logout">
            🚪 Logout
          </button>
        </div>
      </aside>

      <main className="main-content">{children}</main>
    </div>
  );
}

export default Layout;
