import React, { useEffect, useState } from "react";
import Sidebar from "../components/Admin/sidebar.jsx";
import api from "../api";
import "../pages/layoutadmin.css";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Logged-in user info (name, email)
  const [currentUser, setCurrentUser] = useState(null);

  // UX state
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "order_id", direction: "asc" });
  const [density, setDensity] = useState("comfortable");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal detail
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    // load current user from storage
    try {
      const u = JSON.parse(localStorage.getItem("user")) || JSON.parse(sessionStorage.getItem("user"));
      if (u) setCurrentUser(u);
    } catch {}
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/transaksi-admin");

      let payload = [];
      if (Array.isArray(res.data)) {
        payload = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        payload = res.data.data;
      } else if (res.data?.transaksi && Array.isArray(res.data.transaksi)) {
        payload = res.data.transaksi;
      } else if (res.data && typeof res.data === "object") {
        payload = [res.data];
      }

      setOrders(payload);
    } catch (err) {
      console.error("Gagal ambil data transaksi:", err);
      setError("Tidak dapat memuat data transaksi dari server.");
    } finally {
      setLoading(false);
    }
  };

  // Filter & search
  const filteredOrders = orders.filter((order) => {
    const matchFilter =
      filter === "All" || order.status?.toLowerCase() === filter.toLowerCase();
    const matchSearch =
      order.order_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(order.user_id || "").includes(searchQuery);
    return matchFilter && matchSearch;
  });

  // Sorting
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const dir = sortConfig.direction === "asc" ? 1 : -1;
    let aVal = a[sortConfig.key];
    let bVal = b[sortConfig.key];
    if (typeof aVal === "string") aVal = aVal.toLowerCase();
    if (typeof bVal === "string") bVal = bVal.toLowerCase();
    if (aVal < bVal) return -1 * dir;
    if (aVal > bVal) return 1 * dir;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sortedOrders.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const paginatedOrders = sortedOrders.slice(startIdx, startIdx + pageSize);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const handleSort = (key) => {
    setSortConfig((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key)
      return <i className="bi bi-arrow-down-up ms-1 text-secondary"></i>;
    return sortConfig.direction === "asc" ? (
      <i className="bi bi-caret-up-fill ms-1"></i>
    ) : (
      <i className="bi bi-caret-down-fill ms-1"></i>
    );
  };

  return (
    <div className="d-flex vh-100 page-content">
      <Sidebar />

      <div className="flex-grow-1 bg-light p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="fw-bold mb-0">Dashboard Transaksi</h2>
          {currentUser && (
            <div className="text-end" style={{ lineHeight: 1.2 }}>
              <div className="fw-semibold">{currentUser.name}</div>
              <div className="text-secondary small">{currentUser.email}</div>
            </div>
          )}
        </div>

        {/* Filter + Search + Density */}
        <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-2 mb-3">
          <div className="d-flex gap-2">
            <select
              className="form-select form-select-sm"
              style={{ minWidth: 180 }}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="All">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="settlement">Selesai</option>
              <option value="cancel">Dibatalkan</option>
            </select>
          </div>

          <div className="d-flex gap-2 align-items-center">
            <div className="input-group">
              <span className="input-group-text bg-white">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Cari ID order / user"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
              {searchQuery && (
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setSearchQuery("")}
                >
                  Bersihkan
                </button>
              )}
            </div>

            <div className="btn-group" role="group" aria-label="Density">
              <button
                className={`btn btn-sm ${
                  density === "comfortable"
                    ? "btn-primary"
                    : "btn-outline-primary"
                }`}
                onClick={() => setDensity("comfortable")}
              >
                Nyaman
              </button>
              <button
                className={`btn btn-sm ${
                  density === "compact" ? "btn-primary" : "btn-outline-primary"
                }`}
                onClick={() => setDensity("compact")}
              >
                Padat
              </button>
            </div>
          </div>
        </div>

        {/* Tabel Transaksi */}
        <div className="card shadow-sm p-3">
          <div className="text-secondary small mb-2">
            Menampilkan {paginatedOrders.length} dari {sortedOrders.length} hasil
          </div>

          <div className="table-responsive" style={{ maxHeight: 480 }}>
            <table
              className={`table table-bordered ${
                density === "compact" ? "table-sm" : ""
              } table-striped table-hover align-middle mb-0`}
            >
              <thead>
                <tr style={{ position: "sticky", top: 0, background: "#f8f9fa", zIndex: 1 }}>
                  <th role="button" onClick={() => handleSort("order_id")}>
                    ID Order {renderSortIcon("order_id")}
                  </th>
                  <th>User ID</th>
                  <th>Produk ID</th>
                  <th>Jumlah</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Tanggal</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      <div className="spinner-border spinner-border-sm"></div>{" "}
                      Memuat data...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="8" className="text-center text-danger py-4">
                      {error}
                    </td>
                  </tr>
                ) : paginatedOrders.length > 0 ? (
                  paginatedOrders.map((o) => (
                    <tr key={o.order_id}>
                      <td>{o.order_id}</td>
                      <td>{o.user_id}</td>
                      <td>{o.product_id}</td>
                      <td>{o.qty}</td>
                      <td>Rp {Number(o.gross_amount || 0).toLocaleString("id-ID")}</td>
                      <td>
                        <span
                          className={`badge ${
                            o.status === "settlement"
                              ? "bg-success"
                              : o.status === "pending"
                              ? "bg-warning text-dark"
                              : "bg-danger"
                          }`}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td>{new Date(o.created_at).toLocaleString("id-ID")}</td>
                      <td>
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => setSelectedOrder(o)}
                        >
                          <i className="bi bi-card-list"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      Tidak ada transaksi
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mt-3">
            <div className="d-flex align-items-center gap-2">
              <span className="text-secondary small">Tampilan</span>
              <select
                className="form-select form-select-sm"
                style={{ width: 80 }}
                value={pageSize}
                onChange={(e) => {
                  setPageSize(parseInt(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span className="text-secondary small">per halaman</span>
            </div>
            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${safePage === 1 ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    Sebelumnya
                  </button>
                </li>
                {pageNumbers.map((p) => (
                  <li
                    key={p}
                    className={`page-item ${p === safePage ? "active" : ""}`}
                  >
                    <button className="page-link" onClick={() => setCurrentPage(p)}>
                      {p}
                    </button>
                  </li>
                ))}
                <li
                  className={`page-item ${
                    safePage === totalPages ? "disabled" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                  >
                    Berikutnya
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      {/* Modal detail transaksi */}
      {selectedOrder && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 1060 }}
        >
          <div className="bg-white rounded shadow" style={{ width: 460 }}>
            <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
              <h5 className="m-0">Detail Transaksi</h5>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setSelectedOrder(null)}
              >
                ✕
              </button>
            </div>
            <div className="p-3">
              <p><strong>ID Order:</strong> {selectedOrder.order_id}</p>
              <p><strong>User ID:</strong> {selectedOrder.user_id}</p>
              <p><strong>Produk ID:</strong> {selectedOrder.product_id}</p>
              <p><strong>Jumlah:</strong> {selectedOrder.qty}</p>
              <p>
                <strong>Total:</strong> Rp{" "}
                {Number(selectedOrder.gross_amount).toLocaleString("id-ID")}
              </p>
              <p><strong>Status:</strong> {selectedOrder.status}</p>
              <p>
                <strong>Tanggal:</strong>{" "}
                {new Date(selectedOrder.created_at).toLocaleString("id-ID")}
              </p>
            </div>
            <div className="p-3 border-top d-flex justify-content-end">
              <button
                className="btn btn-outline-secondary"
                onClick={() => setSelectedOrder(null)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
