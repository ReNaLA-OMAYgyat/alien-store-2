// src/components/ProductCard.jsx
import React, { useState } from "react";
import axios from "axios";
import "./card.css";

export default function ProductCard({ product }) {
  const [localStock, setLocalStock] = useState(product.stok);
  const isOutOfStock = !localStock || localStock <= 0;

  const updateStockInDB = async (newStock) => {
    try {
      await axios.put(
        `http://localhost:8000/api/products/${product.id}`,
        { stok: newStock },
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
    } catch (err) {
      console.error("Error updating stock in DB:", err.response?.data || err);
    }
  };

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

      const newStock = localStock - 1;
      setLocalStock(newStock);
      await updateStockInDB(newStock);

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
    await handleAddToCart();
    window.location.href = "/cart";
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
