// src/CartPage.jsx
import React, { useEffect, useState } from "react";
import api, { createTransaksi, getPaymentStatus } from "../api";
import { useNavigate } from "react-router-dom";

export default function CartPage() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Read token from either localStorage or sessionStorage
  const getToken = () => localStorage.getItem("token") || sessionStorage.getItem("token");
  const getRole = () => localStorage.getItem("role") || sessionStorage.getItem("role");

  // 🔹 Normalize carts -> single array of items with cartId per item
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

  // 🔹 Fetch carts
  const refreshCarts = async () => {
    const token = getToken();
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await api.get("/carts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const mergedItems = mergeCartItems(res.data || []);
      setCartItems(mergedItems);
    } catch (err) {
      console.error("API error:", err.response?.data || err);
      if (err.response?.status === 401) navigate("/login");
      else setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCarts();
  }, []);

  // ✅ Frontend-only select/deselect
  const toggleSelectItem = (productId) => {
    setSelectedItems((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  // ✅ Select all toggle
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
      setSelectAll(false);
    } else {
      setSelectedItems(cartItems.map((i) => i.product_id));
      setSelectAll(true);
    }
  };

  // 🔹 Remove product (frontend fallback logic)
  const removeProduct = async (cartId, productId) => {
    const token = getToken();
    if (!token) return navigate("/login");

    try {
      // Find the current cart group and its items
      const res = await api.get("/carts", { headers: { Authorization: `Bearer ${token}` } });
      const thisCart = res.data.find((c) => c.id === cartId);

      if (!thisCart) {
        console.warn("Cart not found for removal");
        return;
      }

      const remainingItems = (thisCart.items || []).filter(
        (it) => it.product_id !== productId
      );

      // If no items remain, just delete the cart
      if (remainingItems.length === 0) {
        await api.delete(`/carts/${cartId}`);
        await refreshCarts();
        return;
      }

      // Emulate removing a single item by recreating the cart:
      // 1) Delete the old cart
      await api.delete(`/carts/${cartId}`);

      // 2) Re-add remaining items (backend will regroup by category automatically)
      await Promise.all(
        remainingItems.map((it) =>
          api.post(`/carts`, {
            product_id: it.product_id,
            product_detail_id: it.product_detail_id ?? null,
            qty: it.qty,
          })
        )
      );

      await refreshCarts();
    } catch (err) {
      console.error("Error removing product:", err.response?.data || err);
      alert(
        err.response?.data?.message ||
          "Gagal menghapus item dari cart. Coba lagi."
      );
    }
  };

  // 🔹 Update quantity
  const updateQuantity = async (cartId, productId, newQty) => {
    const token = getToken();
    if (!token) return navigate("/login");

    try {
      if (newQty < 1) {
        // Emulate "remove" via fallback
        await removeProduct(cartId, productId);
        return;
      }

      await api.put(
        `/carts/${cartId}`,
        { product_id: productId, qty: newQty },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await refreshCarts();
    } catch (err) {
      console.error("Error updating quantity:", err.response?.data || err);
    }
  };

  // 🔹 Clear whole cart manually
  const clearCart = async (cartId) => {
    const token = getToken();
    if (!token) return navigate("/login");

    if (!window.confirm("Clear this entire cart?")) return;

    try {
      await api.delete(`/carts/${cartId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await refreshCarts();
    } catch (err) {
      console.error("Error clearing cart:", err.response?.data || err);
    }
  };

  // ✅ Checkout logic (single product only; opens Midtrans and polls backend)
  const handleCheckout = async () => {
    const token = getToken();
    const role = getRole();
    if (!token) return navigate("/login");
    if (role !== "User") {
      alert("Akun Anda tidak memiliki akses untuk checkout. Silakan login sebagai User.");
      return navigate("/login");
    }

    try {
      // Compute selected products and totals locally to avoid TDZ issues
      const selectedProductsLocal = cartItems.filter((i) =>
        selectedItems.includes(i.product_id)
      );
      const totalPriceLocal = selectedProductsLocal.reduce(
        (sum, i) => sum + (i.product?.harga || 0) * i.qty,
        0
      );
      let payload = {};

      if (selectAll) {
        // ❌ Avoid calling cart checkout (DB issue with status column)
        alert("Cart checkout temporarily disabled. Please checkout per product.");
        return;
      } else if (selectedItems.length === 1) {
        // ✅ Single product checkout
        const product = cartItems.find(
          (i) => i.product_id === selectedItems[0]
        );
        if (!product) return alert("Produk tidak ditemukan.");

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

      const res = await createTransaksi(payload);

      const { transaksi, redirect_url } = res.data || {};

      if (!redirect_url || !transaksi?.order_id) {
        alert("Checkout gagal: data transaksi tidak lengkap.");
        return;
      }

      const payWindow = null;
      window.location.assign(redirect_url);

      // Poll backend using existing paymentSuccess endpoint
      const pollStatus = async () => {
        try {
          const statusRes = await getPaymentStatus(transaksi.order_id);
          const status = statusRes.data?.status || statusRes.data?.transaksi?.status;

          if (["settlement", "capture"].includes(status)) {
            // Save a simple record to localStorage for Orders page
            const saved = JSON.parse(localStorage.getItem("transaksiData") || "[]");
            const newRecord = {
              order_id: transaksi.order_id,
              customer: "You",
              product: selectedProductsLocal.map((i) => i.product.nama).join(", "),
              total: totalPriceLocal,
              status: "Completed",
              date: new Date().toLocaleString(),
            };
            localStorage.setItem("transaksiData", JSON.stringify([newRecord, ...saved]));

            if (payWindow && !payWindow.closed) payWindow.close();
            alert("Pembayaran berhasil!");
            await refreshCarts();
            return true;
          }

          if (["deny", "cancel", "expire"].includes(status)) {
            if (payWindow && !payWindow.closed) payWindow.close();
            alert(`Pembayaran gagal: ${status}`);
            return true;
          }

          return false;
        } catch (e) {
          // Keep polling on transient errors
          return false;
        }
      };

      // Poll every 3s up to 3 minutes
      const start = Date.now();
      const interval = setInterval(async () => {
        const done = await pollStatus();
        if (done || Date.now() - start > 180000) {
          clearInterval(interval);
        }
      }, 3000);
    } catch (err) {
      console.error("Error during checkout:", err.response?.data || err);
      alert(err.response?.data?.message || "Checkout gagal");
    }
  };

  const selectedProducts = cartItems.filter((i) =>
    selectedItems.includes(i.product_id)
  );

  const totalPrice = selectedProducts.reduce(
    (sum, i) => sum + (i.product?.harga || 0) * i.qty,
    0
  );

  if (loading) return <p className="text-center mt-5">Loading cart...</p>;

  return (
    <div className="container-fluid px-2 px-md-4 py-3" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      {/* Mobile Header */}
      <div className="d-lg-none mb-2">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <div>
            <h3 className="mb-0 fw-bold text-dark">Shopping Cart</h3>
            <p className="text-muted mb-0 small">Review your items</p>
          </div>
          <span className="badge bg-primary px-2 py-1">
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {/* Mobile Select All */}
        <div className="card border-0 shadow-sm">
          <div className="card-body py-2">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={toggleSelectAll}
                  className="form-check-input me-2"
                  id="selectAll"
                  style={{ transform: "scale(1.1)" }}
                />
                <label className="form-check-label fw-semibold small" htmlFor="selectAll">
                  Select All
                </label>
              </div>
              <div className="text-muted small">
                {selectedItems.length}/{cartItems.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="d-none d-lg-block">
        <div className="row">
          <div className="col-12">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <div>
                <h1 className="mb-1 fw-bold text-dark">Shopping Cart</h1>
                <p className="text-muted mb-0">Review your items and proceed to checkout</p>
              </div>
              <div className="d-flex align-items-center gap-3">
                <span className="badge bg-primary fs-6 px-3 py-2">
                  {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                </span>
              </div>
            </div>

            {/* Select All */}
            <div className="mb-4">
              <div className="card border-0 shadow-sm">
                <div className="card-body py-3">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={toggleSelectAll}
                        className="form-check-input me-3"
                        id="selectAllDesktop"
                        style={{ transform: "scale(1.2)" }}
                      />
                      <label className="form-check-label fw-semibold" htmlFor="selectAllDesktop">
                        Select All Items
                      </label>
                    </div>
                    <div className="text-muted small">
                      {selectedItems.length} of {cartItems.length} selected
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Cart Items - Responsive column */}
        <div className="col-12 col-lg-8">
          {cartItems.length > 0 ? (
            <div className="row g-3">
              {cartItems.map((item) => (
                <div key={item.product_id} className="col-12">
                  <div className="card shadow-sm h-100">
                    <div className="card-body p-3">
                      {/* Mobile Layout */}
                      <div className="d-lg-none">
                        <div className="d-flex align-items-start mb-3">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.product_id)}
                            onChange={() => toggleSelectItem(item.product_id)}
                            className="form-check-input me-3 mt-1"
                            style={{ transform: "scale(1.1)" }}
                          />
                          <div className="flex-grow-1 position-relative">
                            {/* Amount badge at top right */}
                            <span className="badge bg-primary text-white position-absolute top-0 end-0" style={{ zIndex: 1 }}>
                              Amount: {item.qty}
                            </span>
                            
                            <div className="d-flex align-items-center gap-3 mb-2">
                              <img
                                src={item.product.image_url || "/contoh.png"}
                                alt={item.product.nama}
                                className="rounded"
                                style={{
                                  width: "60px",
                                  height: "60px",
                                  objectFit: "cover",
                                  flexShrink: 0
                                }}
                              />
                              <div className="flex-grow-1">
                                <h6 className="mb-1 fw-bold text-dark">{item.product.nama}</h6>
                                <p className="text-muted mb-0 small">
                                  Rp {item.product.harga.toLocaleString()}
                                </p>
                              </div>
                            </div>
                            
                            <div className="d-flex align-items-center justify-content-end gap-2">
                              <div className="fw-bold text-primary">
                                Rp {(item.product.harga * item.qty).toLocaleString()}
                              </div>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => removeProduct(item.cartId, item.product_id)}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Desktop Layout */}
                      <div className="d-none d-lg-flex align-items-center">
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
                            <p className="text-muted mb-0">
                              Rp {item.product.harga.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="d-flex align-items-center gap-3">
                          <span className="badge bg-light text-dark px-3 py-2">
                            Amount: {item.qty}
                          </span>

                          <div className="fw-bold text-primary">
                            Rp {(item.product.harga * item.qty).toLocaleString()}
                          </div>

                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => removeProduct(item.cartId, item.product_id)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <div className="mb-3">
                <i className="bi bi-cart-x" style={{ fontSize: "4rem", color: "#6c757d" }}></i>
              </div>
              <h4 className="text-muted">Your cart is empty</h4>
              <p className="text-muted">Add some products to get started!</p>
            </div>
          )}
        </div>

        {/* Order Summary - Mobile & Desktop */}
        <div className="col-12 col-lg-4">
          {/* Mobile Order Summary - Fixed at bottom */}
          <div className="d-lg-none">
            <div className="position-fixed bottom-0 start-0 end-0 bg-white border-top shadow" style={{ zIndex: 1000 }}>
              <div className="container-fluid p-2">
                {selectedProducts.length > 0 ? (
                  <>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <div className="fw-bold small">Total ({selectedProducts.length} items)</div>
                        <div className="fs-5 fw-bold text-primary">
                          Rp {totalPrice.toLocaleString()}
                        </div>
                      </div>
                      <button
                        className="btn btn-primary px-3"
                        onClick={handleCheckout}
                      >
                        <i className="bi bi-credit-card me-1"></i>
                        Checkout
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-1">
                    <p className="text-muted mb-0 small">Select items to checkout</p>
                  </div>
                )}
              </div>
            </div>
            {/* Spacer to prevent content from being hidden behind fixed summary */}
            <div style={{ height: "70px" }}></div>
          </div>

          {/* Desktop Order Summary */}
          <div className="d-none d-lg-block">
            <div className="sticky-top" style={{ top: "1rem" }}>
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title d-flex align-items-center">
                    <i className="bi bi-receipt me-2"></i>
                    Order Summary
                  </h5>

                  {selectedProducts.length > 0 ? (
                    <>
                      <div className="mb-3">
                        {selectedProducts.map((item) => (
                          <div
                            key={item.product_id}
                            className="d-flex justify-content-between mb-2 small"
                          >
                            <span className="text-truncate me-2">
                              {item.product.nama} × {item.qty}
                            </span>
                            <span className="text-nowrap">
                              Rp {(item.product.harga * item.qty).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                      <hr />
                      <div className="d-flex justify-content-between fw-bold mb-3">
                        <span>Total</span>
                        <span>Rp {totalPrice.toLocaleString()}</span>
                      </div>
                      <button
                        className="btn btn-primary w-100"
                        onClick={handleCheckout}
                      >
                        <i className="bi bi-credit-card me-2"></i>
                        Proceed to Checkout
                      </button>
                    </>
                  ) : (
                    <div className="text-center py-3">
                      <i className="bi bi-cart-check text-muted" style={{ fontSize: "2rem" }}></i>
                      <p className="text-muted mt-2 mb-0">Select products to checkout</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
