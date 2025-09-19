// src/CartPage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]); // flattened cart items
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper: merge duplicate products across carts
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
    try {
      const token = localStorage.getItem("token");

      const [cartsRes] = await Promise.all([
        axios.get("http://localhost:8000/api/carts", {
          headers: { Authorization: "Bearer " + token },
        }),
      ]);

      const mergedItems = mergeCartItems(cartsRes.data || []);
      setCartItems(mergedItems);
    } catch (err) {
      console.error("API error:", err.response?.data || err);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCarts();
  }, []);

  const removeProduct = async (cartId, productId) => {
    try {
      await axios.put(
        `http://localhost:8000/api/carts/${cartId}`,
        { product_id: productId, qty: 0 },
        {
          headers: { Authorization: "Bearer " + localStorage.getItem("token") },
        }
      );
      await refreshCarts();
    } catch (err) {
      console.error("Error removing product:", err.response?.data || err);
    }
  };

  const updateQuantity = async (cartId, productId, newQty) => {
    try {
      if (newQty < 1) {
        await removeProduct(cartId, productId);
        return;
      }

      await axios.put(
        `http://localhost:8000/api/carts/${cartId}`,
        { product_id: productId, qty: newQty },
        {
          headers: { Authorization: "Bearer " + localStorage.getItem("token") },
        }
      );

      await refreshCarts();
    } catch (err) {
      console.error("Error updating quantity:", err.response?.data || err);
    }
  };

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  if (loading) return <p className="text-center mt-5">Loading cart...</p>;

  return (
    <div className="container my-5">
      <h1 className="mb-4">Shopping Cart</h1>

      <div className="row">
        <div className="col-md-8">
          {cartItems.length > 0 ? (
            cartItems.map((item) => (
              <div
                key={item.product_id}
                className="card shadow-sm mb-3 p-3 d-flex flex-row align-items-center justify-content-between"
              >
                <div className="d-flex align-items-center gap-3">
                  <img
                    src={item.product.image_url || "/contoh.png"}
                    alt={item.product.nama}
                    className="rounded"
                    width="80"
                    height="80"
                  />
                  <div>
                    <h5 className="mb-1">{item.product.nama}</h5>
                    <p className="text-muted mb-0">Rp {item.price}</p>
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

                <p className="fw-bold mb-0">Rp {item.price * item.qty}</p>
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
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal</span>
                <span>Rp {totalPrice}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Shipping</span>
                <span>Rp 20000</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between fw-bold">
                <span>Total</span>
                <span>Rp {totalPrice + 20000}</span>
              </div>
              <button className="btn btn-primary w-100 mt-3">
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
