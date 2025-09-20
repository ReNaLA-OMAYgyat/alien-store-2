// src/components/Navbar.jsx
import React, { useState, useEffect } from "react";
import { BsLightning, BsPerson, BsBag } from "react-icons/bs";
import { AiOutlineMenu } from "react-icons/ai";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

export default function Navbar() {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(localStorage.getItem("role") || null);
  const [cartCount, setCartCount] = useState(0);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Fetch cart count
  const getCartItemCount = (carts) => {
    let merged = {};
    carts.forEach(cart =>
      cart.items.forEach(item => {
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

  // Fetch categories and subcategories
  const fetchCategories = async () => {
    try {
      const catRes = await api.get("/user-login-categories");
      const subRes = await api.get("/user-login-subcategories");

      // Deduplicate categories by ID to avoid F&B duplication
      const uniqueCategories = Array.from(
        new Map(catRes.data.map(cat => [cat.id, cat])).values()
      );

      setCategories(uniqueCategories);
      setSubcategories(subRes.data || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
    if (userRole === "User") fetchCartCount();

    const handleLogin = e => {
      setUserRole(e.detail.role);
      if (e.detail.role === "User") fetchCartCount();
    };
    const handleLogout = () => {
      setUserRole(null);
      setCartCount(0);
    };
    const handleCartUpdate = e => {
      if (e.detail?.increment) setCartCount(prev => prev + e.detail.increment);
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

  // Event dispatch for category/subcategory filter
  const selectCategory = (cat) => {
    setSelectedCategory(cat.id);
    window.dispatchEvent(new CustomEvent("categorySelected", { detail: { categoryId: cat.id } }));
  };

  const selectSubcategory = (sub) => {
    window.dispatchEvent(new CustomEvent("subcategorySelected", { detail: { subcategoryId: sub.id } }));
  };

  const displayCartCount = cartCount > 99 ? "99+" : cartCount;

  return (
    <div className="w-100 bg-primary text-white">
      <div className="container-fluid py-3 d-flex align-items-center">
        <div className="me-3 d-flex align-items-center"><AiOutlineMenu size={24} /></div>

        <div className="d-flex align-items-center me-4">
          <div className="bg-gradient rounded-circle d-flex align-items-center justify-content-center p-2 me-2"
               style={{ background: "linear-gradient(to right, #a78bfa, #f9a8d4)" }}>
            <BsLightning className="text-white" />
          </div>
          <span className="fw-bold fs-4">Yofte.</span>
        </div>

        {/* Categories */}
        <div className="d-flex flex-grow-1 justify-content-center gap-2">
          {categories.map(cat => (
            <div key={cat.id} className="position-relative">
              <button
                className={`btn btn-sm ${selectedCategory === cat.id ? "btn-primary" : "btn-outline-light"}`}
                onClick={() => selectCategory(cat)}
              >
                {cat.name}
              </button>

              {/* Subcategories */}
              {selectedCategory === cat.id && subcategories.filter(s => s.category_id === cat.id).length > 0 && (
                <div className="position-absolute bg-white p-2 mt-1 rounded shadow" style={{ zIndex: 10 }}>
                  {subcategories.filter(s => s.category_id === cat.id).map(sub => (
                    <button
                      key={sub.id}
                      className="btn btn-sm btn-outline-secondary m-1"
                      onClick={() => selectSubcategory(sub)}
                    >
                      {sub.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Cart & User */}
        <div className="d-flex align-items-center ms-auto gap-3">
          <div className="position-relative" style={{ cursor: "pointer" }} onClick={handleCartClick}>
            <BsBag size={24} />
            {cartCount > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-circle bg-light text-primary p-1"
                    style={{ fontSize: "0.6rem" }}>{displayCartCount}</span>
            )}
          </div>

          {userRole ? (
            <div className="d-flex align-items-center gap-2">
              <BsPerson />
              <span className="fw-semibold">{userRole}</span>
              {userRole === "Admin" && (
                <button className="btn btn-sm btn-warning ms-2" onClick={() => navigate("/dashboard")}>
                  Dashboard
                </button>
              )}
              <button className="btn btn-sm btn-light ms-2" onClick={handleLogoutClick}>Logout</button>
            </div>
          ) : (
            <div className="d-flex align-items-center gap-1">
              <BsPerson />
              <Link to="/login" className="text-white text-decoration-none">Sign In</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
