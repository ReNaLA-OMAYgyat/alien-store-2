import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Sidebar from "../components/sidebar";

export default function Orders() {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filter, setFilter] = useState("Semua");
  const [search, setSearch] = useState("");

  const orders = [
    {
      id: "ORD-001",
      customer: "Budi Santoso",
      date: "2025-09-15",
      status: "Selesai",
      total: 250000,
      payment: "Transfer Bank",
      address: "Jl. Merdeka No.10, Jakarta",
      items: [
        { name: "Laptop Alien", qty: 1, price: 200000 },
        { name: "Mouse Gaming", qty: 2, price: 25000 },
      ],
    },
    {
      id: "ORD-002",
      customer: "Siti Aisyah",
      date: "2025-09-16",
      status: "Diproses",
      total: 175000,
      payment: "COD",
      address: "Jl. Mawar No.5, Bandung",
      items: [{ name: "Keyboard Mechanical", qty: 1, price: 175000 }],
    },
    {
      id: "ORD-003",
      customer: "Andi Wijaya",
      date: "2025-09-17",
      status: "Dibatalkan",
      total: 0,
      payment: "-",
      address: "Jl. Kenanga No.8, Surabaya",
      items: [],
    },
  ];

  // Filter & search
  const filteredOrders = orders.filter((order) => {
    return (
      (filter === "Semua" || order.status === filter) &&
      (order.customer.toLowerCase().includes(search.toLowerCase()) ||
        order.id.toLowerCase().includes(search.toLowerCase()))
    );
  });

  return (
    <div className="d-flex">
      <Sidebar />

      <div className="container-fluid mt-4" style={{ marginLeft: "250px" }}>
        <h2 className="mb-4">Daftar Pesanan</h2>

        {/* Filter & Search */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <select
              className="form-select"
              style={{ width: "200px" }}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="Semua">Semua</option>
              <option value="Selesai">Selesai</option>
              <option value="Diproses">Diproses</option>
              <option value="Dibatalkan">Dibatalkan</option>
            </select>
          </div>
          <div>
            <input
              type="text"
              className="form-control"
              placeholder="Cari ID / Nama"
              style={{ width: "250px" }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table Orders */}
        <div className="card shadow-sm rounded-3">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-striped table-hover align-middle">
                <thead className="table-dark">
                  <tr>
                    <th>ID Pesanan</th>
                    <th>Nama Pelanggan</th>
                    <th>Tanggal</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order, index) => (
                      <tr key={index}>
                        <td>{order.id}</td>
                        <td>{order.customer}</td>
                        <td>{order.date}</td>
                        <td>
                          <span
                            className={`badge ${
                              order.status === "Selesai"
                                ? "bg-success"
                                : order.status === "Diproses"
                                ? "bg-warning text-dark"
                                : "bg-danger"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td>Rp {order.total.toLocaleString()}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-primary me-2"
                            onClick={() => setSelectedOrder(order)}
                          >
                            Detail
                          </button>
                          <button className="btn btn-sm btn-danger">
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center text-muted">
                        Tidak ada pesanan ditemukan
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Detail Pesanan */}
        {selectedOrder && (
          <div
            className="modal fade show"
            style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5>Detail Pesanan - {selectedOrder.id}</h5>
                  <button
                    className="btn-close"
                    onClick={() => setSelectedOrder(null)}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>
                    <strong>Pelanggan:</strong> {selectedOrder.customer}
                  </p>
                  <p>
                    <strong>Tanggal:</strong> {selectedOrder.date}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      className={`badge ${
                        selectedOrder.status === "Selesai"
                          ? "bg-success"
                          : selectedOrder.status === "Diproses"
                          ? "bg-warning text-dark"
                          : "bg-danger"
                      }`}
                    >
                      {selectedOrder.status}
                    </span>
                  </p>
                  <p>
                    <strong>Metode Bayar:</strong> {selectedOrder.payment}
                  </p>
                  <p>
                    <strong>Alamat:</strong> {selectedOrder.address}
                  </p>

                  <h6 className="mt-4">Produk Dipesan:</h6>
                  <table className="table table-bordered">
                    <thead className="table-light">
                      <tr>
                        <th>Nama Produk</th>
                        <th>Qty</th>
                        <th>Harga</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.length > 0 ? (
                        selectedOrder.items.map((item, idx) => (
                          <tr key={idx}>
                            <td>{item.name}</td>
                            <td>{item.qty}</td>
                            <td>Rp {item.price.toLocaleString()}</td>
                            <td>
                              Rp {(item.qty * item.price).toLocaleString()}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="text-center text-muted">
                            Tidak ada produk
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  <div className="text-end fw-bold">
                    Total: Rp {selectedOrder.total.toLocaleString()}
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setSelectedOrder(null)}
                  >
                    Tutup
                  </button>
                  <button className="btn btn-success">Cetak Invoice</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
