import React, { useState } from "react";
import axios from "axios";
import "./card.css";

export default function ProductCard({ product }) {
  const [localStock, setLocalStock] = useState(product.stok);
  const [quantity, setQuantity] = useState(1);

  const isOutOfStock = !localStock || localStock <= 0;

  const decreaseQty = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const increaseQty = () => {
    if (quantity < localStock) setQuantity(quantity + 1);
  };

  const handleAddToCart = async () => {
    if (isOutOfStock) {
      alert("Produk ini habis, tidak bisa ditambahkan ke keranjang.");
      return;
    }

    try {
      await axios.post(
        "http://localhost:8000/api/carts",
        { product_id: product.id, qty: quantity },
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
        { product_id: product.id, qty: quantity },
        { headers: { Authorization: "Bearer " + localStorage.getItem("token") } }
      );

      const redirectUrl = response.data.redirect_url;
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        alert("Checkout gagal: redirect_url tidak ditemukan.");
      }
    } catch (err) {
      console.error("Error during checkout:", err.response?.data || err);
      alert("Gagal melakukan checkout.");
    }
  };

  return (
    <div className="col-6 col-md-3 mb-4">
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

          <div className="price-stock-qty">
            <span className="product-price">Rp {product.harga}</span>

            {!isOutOfStock && (
              <div className="stock-qty-row">
                <span className="product-stock">Stok: {localStock}</span>

                <div className="quantity-selector-horizontal">
                  <button className="qty-btn" onClick={decreaseQty}>-</button>
                  <span className="qty-value">{quantity}</span>
                  <button className="qty-btn" onClick={increaseQty}>+</button>
                </div>
              </div>
            )}
          </div>

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
