// Home.jsx
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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [catRes, prodRes] = await Promise.all([
        api.get("/user-categories"),
        api.get("/user-products").catch(() => ({ data: [] })),
      ]);

      setCategories(catRes.data);

      const productsData = Array.isArray(prodRes.data)
        ? prodRes.data
        : prodRes.data.data || [];

      setProducts(productsData.slice(0, 4));
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubcategories = async (categoryId) => {
    try {
      const res = await api.get("/user-subcategories");
      const filtered = res.data.filter((sub) => sub.category_id === categoryId);
      setSubcategories(filtered);
      setSelectedCategory(categoryId);
      setSelectedSubcategory(null); // reset subcategory saat ganti kategori
    } catch (err) {
      console.error("Error fetching subcategories:", err);
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
      console.error("Error fetching products:", err);
    }
  };

  const handleAddToCart = (product) => {
    console.log("Tambah ke keranjang:", product);
  };

  const handleCheckout = (product) => {
    console.log("Checkout produk:", product);
  };

  return (
    <>
      {/* Carousel */}
      <HomeCarousel />

      {/* Kategori & Subkategori */}
      <div className="container py-4">
        <h3 className="fw-bold mb-4 text-center">Belanja Sekarang</h3>

        {/* Categories */}
        <div className="row g-4 mb-4">
          {categories.map((cat) => (
            <div className="col-4" key={cat.id}>
              <button
                className={`btn w-100 ${
                  selectedCategory === cat.id
                    ? "btn-primary"
                    : "btn-outline-primary"
                }`}
                onClick={() => fetchSubcategories(cat.id)}
              >
                {cat.name}
              </button>
            </div>
          ))}
        </div>

        {/* Subcategories */}
        {selectedCategory && (
          <div className="row g-3 mb-4">
            {subcategories.map((sub) => (
              <div className="col-6 col-md-3" key={sub.id}>
                <button
                  className={`btn w-100 ${
                    selectedSubcategory === sub.id
                      ? "btn-success"
                      : "btn-outline-success"
                  }`}
                  onClick={() => fetchProductsBySubcategory(sub.id)}
                >
                  {sub.name}
                </button>
              </div>
            ))}
          </div>
        )}

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
