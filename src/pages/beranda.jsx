// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import api from "../api";
import ProductCard from "../components/card";
import HomeCarousel from "../components/carousel";

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);

  // Fetch main data (categories + initial products)
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [catRes, prodRes, subRes] = await Promise.all([
        api.get("/user-login-categories"),
        api.get("/user-products").catch(() => ({ data: [] })),
        api.get("/user-login-subcategories"),
      ]);

      setCategories(catRes.data || []);
      setSubcategories(subRes.data || []);

      const productsData = Array.isArray(prodRes.data)
        ? prodRes.data
        : prodRes.data.data || [];

      setProducts(productsData.slice(0, 4)); // initial display
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubcategories = async (categoryId) => {
    try {
      const filtered = subcategories.filter((sub) => sub.category_id === categoryId);
      setSelectedCategory(categoryId);
      setSelectedSubcategory(null); // reset subcategory saat ganti kategori
      setSubcategories(filtered);
    } catch (err) {
      console.error("Error filtering subcategories:", err);
    }
  };

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
    // Dispatch event to Navbar to update cart count instantly
    window.dispatchEvent(new CustomEvent("cartUpdated", { detail: { increment: 1 } }));
    console.log("Tambah ke keranjang:", product);
  };

  const handleCheckout = (product) => {
    console.log("Checkout produk:", product);
  };

  useEffect(() => {
    fetchData();

    const handleCategory = (e) => fetchSubcategories(e.detail.categoryId);
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
      {/* Carousel */}
      <HomeCarousel />

      {/* Kategori & Subkategori */}
      <div className="container py-4">
        <h3 className="fw-bold mb-4 text-center">Belanja Sekarang</h3>

        {/* Products */}
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
