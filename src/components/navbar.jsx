// src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from "react";
import { BsLightning, BsPerson, BsBag, BsSearch } from "react-icons/bs";
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai";
import { useNavigate, useLocation, Link } from "react-router-dom";
import api from "../api";
import brandLogo from "../assets/images/Branding/alienStoreLogo_noBrand.svg";

// ✅ Pre-placed fallback categories (in case API unavailable)
const fallbackCategories = [
  { id: 1, name: "Fashion" },
  { id: 2, name: "F&B" },
  { id: 3, name: "Sembako" },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation(); // 👈 detect current page
  const navbarRef = useRef(null);

  const [userRole, setUserRole] = useState(localStorage.getItem("role") || sessionStorage.getItem("role") || null);
  const [userName, setUserName] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user")) || JSON.parse(sessionStorage.getItem("user"));
      return u?.name || null;
    } catch {
      return null;
    }
  });
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

  // Function to close selected category and subcategory
  const closeSelectedCategory = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
  };

  // Close the category dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        closeSelectedCategory();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
      setUserName(e.detail.user?.name || null);
      if (e.detail.role === "User") fetchCartCount();
    };
    const handleLogout = () => {
      setUserRole(null);
      setUserName(null);
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
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("user");
    setUserRole(null);
    setUserName(null);
    setCartCount(0);
    window.dispatchEvent(new Event("userLogout"));
    navigate("/login");
    closeSidebar();
  };

  const handleCartClick = () => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) navigate("/login");
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
    <div ref={navbarRef} className="w-100 sticky-top" style={{ zIndex: 1030 }}>
      {/* Top Navbar */}
      <div className="bg-primary text-white">
        <div className="container-fluid py-3">
          {/* Desktop Layout - Flexbox for better control */}
          <div 
            className="d-none d-md-flex"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              minHeight: "48px"
            }}
          >
            {/* Left Section: Brand + Categories */}
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "1.5rem",
              flexWrap: "nowrap"
            }}>
              {/* Branding */}
              <div
                className="d-flex align-items-center"
                style={{ cursor: "pointer" }}
                onClick={onHomeClick}
              >
