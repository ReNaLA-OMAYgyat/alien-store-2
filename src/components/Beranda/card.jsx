import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api, { createTransaksi } from "../../api";
import "./card.css";

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const [localStock, setLocalStock] = useState(product.stok);
  const [quantity, setQuantity] = useState(1);

  const getToken = () => localStorage.getItem("token") || sessionStorage.getItem("token");

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

    const token = getToken();
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      await api.post("/carts", { product_id: product.id, qty: quantity });
      alert(`${product.nama} berhasil ditambahkan ke keranjang!`);
      // Optionally notify navbar to refresh cart count
      window.dispatchEvent(new CustomEvent("cartUpdated", { detail: { increment: quantity } }));
    } catch (err) {
      console.error("Error adding to cart:", err.response?.data || err);
      if (err.response?.status === 401) navigate("/login");
      else alert("Gagal menambahkan produk ke keranjang.");
    }
  };

  const handleCheckout = async () => {
    if (isOutOfStock) {
      alert("Produk habis, tidak bisa dibeli.");
      return;
    }

    const token = getToken();
    const role = localStorage.getItem("role") || sessionStorage.getItem("role");
    if (!token) {
      navigate("/login");
      return;
    }
    if (role !== "User") {
      alert("Akun Anda tidak memiliki akses untuk checkout. Silakan login sebagai User.");
      navigate("/login");
      return;
    }

    try {
      const response = await createTransaksi({ product_id: product.id, qty: quantity });
      const redirectUrl = response.data.redirect_url;
      if (redirectUrl) {
        window.open(redirectUrl, "_blank");
      } else {
        alert("Checkout gagal: redirect_url tidak ditemukan.");
      }
    } catch (err) {
      console.error("Error during checkout:", err.response?.data || err);
      alert(err.response?.data?.message || "Gagal melakukan checkout.");
    }
  };

  return (
    <div className="col-6 col-sm-6 col-md-4 col-lg-3 mb-4" data-aos="fade-up">
      <motion.div
        className={`product-card ${isOutOfStock ? "out-of-stock" : ""}`}
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.4 }}
      >
        <div className="product-img">
          {isOutOfStock && (
            <div className="overlay">
              <span className="badge-soldout">Stok Habis</span>
            </div>
          )}
          <motion.img
            src={product.image_url || "/contoh.png"}
            alt={product.nama}
            className={`img-fluid ${isOutOfStock ? "dimmed" : ""}`}
            whileHover={{ scale: isOutOfStock ? 1 : 1.03 }}
            transition={{ duration: 0.2 }}
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

          <div className="product-actions d-flex gap-2">
            <motion.button
              className="btn-cart"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              whileTap={{ scale: 0.95 }}
            >
              Keranjang
            </motion.button>
            <motion.button
              className="btn-checkout"
              onClick={handleCheckout}
              disabled={isOutOfStock}
              whileTap={{ scale: 0.95 }}
            >
              Checkout
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
