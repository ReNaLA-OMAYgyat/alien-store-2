// src/pages/Home.jsx
import React, { useEffect, useState, useCallback } from "react";
// Bootstrap CSS/JS loaded via index.html or main.jsx
import api from "../api";
import ProductCard from "../components/Beranda/card";
import HomeCarousel from "../components/Beranda/carousel";
import Footer from "../components/footer"; // 

export default function Home() {
  const [products, setProducts] = useState([]); // displayed list
  const [allProducts, setAllProducts] = useState([]); // full list for filtering
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // selectedCategory tracked but only used in event handlers
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ Fetch products (initial load)
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get("/user-products").catch(() => ({ data: [] }));
      const productsData = Array.isArray(res.data)
        ? res.data
        : res.data.data || [];

      setAllProducts(productsData);
      setProducts(productsData); // tampilkan semua produk saat pertama kali
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Gagal memuat produk");
    } finally {
      setLoading(false);
    }
  };

  // Recompute display list whenever filters/search change
  const applyFilters = useCallback(() => {
    let list = Array.isArray(allProducts) ? [...allProducts] : [];

    if (selectedSubcategory) {
      list = list.filter((prod) => prod.subcategory_id === selectedSubcategory);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.nama?.toLowerCase().includes(q) ||
          p.merk?.toLowerCase().includes(q) ||
          String(p.id).includes(q)
      );
    }

    // Saat tidak ada filter atau pencarian, tampilkan semua produk
    setProducts(list);
  }, [allProducts, selectedSubcategory, searchQuery]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleAddToCart = (product) => {
    window.dispatchEvent(
      new CustomEvent("cartUpdated", { detail: { increment: 1 } })
    );
  };

  const handleCheckout = (product) => {
    // Checkout handled by ProductCard component
  };

  useEffect(() => {
    fetchProducts();

    // ✅ Listen to Navbar events
    const handleCategory = (e) => {
      setSelectedCategory(e.detail.categoryId);
      setSelectedSubcategory(null);
    };
    const handleSubcategory = (e) => {
      setSelectedSubcategory(e.detail.subcategoryId);
    };
    const handleSearch = (e) => {
      setSearchQuery(e.detail?.query || "");
    };

    window.addEventListener("categorySelected", handleCategory);
    window.addEventListener("subcategorySelected", handleSubcategory);
    window.addEventListener("productSearch", handleSearch);

    return () => {
      window.removeEventListener("categorySelected", handleCategory);
      window.removeEventListener("subcategorySelected", handleSubcategory);
      window.removeEventListener("productSearch", handleSearch);
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

      
      <Footer />
    </>
  );
}