<img src={brandLogo} alt="AlienStore" style={{ height: 80, objectFit: "contain" }} className="me-2" />
                <span className="fw-bold fs-4">AlienStore</span>
              </div>

              {/* Categories beside brand (home only) */}
              {isHomePage && (
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "1rem",
                  flexWrap: "nowrap"
                }}>
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
                        whiteSpace: "nowrap",
                        flexShrink: 0
                      }}
                    >
                      {cat.name}
                    </span>
                  ))}
                </div>
              )
              
              }
            </div>

            {/* Right Section: Search + Cart + About + User - Positioned at far right */}
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "1.5rem"
            }}>
              {/* Search */}
              {isHomePage ? (
              <div style={{ maxWidth: "280px", width: "280px" }}>
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
              ) : ([])}

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

              {/* About Button - Logo only */}
              <Link 
                to="/about" 
                className="text-white text-decoration-none d-flex align-items-center"
                style={{ cursor: "pointer" }}
                title="About"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                </svg>
              </Link>

              {/* User */}
              {userRole ? (
                <div className="d-flex align-items-center gap-2">
                  <BsPerson />
                  <span className="fw-semibold">{userName || "User"}</span>
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

          {/* Mobile Layout - Flexbox for better mobile UX */}
          <div 
            className="d-flex d-md-none"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
              minHeight: "34px"
            }}
          >
            {/* Left: Mobile Menu */}
            <button
              className="btn btn-link text-white p-0"
              onClick={openSidebar}
              aria-label="Open menu"
              style={{ flexShrink: 0 }}
            >
              <AiOutlineMenu size={24} />
            </button>

            {/* Center: Brand + Categories */}
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "0.5rem",
              flex: 1,
              justifyContent: "center",
              overflow: "hidden"
            }}>

              {/* Categories (mobile) */}
              {isHomePage && (
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "0.5rem",
                  overflowX: "auto",
                  flex: 1,
                  justifyContent: "center"
                }}>
                  <div style={{ 
                    display: "flex", 
                    gap: "0.5rem",
                    padding: "0 0.5rem"
                  }}>
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
                        whiteSpace: "nowrap",
                        flexShrink: 0
                      }}
                      >
                        {cat.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Search */}
            <button 
              className="btn btn-link text-white p-0"
              onClick={() => setShowMobileSearch(true)} 
              aria-label="Open search"
              style={{ flexShrink: 0 }}
            >
              <BsSearch size={20} />
            </button>
          </div>
        </div>
      </div>


      {/* ✅ Subcategories only on Home page */}
      {isHomePage && selectedCategory && (
        <div className="bg-light py-2 border-bottom">
          <div className="container-fluid">
            {/* Desktop: Grid for responsive layout */}
            <div 
              className="d-none d-md-flex"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(120px, max-content))",
                justifyContent: "center",
                gap: "1rem"
              }}
            >
              {subLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <span
                    key={i}
                    className="placeholder-glow bg-secondary rounded"
                    style={{
                      width: "100px",
                      height: "20px",
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
                        padding: "4px 8px",
                        transition: "all 0.2s",
                        textAlign: "center",
                      }}
                    >
                      {sub.name}
                    </span>
                  ))
              )}
            </div>

            {/* Mobile: Flexbox for horizontal scrolling */}
            <div 
              className="d-flex d-md-none"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                overflowX: "auto",
                padding: "0 0.5rem"
              }}
            >
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
                      flexShrink: 0
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
                        padding: "4px 8px",
                        transition: "all 0.2s",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                        fontSize: "0.9rem"
                      }}
                    >
                      {sub.name}
                    </span>
                  ))
              )}
            </div>
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
<img src={brandLogo} alt="AlienStore" style={{ height: 80, objectFit: "contain" }} className="me-2" />
            <span className="fw-bold">AlienStore</span>
          </div>
          <button className="btn btn-link text-dark p-0" onClick={closeSidebar} aria-label="Close menu">
            <AiOutlineClose size={24} />
          </button>
        </div>
        <div 
          className="as-offcanvas-body p-3"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
            height: "100%"
          }}
        >
          {/* User status - Grid for better control */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            alignItems: "center",
            gap: "1rem",
            padding: "1rem",
            backgroundColor: "rgba(0,0,0,0.05)",
            borderRadius: "8px"
          }}>
            {userRole ? (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <BsPerson size={20} />
                  <div>
                    <div className="fw-semibold">{userName || "User"}</div>
                    <small className="text-muted">Logged in</small>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {userRole === "Admin" && (
                    <button className="btn btn-warning btn-sm" onClick={() => { navigate("/dashboard"); closeSidebar(); }}>
                      Dashboard
                    </button>
                  )}
                  <button className="btn btn-outline-danger btn-sm" onClick={handleLogoutClick}>
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <BsPerson size={20} />
                  <div>
                    <div className="fw-semibold">Guest User</div>
                    <small className="text-muted">Not logged in</small>
                  </div>
                </div>
                <Link to="/login" className="btn btn-primary btn-sm" onClick={closeSidebar}>
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* Navigation Links - Flexbox for better mobile experience */}
          <div style={{ 
            display: "flex", 
            flexDirection: "column", 
            gap: "0.75rem",
            flex: 1
          }}>
            <button 
              className="btn btn-outline-primary d-flex align-items-center justify-content-between p-3"
              onClick={onHomeClick}
              style={{ borderRadius: "8px", border: "1px solid #dee2e6" }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <i className="bi bi-house"></i>
                <span className="fw-medium">Home</span>
              </span>
              <i className="bi bi-chevron-right text-muted"></i>
            </button>
            
            <Link 
              to="/about" 
              className="btn btn-outline-secondary d-flex align-items-center justify-content-between p-3 text-decoration-none"
              onClick={closeSidebar}
              style={{ borderRadius: "8px", border: "1px solid #dee2e6" }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <i className="bi bi-info-circle"></i>
                <span className="fw-medium">About</span>
              </span>
              <i className="bi bi-chevron-right text-muted"></i>
            </Link>
            
            <button 
              className="btn btn-outline-success d-flex align-items-center justify-content-between p-3"
              onClick={() => { closeSidebar(); handleCartClick(); }}
              style={{ borderRadius: "8px", border: "1px solid #dee2e6" }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <i className="bi bi-bag"></i>
                <span className="fw-medium">Cart</span>
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                {cartCount > 0 && (
                  <span className="badge bg-primary rounded-pill">{displayCartCount}</span>
                )}
                <i className="bi bi-chevron-right text-muted"></i>
              </div>
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
