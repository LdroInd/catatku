import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import ChangePassword from "./ChangePassword";

function Layout({ user, onLogout, children }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

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
          <div className="profile-container">
            <button className="btn-profile" onClick={() => setProfileOpen(!profileOpen)}>
              <span className="profile-icon">⚙️</span>
              <span className="profile-name">{user.nama}</span>
            </button>
            {profileOpen && (
              <div className="profile-dropdown">
                <button
                  className="profile-menu-item"
                  onClick={() => { setShowChangePassword(true); setProfileOpen(false); }}
                >
                  <span>🔑</span> Ganti Password
                </button>
                <button className="profile-menu-item logout" onClick={onLogout}>
                  <span>🚪</span> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      <main className="main-content">{children}</main>

      {/* Change Password Modal */}
      {showChangePassword && (
        <ChangePassword user={user} onClose={() => setShowChangePassword(false)} />
      )}
    </div>
  );
}

export default Layout;
