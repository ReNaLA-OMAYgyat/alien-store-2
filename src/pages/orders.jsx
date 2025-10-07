import React, { useEffect, useState } from "react";
import Sidebar from "../components/Admin/sidebar";
import { Modal, Button } from "react-bootstrap";
import "../pages/layoutadmin.css";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  // ✅ Ambil data transaksi dari localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("transaksiData") || "[]");
    setOrders(saved);
  }, []);

  // 🔍 Filter + Search
  const filteredOrders = orders.filter((order) => {
    const matchFilter =
      filter === "All" || order.status?.toLowerCase() === filter.toLowerCase();
    const matchSearch =
      order.order_id?.toLowerCase().includes(search.toLowerCase()) ||
      order.customer?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="d-flex vh-100 page-content">
      <Sidebar />
      <div className="flex-grow-1 bg-light p-4">
        <h2 className="fw-bold mb-4">Orders</h2>

        {/* Controls */}
        <div className="d-flex justify-content-between mb-3">
          <div>
            <select
              className="form-select"
              style={{ width: "200px" }}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <input
              type="text"
              className="form-control"
              placeholder="Search by ID / Customer"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Orders Table */}
        <div className="card shadow-sm">
          <div className="card-body">
            {filteredOrders.length === 0 ? (
              <p className="text-center text-muted">Belum ada transaksi tersimpan</p>
            ) : (
              <table className="table table-hover">
                <thead className="table-dark">
                  <tr>
                    <th>ID Order</th>
                    <th>Customer</th>
                    <th>Produk</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Tanggal</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order, i) => (
                    <tr key={i}>
                      <td>{order.order_id}</td>
                      <td>{order.customer}</td>
                      <td>{order.product}</td>
                      <td>Rp {Number(order.total).toLocaleString()}</td>
                      <td>
                        <span
                          className={`badge ${
                            order.status === "Completed"
                              ? "bg-success"
                              : order.status === "Pending"
                              ? "bg-warning text-dark"
                              : "bg-danger"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td>{order.date}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => setSelectedOrder(order)}
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Modal Detail */}
        <Modal show={!!selectedOrder} onHide={() => setSelectedOrder(null)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Detail Order</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedOrder && (
              <>
                <p><strong>ID Order:</strong> {selectedOrder.order_id}</p>
                <p><strong>Customer:</strong> {selectedOrder.customer}</p>
                <p><strong>Produk:</strong> {selectedOrder.product}</p>
                <p><strong>Total:</strong> Rp {selectedOrder.total.toLocaleString()}</p>
                <p><strong>Status:</strong> {selectedOrder.status}</p>
                <p><strong>Tanggal:</strong> {selectedOrder.date}</p>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setSelectedOrder(null)}>
              Tutup
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}
