import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Sidebar from "../components/sidebar";

export default function Customers() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Semua");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const customers = [
    {
      id: "CUST-001",
      name: "Budi Santoso",
      email: "budi@example.com",
      phone: "081234567890",
      address: "Jl. Merdeka No.10, Jakarta",
      status: "Aktif",
      totalOrders: 12,
      totalSpent: 3250000,
      orders: [
        { id: "ORD-001", date: "2025-09-15", total: 250000, status: "Selesai" },
        { id: "ORD-004", date: "2025-09-18", total: 500000, status: "Selesai" },
      ],
    },
    {
      id: "CUST-002",
      name: "Siti Aisyah",
      email: "siti@example.com",
      phone: "089876543210",
      address: "Jl. Mawar No.5, Bandung",
      status: "Aktif",
      totalOrders: 5,
      totalSpent: 1750000,
      orders: [
        { id: "ORD-002", date: "2025-09-16", total: 175000, status: "Diproses" },
      ],
    },
    {
      id: "CUST-003",
      name: "Andi Wijaya",
      email: "andi@example.com",
      phone: "087712345678",
      address: "Jl. Kenanga No.8, Surabaya",
      status: "Non-Aktif",
      totalOrders: 0,
      totalSpent: 0,
      orders: [],
    },
  ];

  // Filter & Search
  const filteredCustomers = customers.filter((cust) => {
    return (
      (filter === "Semua" || cust.status === filter) &&
      (cust.name.toLowerCase().includes(search.toLowerCase()) ||
        cust.email.toLowerCase().includes(search.toLowerCase()) ||
        cust.id.toLowerCase().includes(search.toLowerCase()))
    );
  });

  return (
    <div className="d-flex">
      <Sidebar />

      <div className="container-fluid mt-4" style={{ marginLeft: "250px" }}>
        <h2 className="mb-4">Daftar Pelanggan</h2>

        {/* Statistik Singkat */}
        <div className="row mb-4">
          <div className="col-md-4">
            <div className="card bg-primary text-white shadow-sm">
              <div className="card-body">
                <h5>Total Pelanggan</h5>
                <h3>{customers.length}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card bg-success text-white shadow-sm">
              <div className="card-body">
                <h5>Pelanggan Aktif</h5>
                <h3>
                  {customers.filter((c) => c.status === "Aktif").length}
                </h3>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card bg-secondary text-white shadow-sm">
              <div className="card-body">
                <h5>Pelanggan Non-Aktif</h5>
                <h3>
                  {customers.filter((c) => c.status === "Non-Aktif").length}
                </h3>
              </div>
            </div>
          </div>
        </div>

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
              <option value="Aktif">Aktif</option>
              <option value="Non-Aktif">Non-Aktif</option>
            </select>
          </div>
          <div>
            <input
              type="text"
              className="form-control"
              placeholder="Cari Nama / Email"
              style={{ width: "250px" }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Tabel Customers */}
        <div className="card shadow-sm rounded-3">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-striped table-hover align-middle">
                <thead className="table-dark">
                  <tr>
                    <th>ID</th>
                    <th>Nama</th>
                    <th>Email</th>
                    <th>Telepon</th>
                    <th>Status</th>
                    <th>Total Orders</th>
                    <th>Total Spent</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.map((cust, index) => (
                      <tr key={index}>
                        <td>{cust.id}</td>
                        <td>{cust.name}</td>
                        <td>{cust.email}</td>
                        <td>{cust.phone}</td>
                        <td>
                          <span
                            className={`badge ${
                              cust.status === "Aktif"
                                ? "bg-success"
                                : "bg-secondary"
                            }`}
                          >
                            {cust.status}
                          </span>
                        </td>
                        <td>{cust.totalOrders}</td>
                        <td>Rp {cust.totalSpent.toLocaleString()}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => setSelectedCustomer(cust)}
                          >
                            Detail
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center text-muted">
                        Tidak ada pelanggan ditemukan
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Detail Customer */}
        {selectedCustomer && (
          <div
            className="modal fade show"
            style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5>Detail Pelanggan - {selectedCustomer.name}</h5>
                  <button
                    className="btn-close"
                    onClick={() => setSelectedCustomer(null)}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>
                    <strong>Email:</strong> {selectedCustomer.email}
                  </p>
                  <p>
                    <strong>Telepon:</strong> {selectedCustomer.phone}
                  </p>
                  <p>
                    <strong>Alamat:</strong> {selectedCustomer.address}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      className={`badge ${
                        selectedCustomer.status === "Aktif"
                          ? "bg-success"
                          : "bg-secondary"
                      }`}
                    >
                      {selectedCustomer.status}
                    </span>
                  </p>
                  <p>
                    <strong>Total Orders:</strong> {selectedCustomer.totalOrders}
                  </p>
                  <p>
                    <strong>Total Spent:</strong> Rp{" "}
                    {selectedCustomer.totalSpent.toLocaleString()}
                  </p>

                  <h6 className="mt-4">Riwayat Pesanan:</h6>
                  <table className="table table-bordered">
                    <thead className="table-light">
                      <tr>
                        <th>ID Order</th>
                        <th>Tanggal</th>
                        <th>Total</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCustomer.orders.length > 0 ? (
                        selectedCustomer.orders.map((ord, idx) => (
                          <tr key={idx}>
                            <td>{ord.id}</td>
                            <td>{ord.date}</td>
                            <td>Rp {ord.total.toLocaleString()}</td>
                            <td>
                              <span
                                className={`badge ${
                                  ord.status === "Selesai"
                                    ? "bg-success"
                                    : ord.status === "Diproses"
                                    ? "bg-warning text-dark"
                                    : "bg-danger"
                                }`}
                              >
                                {ord.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="text-center text-muted">
                            Belum ada pesanan
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setSelectedCustomer(null)}
                  >
                    Tutup
                  </button>
                  <button className="btn btn-danger">Blokir Akun</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
