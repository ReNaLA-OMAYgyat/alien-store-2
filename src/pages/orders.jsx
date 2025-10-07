import React, { useEffect, useState } from "react";
import Sidebar from "../components/Admin/sidebar";
import api from "../api";
import { Modal, Button } from "react-bootstrap";
import "../pages/layoutadmin.css";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Ambil data dari API /transaksi-admin (index pada apiResource)
 useEffect(() => {
  let mounted = true;

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/transaksi-admin");

      console.log("Response full dari API:", res);
      console.log("Isi lengkap res.data:", JSON.stringify(res.data, null, 2));

      // 💡 Ambil data dari object (bisa dari key data / transaksi)
      let payload = [];

      if (Array.isArray(res.data)) {
        // Jika langsung array
        payload = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        // Jika data ada di key "data"
        payload = res.data.data;
      } else if (res.data?.transaksi && Array.isArray(res.data.transaksi)) {
        // Jika data ada di key "transaksi"
        payload = res.data.transaksi;
      } else if (res.data && typeof res.data === "object") {
        // Jika hanya object tunggal (1 transaksi)
        payload = [res.data];
      } else {
        console.warn("Format data tidak dikenali:", res.data);
      }

      if (mounted) setOrders(payload);
    } catch (err) {
      const status = err.response?.status;
      const data = err.response?.data;
      console.error("Gagal ambil data transaksi (GET):", err.response || err);

      if (err.response && err.response.data) {
        try {
          const text = JSON.stringify(err.response.data, null, 2);
          console.error("Response body:", text);
        } catch (e) {
          console.error("Response body (non-JSON):", err.response.data);
        }
      }

      setError(
        `Gagal memuat transaksi dari server. Status: ${status || "-"}. ${
          data?.message ? data.message : ""
        }`
      );
    } finally {
      if (mounted) setLoading(false);
    }
  };

  load();
  return () => {
    mounted = false;
  };
}, []);


  // Filter + Search
  const filteredOrders = orders.filter((order) => {
    const matchFilter =
      filter === "All" || order.status?.toLowerCase() === filter.toLowerCase();
    const matchSearch =
      order.order_id?.toLowerCase().includes(search.toLowerCase()) ||
      order.user_id?.toString().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="d-flex vh-100 page-content">
      <Sidebar />
      <div className="flex-grow-1 bg-light p-4">
        <h2 className="fw-bold mb-4">Orders</h2>

        {/* Filter dan Search */}
        <div className="d-flex justify-content-between mb-3">
          <div>
            <select
              className="form-select"
              style={{ width: "200px" }}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="All">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="settlement">Completed</option>
              <option value="cancel">Cancelled</option>
            </select>
          </div>
          <div>
            <input
              type="text"
              className="form-control"
              placeholder="Cari ID order / user"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Tabel Orders */}
        <div className="card shadow-sm">
          <div className="card-body">
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border"></div> Memuat transaksi...
              </div>
            ) : error ? (
              <p className="text-danger text-center">{error}</p>
            ) : filteredOrders.length === 0 ? (
              <p className="text-center text-muted">
                Belum ada transaksi tersimpan
              </p>
            ) : (
              <table className="table table-hover align-middle">
                <thead className="table-dark">
                  <tr>
                    <th>ID Order</th>
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
                  {filteredOrders.map((order, i) => (
                    <tr key={i}>
                      <td>{order.order_id}</td>
                      <td>{order.user_id}</td>
                      <td>{order.product_id}</td>
                      <td>{order.qty}</td>
                      <td>
                        Rp{" "}
                        {Number(order.gross_amount || 0).toLocaleString("id-ID")}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            order.status === "settlement"
                              ? "bg-success"
                              : order.status === "pending"
                              ? "bg-warning text-dark"
                              : "bg-danger"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td>
                        {new Date(order.created_at).toLocaleString("id-ID")}
                      </td>
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
                <p>
                  <strong>ID Order:</strong> {selectedOrder.order_id}
                </p>
                <p>
                  <strong>User ID:</strong> {selectedOrder.user_id}
                </p>
                <p>
                  <strong>Produk ID:</strong> {selectedOrder.product_id}
                </p>
                <p>
                  <strong>Jumlah:</strong> {selectedOrder.qty}
                </p>
                <p>
                  <strong>Total:</strong> Rp{" "}
                  {Number(selectedOrder.gross_amount).toLocaleString("id-ID")}
                </p>
                <p>
                  <strong>Status:</strong> {selectedOrder.status}
                </p>
                <p>
                  <strong>Waktu:</strong>{" "}
                  {new Date(selectedOrder.created_at).toLocaleString("id-ID")}
                </p>
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
