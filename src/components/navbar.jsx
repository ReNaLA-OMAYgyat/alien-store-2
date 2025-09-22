// src/components/Navbar.jsx
import React, { useState, useEffect } from "react";
import { BsLightning, BsPerson, BsBag, BsSearch } from "react-icons/bs";
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai";
import { useNavigate, useLocation, Link } from "react-router-dom";
import api from "../api";

// ✅ Pre-placed fallback categories (in case API unavailable)
const fallbackCategories = [
  { id: 1, name: "Fashion" },
  { id: 2, name: "F&B" },
  { id: 3, name: "Sembako" },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation(); // 👈 detect current page

  const [userRole, setUserRole] = useState(localStorage.getItem("role") || null);
  const [cartCount, setCartCount] = useState(0);
  const [categories, setCategories] = useState(fallbackCategories);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [subLoading, setSubLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showMobileCategoryMenu, setShowMobileCategoryMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(false);

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

const fetchTaxonomies = async () => {
    // Load subcategories (try user-specific then public)
    try {
      setSubLoading(true);
      let subRes;
      try {
        subRes = await api.get("/user-login-subcategories");
      } catch (e) {
        // fallback if route is not available or unauthorized
        subRes = await api.get("/subcategories");
      }
      setSubcategories(Array.isArray(subRes.data) ? subRes.data : subRes.data?.data || []);
    } catch (err) {
      console.error("Error fetching subcategories:", err);
      setSubcategories([]);
    } finally {
      setSubLoading(false);
    }

    // Load categories (try user-specific then public)
    try {
      let catRes;
      try {
        catRes = await api.get("/user-login-categories");
      } catch (e) {
        catRes = await api.get("/categories");
      }
      const data = Array.isArray(catRes.data) ? catRes.data : catRes.data?.data || [];
      if (data.length) setCategories(data);
    } catch (err) {
      console.warn("Using fallback categories due to error loading categories:", err);
      // keep fallback categories
    }
  };

useEffect(() => {
    fetchTaxonomies();
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

  // prevent body scroll when sidebar open
  useEffect(() => {
    if (isSidebarOpen) document.body.classList.add("as-no-scroll");
    else document.body.classList.remove("as-no-scroll");
    return () => document.body.classList.remove("as-no-scroll");
  }, [isSidebarOpen]);

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);

  const handleLogoutClick = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setUserRole(null);
    setCartCount(0);
    window.dispatchEvent(new Event("userLogout"));
    navigate("/login");
    closeSidebar();
  };

  const handleCartClick = () => {
    if (!localStorage.getItem("token")) navigate("/login");
    else navigate("/cart");
  };

  const selectCategory = (cat) => {
    setSelectedCategory(cat.id);
    setSelectedSubcategory(null);
    setShowMobileCategoryMenu(false);
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
    setShowMobileCategoryMenu(false);
    closeSidebar();
  };

  const onSearchChange = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    window.dispatchEvent(new CustomEvent("productSearch", { detail: { query: q } }));
  };

  // 👇 only show categories/subcategories if on Home page (/ or /beranda)
  const isHomePage = ["/", "/beranda"].includes(location.pathname);

  return (
    <div className="w-100 sticky-top" style={{ zIndex: 1030 }}>
      {/* Top Navbar */}
      <div className="bg-primary text-white">
        <div className="container-fluid py-3 d-flex align-items-center position-relative">
          {/* Left menu - mobile */}
          <button
            className="btn btn-link text-white p-0 me-2 d-inline d-md-none"
            onClick={openSidebar}
            aria-label="Open menu"
          >
            <AiOutlineMenu size={24} />
          </button>

          {/* Branding (desktop only) */}
          <div
            className="d-none d-md-flex align-items-center me-2"
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

          {/* Absolutely centered categories (desktop, home only) */}
          {isHomePage && (
            <div className="position-absolute start-50 translate-middle-x d-none d-md-flex align-items-center gap-3 flex-wrap">
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
                        : "rgba(255,255,255,0.8)",
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

          {/* Desktop search only */}
          <div className="d-none d-md-flex align-items-center ms-auto" style={{ maxWidth: 360 }}>
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-white">
                <BsSearch size={14} />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search products..."
                value={searchQuery}
                onChange={onSearchChange}
              />
            </div>
          </div>

          {/* Mobile main navbar content: Categories centered + Search; Home/Cart moved to sidebar */}
          <div className="d-flex d-md-none align-items-center gap-2 flex-grow-1 ms-2">
            {/* Categories (center) */}
            {isHomePage && (
              <div className="flex-grow-1 d-flex justify-content-center overflow-auto">
                <div className="d-flex flex-nowrap as-cat-row px-2">
                  {categories.map((cat) => (
                    <span
                      key={cat.id}
                      onClick={() => selectCategory(cat)}
                      className="px-2 py-1 rounded as-cat-chip"
                      style={{
                        cursor: "pointer",
                        color:
                          selectedCategory === cat.id
                            ? "#ffffff"
                            : "rgba(255,255,255,0.9)",
                        borderBottom:
                          selectedCategory === cat.id
                            ? "2px solid #ffffff"
                            : "2px solid transparent",
                        fontWeight:
                          selectedCategory === cat.id ? "700" : "500",
                        transition: "all 0.2s",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {cat.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Search (mobile) */}
            <button className="btn btn-link text-white p-0 ms-2" onClick={() => setShowMobileSearch(true)} aria-label="Open search">
              <BsSearch size={20} />
            </button>
          </div>

          {/* Cart & User (desktop only) */}
          <div className="d-none d-md-flex align-items-center ms-3 gap-3">
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

      {/* Mobile Sidebar / Offcanvas */}
      <div
        className={`as-offcanvas ${isSidebarOpen ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Main menu"
      >
        <div className="as-offcanvas-header d-flex align-items-center justify-content-between border-bottom px-3 py-3">
          <div
            className="d-flex align-items-center"
            style={{ cursor: "pointer" }}
            onClick={onHomeClick}
          >
            <div
              className="rounded-circle d-flex align-items-center justify-content-center p-2 me-2"
              style={{ background: "linear-gradient(to right, #a78bfa, #f9a8d4)" }}
            >
              <BsLightning className="text-white" />
            </div>
            <span className="fw-bold">Yofte.</span>
          </div>
          <button className="btn btn-link text-dark p-0" onClick={closeSidebar} aria-label="Close menu">
            <AiOutlineClose size={24} />
          </button>
        </div>
        <div className="as-offcanvas-body p-3 d-flex flex-column gap-3">
          {/* User status */}
          {userRole ? (
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <BsPerson />
                <span className="fw-semibold">Status: {userRole}</span>
              </div>
              <div className="d-flex gap-2">
                {userRole === "Admin" && (
                  <button className="btn btn-warning btn-sm" onClick={() => { navigate("/dashboard"); closeSidebar(); }}>
                    Dashboard
                  </button>
                )}
                <button className="btn btn-outline-danger btn-sm" onClick={handleLogoutClick}>
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <BsPerson />
                <span className="fw-semibold">Guest</span>
              </div>
              <Link to="/login" className="btn btn-primary btn-sm" onClick={closeSidebar}>
                Sign In
              </Link>
            </div>
          )}

          {/* Links */}
          <div className="list-group">
            <button className="list-group-item list-group-item-action d-flex align-items-center justify-content-between" onClick={onHomeClick}>
              <span><i className="bi bi-house me-2"></i> Home</span>
            </button>
            <button className="list-group-item list-group-item-action d-flex align-items-center justify-content-between" onClick={() => { closeSidebar(); handleCartClick(); }}>
              <span><i className="bi bi-bag me-2"></i> Cart</span>
              {cartCount > 0 && (
                <span className="badge bg-primary rounded-pill">{displayCartCount}</span>
              )}
            </button>
          </div>

        </div>
      </div>
      <div className={`as-offcanvas-backdrop ${isSidebarOpen ? "show" : ""}`} onClick={closeSidebar}></div>

      {/* Mobile Search Overlay */}
      {showMobileSearch && (
        <div className="as-search-overlay" onClick={() => setShowMobileSearch(false)}>
          <div className="as-search-card" onClick={(e) => e.stopPropagation()}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <strong>Search products</strong>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setShowMobileSearch(false)} aria-label="Close search">
                <AiOutlineClose />
              </button>
            </div>
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-white">
                <BsSearch size={14} />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search products..."
                value={searchQuery}
                onChange={onSearchChange}
                autoFocus
              />
              {searchQuery && (
                <button className="btn btn-outline-secondary" onClick={() => onSearchChange({ target: { value: "" } })}>
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
