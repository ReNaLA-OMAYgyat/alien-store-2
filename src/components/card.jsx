// src/components/ProductCard.jsx
import React, { useState } from "react";
import axios from "axios";
import "./card.css";

export default function ProductCard({ product }) {
  const [localStock, setLocalStock] = useState(product.stok);
  const isOutOfStock = !localStock || localStock <= 0;

  const handleAddToCart = async () => {
    if (isOutOfStock) {
      alert("Produk ini habis, tidak bisa ditambahkan ke keranjang.");
      return;
    }

    try {
      await axios.post(
        "http://localhost:8000/api/carts",
        { product_id: product.id, qty: 1 },
        { headers: { Authorization: "Bearer " + localStorage.getItem("token") } }
      );

      alert(`${product.nama} berhasil ditambahkan ke keranjang!`);
    } catch (err) {
      console.error("Error adding to cart:", err.response?.data || err);
      alert("Gagal menambahkan produk ke keranjang.");
    }
  };

  const handleCheckout = async () => {
    if (isOutOfStock) {
      alert("Produk habis, tidak bisa dibeli.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8000/api/transaksi",
        { product_id: product.id, qty: 1 }, // ✅ langsung kirim product ke transaksi
        { headers: { Authorization: "Bearer " + localStorage.getItem("token") } }
      );

      const redirectUrl = response.data.redirect_url;
      if (redirectUrl) {
        window.location.href = redirectUrl; // ✅ langsung lempar ke Midtrans checkout
      } else {
        alert("Checkout gagal: redirect_url tidak ditemukan.");
      }
    } catch (err) {
      console.error("Error during checkout:", err.response?.data || err);
      alert("Gagal melakukan checkout.");
    }
  };

  return (
    <div className="col-6 col-md-3">
      <div className={`product-card ${isOutOfStock ? "out-of-stock" : ""}`}>
        <div className="product-img">
          {isOutOfStock && (
            <div className="overlay">
              <span className="badge-soldout">Stok Habis</span>
            </div>
          )}
          <img
            src={product.image_url || "/contoh.png"}
            alt={product.nama}
            className={`img-fluid ${isOutOfStock ? "dimmed" : ""}`}
          />
        </div>
        <div className="product-body">
          <h6 className="product-title">{product.nama}</h6>
          <p className="product-price">Rp {product.harga}</p>
          <p className="product-stock">
            {isOutOfStock ? "Stok Habis" : `Sisa stok: ${localStock}`}
          </p>
          <div className="product-actions">
            <button
              className="btn-cart"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              Keranjang
            </button>
            <button
              className="btn-checkout"
              onClick={handleCheckout}
              disabled={isOutOfStock}
            >
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
