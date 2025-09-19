// src/components/Sidebar.jsx
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
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
      className="d-flex flex-column p-3 text-white shadow"
      style={{
        width: "250px",
        background: "linear-gradient(180deg, #0f0f0f 0%, #1c1c1c 100%)",
        borderRight: "1px solid rgba(255,255,255,0.08)",
        minHeight: "100vh",
      }}
    >
      {/* Logo / Brand */}
      <div className="d-flex align-items-center justify-content-center mb-4">
        <i className="bi bi-bag-check-fill me-2" style={{ fontSize: 22 }}></i>
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

      {/* Footer / Logout */}
      <div className="mt-auto">
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
