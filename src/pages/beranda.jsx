// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import api from "../api";
import ProductCard from "../components/card";
import HomeCarousel from "../components/carousel";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);

  // ✅ Fetch products (initial load)
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get("/user-products").catch(() => ({ data: [] }));
      const productsData = Array.isArray(res.data)
        ? res.data
        : res.data.data || [];

      setProducts(productsData.slice(0, 4));
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Gagal memuat produk");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch products filtered by subcategory
  const fetchProductsBySubcategory = async (subcategoryId) => {
    try {
      const res = await api.get("/user-products");
      const productsData = Array.isArray(res.data)
        ? res.data
        : res.data.data || [];

      const filtered = productsData.filter(
        (prod) => prod.subcategory_id === subcategoryId
      );

      setProducts(filtered);
      setSelectedSubcategory(subcategoryId);
    } catch (err) {
      console.error("Error filtering products:", err);
    }
  };

  const handleAddToCart = (product) => {
    window.dispatchEvent(new CustomEvent("cartUpdated", { detail: { increment: 1 } }));
    console.log("Tambah ke keranjang:", product);
  };

  const handleCheckout = (product) => {
    console.log("Checkout produk:", product);
  };

  useEffect(() => {
    fetchProducts();

    // ✅ Listen to Navbar events
    const handleCategory = (e) => {
      setSelectedCategory(e.detail.categoryId);
      setSelectedSubcategory(null);
    };
    const handleSubcategory = (e) => fetchProductsBySubcategory(e.detail.subcategoryId);

    window.addEventListener("categorySelected", handleCategory);
    window.addEventListener("subcategorySelected", handleSubcategory);

    return () => {
      window.removeEventListener("categorySelected", handleCategory);
      window.removeEventListener("subcategorySelected", handleSubcategory);
    };
  }, []);

  return (
    <>
      <HomeCarousel />

      <div className="container py-4">
        <h3 className="fw-bold mb-4 text-center">Belanja Sekarang</h3>

        <div className="row g-4">
          {loading ? (
            <p className="text-center">Memuat produk...</p>
          ) : error ? (
            <p className="text-center text-danger">{error}</p>
          ) : products.length === 0 ? (
            <p className="text-center text-muted">Tidak ada produk</p>
          ) : (
            products.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onAddToCart={handleAddToCart}
                onCheckout={handleCheckout}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}
