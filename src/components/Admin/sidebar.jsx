// src/components/Sidebar.jsx
import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import brandLogo from "../../assets/images/Branding/alienStoreLogo_noBrand.svg";

export default function Sidebar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Ambil data user dari localStorage / sessionStorage
    const storedUser =
      JSON.parse(localStorage.getItem("user")) ||
      JSON.parse(sessionStorage.getItem("user"));
    if (storedUser) setUser(storedUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/login");
  };

  const menuItems = [
    { name: "Admin", path: "/admin", icon: "bi-speedometer2" },
    { name: "Subcategories", path: "/dashboard", icon: "bi-folder2" },
    { name: "Products", path: "/product", icon: "bi-box-seam" },
    { name: "Orders", path: "/orders", icon: "bi-bag-check" },
    { name: "Customers", path: "/customers", icon: "bi-people" },
    { name: "Reports", path: "/reports", icon: "bi-graph-up" },
  ];

  return (
    <div
      className="d-flex flex-column p-3 text-white shadow position-fixed top-0 start-0"
      style={{
        width: "250px",
        background: "linear-gradient(180deg, #0f0f0f 0%, #1c1c1c 100%)",
        borderRight: "1px solid rgba(255,255,255,0.08)",
        height: "100vh",
        zIndex: 1000,
      }}
    >
      {/* Logo / Brand */}
      <div className="d-flex align-items-center justify-content-center mb-4">
<img src={brandLogo} alt="AlienStore" className="me-2" style={{ height: 80, objectFit: "contain" }} />
        <h4 className="fw-bold m-0">AlienStore</h4>
      </div>

      {/* Navigation */}
      <ul className="nav nav-pills flex-column mb-auto">
        {menuItems.map((item) => (
          <li key={item.path} className="nav-item mb-1">
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `nav-link d-flex align-items-center gap-2 px-3 py-2 rounded-2 ${
                  isActive ? "bg-primary text-white" : "text-secondary"
                }`
              }
            >
              <i className={`bi ${item.icon}`}></i>
              <span>{item.name}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Current Account Info */}
      {user && (
        <div
          className="mt-3 p-3 rounded-3 text-white"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div className="d-flex align-items-center gap-2 mb-2">
            <i className="bi bi-person-circle fs-4 text-primary"></i>
            <div>
              <div className="fw-semibold">{user.name}</div>
              <div
                className="text-secondary small"
                style={{ fontSize: "0.8rem" }}
              >
                {user.role?.name || "Admin"}
              </div>
            </div>
          </div>
          <hr className="border-secondary my-2" />
          <div
            className="small text-secondary"
            style={{ fontSize: "0.75rem" }}
          >
            Logged in as {user.email}
          </div>
        </div>
      )}

      {/* Footer / Logout */}
      <div className="mt-auto pt-3">
        <button
          onClick={handleLogout}
          className="btn btn-danger w-100 d-flex align-items-center justify-content-center gap-2"
        >
          <i className="bi bi-box-arrow-right"></i>
          Logout
        </button>
        <div className="pt-3 small text-secondary text-center">
          <span className="d-block">AlienStore v1.0</span>
        </div>
      </div>
    </div>
  );
}
