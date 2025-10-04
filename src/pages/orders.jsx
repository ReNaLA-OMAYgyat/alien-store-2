import React, { useState } from "react";
import Sidebar from "../components/Admin/sidebar";
import { Modal, Button } from "react-bootstrap";
import "../pages/layoutadmin.css";

export default function Orders() {
  const [orders, setOrders] = useState([
    { id: "ORD001", customer: "Budi Santoso", product: "Laptop ASUS", total: 8500000, status: "Pending", date: "2025-10-04" },
    { id: "ORD002", customer: "Siti Aminah", product: "iPhone 15", total: 15500000, status: "Completed", date: "2025-10-01" },
    { id: "ORD003", customer: "Andi Wijaya", product: "Headset Logitech", total: 750000, status: "Cancelled", date: "2025-09-28" },
    { id: "ORD004", customer: "Rina Marlina", product: "Monitor LG", total: 2500000, status: "Pending", date: "2025-09-29" },
    { id: "ORD005", customer: "Fajar Hidayat", product: "Keyboard Razer", total: 1200000, status: "Completed", date: "2025-09-25" },
  ]);

  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Filter dan Search
  const filteredOrders = orders.filter((order) => {
    const matchFilter = filter === "All" || order.status === filter;
    const matchSearch =
      order.customer.toLowerCase().includes(search.toLowerCase()) ||
      order.id.toLowerCase().includes(search.toLowerCase());
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
            <table className="table table-hover">
              <thead className="table-dark">
                <tr>
                  <th>ID Order</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, index) => (
                  <tr key={index}>
                    <td>{order.id}</td>
                    <td>{order.customer}</td>
                    <td>{order.product}</td>
                    <td>Rp {order.total.toLocaleString()}</td>
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

            {filteredOrders.length === 0 && (
              <p className="text-center text-muted">Tidak ada data</p>
            )}
          </div>
        </div>

        {/* Modal Detail */}
        <Modal
          show={!!selectedOrder}
          onHide={() => setSelectedOrder(null)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Detail Order</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedOrder && (
              <>
                <p><strong>ID Order:</strong> {selectedOrder.id}</p>
                <p><strong>Customer:</strong> {selectedOrder.customer}</p>
                <p><strong>Produk:</strong> {selectedOrder.product}</p>
                <p><strong>Total:</strong> Rp {selectedOrder.total.toLocaleString()}</p>
                <p><strong>Status:</strong> {selectedOrder.status}</p>
                <p><strong>Date:</strong> {selectedOrder.date}</p>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setSelectedOrder(null)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}
