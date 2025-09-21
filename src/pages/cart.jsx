// src/CartPage.jsx
import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function CartPage() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Merge duplicate products across carts
  const mergeCartItems = (carts) => {
    const merged = {};
    carts.forEach((cart) => {
      cart.items.forEach((item) => {
        if (merged[item.product_id]) {
          merged[item.product_id].qty += item.qty;
        } else {
          merged[item.product_id] = { ...item, cartId: cart.id };
        }
      });
    });
    return Object.values(merged);
  };

  const refreshCarts = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await api.get("/carts");
      const mergedItems = mergeCartItems(res.data || []);
      setCartItems(mergedItems);
    } catch (err) {
      console.error("API error:", err.response?.data || err);
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        setCartItems([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCarts();
  }, []);

  // ✅ Frontend-only select/deselect item
  const toggleSelectItem = (productId) => {
    if (selectedItems.includes(productId)) {
      setSelectedItems(selectedItems.filter((id) => id !== productId));
    } else {
      setSelectedItems([...selectedItems, productId]);
    }
  };

  // ✅ Frontend-only select all
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
      setSelectAll(false);
    } else {
      setSelectedItems(cartItems.map((item) => item.product_id));
      setSelectAll(true);
    }
  };

  // Remove product from cart (still API call)
  const removeProduct = async (cartId, productId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      await api.delete(`/carts/${cartId}`, {
        data: { product_id: productId },
      });
      await refreshCarts();
    } catch (err) {
      console.error("Error removing product:", err.response?.data || err);
    }
  };

  // Update quantity (still API call)
  const updateQuantity = async (cartId, productId, newQty) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      if (newQty < 1) {
        await removeProduct(cartId, productId);
        return;
      }

      await api.put(`/carts/${cartId}`, { product_id: productId, qty: newQty });
      await refreshCarts();
    } catch (err) {
      console.error("Error updating quantity:", err.response?.data || err);
    }
  };

  // ✅ Checkout logic (only here we call backend)
  const handleCheckout = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      let payload = {};

      if (selectAll) {
        const cartId = cartItems[0]?.cartId;
        if (!cartId) {
          alert("Tidak ada cart untuk checkout.");
          return;
        }
        payload = { cart_id: cartId };
      } else if (selectedItems.length === 1) {
        const product = cartItems.find(
          (item) => item.product_id === selectedItems[0]
        );
        payload = {
          product_id: product.product_id,
          qty: product.qty,
        };
      } else {
        alert(
          "Checkout produk langsung hanya bisa 1 item. Untuk lebih dari 1, gunakan Select All."
        );
        return;
      }

      const res = await api.post("/transaksi", payload);

      if (res.data.redirect_url) {
        window.location.href = res.data.redirect_url;
      } else {
        alert("Checkout gagal: redirect_url tidak ditemukan.");
      }
    } catch (err) {
      console.error("Error during checkout:", err.response?.data || err);
      alert(err.response?.data?.message || "Checkout gagal");
    }
  };

  // Selected products
  const selectedProducts = cartItems.filter((item) =>
    selectedItems.includes(item.product_id)
  );

  const totalPrice = selectedProducts.reduce(
    (sum, item) => sum + (item.product?.harga || 0) * item.qty,
    0
  );

  if (loading) return <p className="text-center mt-5">Loading cart...</p>;

  return (
    <div className="container my-5">
      <h1 className="mb-4">Shopping Cart</h1>

      {/* Select All */}
      <div className="mb-3 d-flex align-items-center">
        <input
          type="checkbox"
          checked={selectAll}
          onChange={toggleSelectAll}
          className="form-check-input me-2"
        />
        <label className="form-check-label">Select All</label>
      </div>

      <div className="row">
        <div className="col-md-8">
          {cartItems.length > 0 ? (
            cartItems.map((item) => (
              <div
                key={item.product_id}
                className="card shadow-sm mb-3 p-3 d-flex flex-row align-items-center justify-content-between"
              >
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.product_id)}
                  onChange={() => toggleSelectItem(item.product_id)}
                  className="form-check-input me-3"
                />

                <div className="d-flex align-items-center gap-3 flex-grow-1">
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      overflow: "hidden",
                      borderRadius: "8px",
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={item.product.image_url || "/contoh.png"}
                      alt={item.product.nama}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                  <div>
                    <h5 className="mb-1">{item.product.nama}</h5>
                    <p className="text-muted mb-0">Rp {item.product.harga}</p>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() =>
                      updateQuantity(item.cartId, item.product_id, item.qty - 1)
                    }
                  >
                    -
                  </button>
                  <span>{item.qty}</span>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() =>
                      updateQuantity(item.cartId, item.product_id, item.qty + 1)
                    }
                  >
                    +
                  </button>

                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => removeProduct(item.cartId, item.product_id)}
                  >
                    Remove
                  </button>
                </div>

                <p className="fw-bold mb-0 text-nowrap">
                  Rp {item.product.harga * item.qty}
                </p>
              </div>
            ))
          ) : (
            <p className="text-muted">Your cart is empty.</p>
          )}
        </div>

        {/* Order summary */}
        <div className="col-md-4 mt-4 mt-md-0">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Order Summary</h5>

              {selectedProducts.length > 0 ? (
                <>
                  {selectedProducts.map((item) => (
                    <div
                      key={item.product_id}
                      className="d-flex justify-content-between mb-2"
                    >
                      <span>
                        {item.product.nama} × {item.qty}
                      </span>
                      <span>Rp {item.product.harga * item.qty}</span>
                    </div>
                  ))}
                  <hr />
                  <div className="d-flex justify-content-between fw-bold">
                    <span>Total</span>
                    <span>Rp {totalPrice}</span>
                  </div>
                  <button
                    className="btn btn-primary w-100 mt-3"
                    onClick={handleCheckout}
                  >
                    Proceed to Checkout
                  </button>
                </>
              ) : (
                <p className="text-muted">Pilih produk untuk checkout.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
