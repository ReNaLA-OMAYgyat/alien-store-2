// src/components/Navbar.jsx
import React, { useState, useEffect } from "react";
import { BsLightning, BsPerson, BsBag } from "react-icons/bs";
import { AiOutlineMenu } from "react-icons/ai";
import { useNavigate, useLocation, Link } from "react-router-dom";
import api from "../api";

// ✅ Pre-placed categories (instant render)
const defaultCategories = [
  { id: 1, name: "Fashion" },
  { id: 2, name: "F&B" },
  { id: 3, name: "Sembako" },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation(); // 👈 detect current page

  const [userRole, setUserRole] = useState(localStorage.getItem("role") || null);
  const [cartCount, setCartCount] = useState(0);
  const [categories] = useState(defaultCategories);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [subLoading, setSubLoading] = useState(true);

  const getCartItemCount = (carts) => {
    let merged = {};
    carts.forEach((cart) =>
      cart.items.forEach((item) => {
        if (merged[item.product_id]) merged[item.product_id].qty += item.qty;
        else merged[item.product_id] = { ...item };
      })
    );
    return Object.values(merged).reduce((sum, item) => sum + item.qty, 0);
  };

  const fetchCartCount = async () => {
    if (userRole !== "User") return;
    try {
      const res = await api.get("/carts");
      setCartCount(getCartItemCount(res.data || []));
    } catch {
      setCartCount(0);
    }
  };

  const fetchCategories = async () => {
    try {
      setSubLoading(true);
      const subRes = await api.get("/user-login-subcategories");
      setSubcategories(subRes.data || []);
    } catch (err) {
      console.error("Error fetching subcategories:", err);
    } finally {
      setSubLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    if (userRole === "User") fetchCartCount();

    const handleLogin = (e) => {
      setUserRole(e.detail.role);
      if (e.detail.role === "User") fetchCartCount();
    };
    const handleLogout = () => {
      setUserRole(null);
      setCartCount(0);
    };
    const handleCartUpdate = (e) => {
      if (e.detail?.increment) setCartCount((prev) => prev + e.detail.increment);
      else fetchCartCount();
    };

    window.addEventListener("userLogin", handleLogin);
    window.addEventListener("userLogout", handleLogout);
    window.addEventListener("cartUpdated", handleCartUpdate);

    return () => {
      window.removeEventListener("userLogin", handleLogin);
      window.removeEventListener("userLogout", handleLogout);
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, [userRole]);

  const handleLogoutClick = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setUserRole(null);
    setCartCount(0);
    window.dispatchEvent(new Event("userLogout"));
    navigate("/login");
  };

  const handleCartClick = () => {
    if (!localStorage.getItem("token")) navigate("/login");
    else navigate("/cart");
  };

  const selectCategory = (cat) => {
    setSelectedCategory(cat.id);
    setSelectedSubcategory(null);
    window.dispatchEvent(
      new CustomEvent("categorySelected", { detail: { categoryId: cat.id } })
    );
  };

  const selectSubcategory = (sub) => {
    setSelectedSubcategory(sub.id);
    setSelectedCategory(sub.category_id);
    window.dispatchEvent(
      new CustomEvent("subcategorySelected", { detail: { subcategoryId: sub.id } })
    );
  };

  const displayCartCount = cartCount > 99 ? "99+" : cartCount;

  const onHomeClick = () => {
    navigate("/beranda");
  };

  // 👇 only show categories/subcategories if on Home page (/ or /beranda)
  const isHomePage = ["/", "/beranda"].includes(location.pathname);

  return (
    <div className="w-100 sticky-top" style={{ zIndex: 1030 }}>
      {/* Top Navbar */}
      <div className="bg-primary text-white">
        <div className="container-fluid py-3 d-flex align-items-center">
          {/* Left menu */}
          <div className="me-3 d-flex align-items-center">
            <AiOutlineMenu size={24} />
          </div>

          {/* Branding */}
          <div
            className="d-flex align-items-center me-4"
            style={{ cursor: "pointer" }}
            onClick={onHomeClick}
          >
            <div
              className="bg-gradient rounded-circle d-flex align-items-center justify-content-center p-2 me-2"
              style={{ background: "linear-gradient(to right, #a78bfa, #f9a8d4)" }}
            >
              <BsLightning className="text-white" />
            </div>
            <span className="fw-bold fs-4">Yofte.</span>
          </div>

          {/* ✅ Home button always visible with logo */}
          <span
            onClick={onHomeClick}
            className="nav-link px-2 py-1 d-flex align-items-center gap-1"
            style={{
              cursor: "pointer",
              color: isHomePage ? "#fff" : "rgba(255,255,255,0.8)",
              fontWeight: "600",
            }}
          >
            <BsLightning size={16} className="me-1" />
            Home
          </span>

          {/* ✅ Categories only on Home page */}
          {isHomePage && (
            <div className="d-flex flex-grow-1 justify-content-center gap-3">
              {categories.map((cat) => (
                <span
                  key={cat.id}
                  onClick={() => selectCategory(cat)}
                  className="nav-link px-2 py-1"
                  style={{
                    cursor: "pointer",
                    color:
                      selectedCategory === cat.id
                        ? "#fff"
                        : "rgba(255,255,255,0.6)",
                    borderBottom:
                      selectedCategory === cat.id
                        ? "2px solid #fff"
                        : "2px solid transparent",
                    fontWeight: selectedCategory === cat.id ? "600" : "400",
                    transition: "all 0.2s",
                  }}
                >
                  {cat.name}
                </span>
              ))}
            </div>
          )}

          {/* Cart & User */}
          <div className="d-flex align-items-center ms-auto gap-3">
            {/* Cart */}
            <div
              className="position-relative"
              style={{ cursor: "pointer" }}
              onClick={handleCartClick}
            >
              <BsBag size={24} />
              {cartCount > 0 && (
                <span
                  className="position-absolute top-0 start-100 translate-middle badge rounded-circle bg-light text-primary p-1"
                  style={{ fontSize: "0.6rem" }}
                >
                  {displayCartCount}
                </span>
              )}
            </div>

            {/* User */}
            {userRole ? (
              <div className="d-flex align-items-center gap-2">
                <BsPerson />
                <span className="fw-semibold">{userRole}</span>
                {userRole === "Admin" && (
                  <button
                    className="btn btn-sm btn-warning ms-2"
                    onClick={() => navigate("/dashboard")}
                  >
                    Dashboard
                  </button>
                )}
                <button
                  className="btn btn-sm btn-light ms-2"
                  onClick={handleLogoutClick}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-1">
                <BsPerson />
                <Link to="/login" className="text-white text-decoration-none">
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ✅ Subcategories only on Home page */}
      {isHomePage && selectedCategory && (
        <div className="bg-light py-2 border-bottom">
          <div className="container-fluid d-flex justify-content-center flex-wrap gap-3">
            {subLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <span
                  key={i}
                  className="placeholder-glow bg-secondary rounded"
                  style={{
                    width: "80px",
                    height: "16px",
                    display: "inline-block",
                    opacity: 0.5,
                  }}
                ></span>
              ))
            ) : (
              subcategories
                .filter((s) => s.category_id === selectedCategory)
                .map((sub) => (
                  <span
                    key={sub.id}
                    onClick={() => selectSubcategory(sub)}
                    style={{
                      cursor: "pointer",
                      color:
                        selectedSubcategory === sub.id
                          ? "#0d6efd"
                          : "rgba(0,0,0,0.6)",
                      borderBottom:
                        selectedSubcategory === sub.id
                          ? "2px solid #0d6efd"
                          : "2px solid transparent",
                      fontWeight:
                        selectedSubcategory === sub.id ? "600" : "400",
                      padding: "2px 4px",
                      transition: "all 0.2s",
                    }}
                  >
                    {sub.name}
                  </span>
                ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
