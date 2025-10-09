import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Admin/sidebar";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  // === Fetch Data ===
  useEffect(() => {
    getCustomers();
    getRoles();
  }, []);

  const getCustomers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://127.0.0.1:8000/api/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // pastikan data dari API berbentuk array
      const dataArray = res.data.data || res.data;
      setCustomers(Array.isArray(dataArray) ? dataArray : []);
    } catch (err) {
      console.error("Gagal ambil data user:", err);
    } finally {
      setLoading(false);
    }
  };

  const getRoles = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/role", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dataArray = res.data.data || res.data;
      setRoles(Array.isArray(dataArray) ? dataArray : []);
    } catch (err) {
      console.error("Gagal ambil role:", err);
    }
  };

  // === Filter Search ===
  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  // === Edit ===
  const handleEdit = (cust) => {
    setEditCustomer({ ...cust, role_id: cust.role?.id || "" });
    setShowEdit(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://127.0.0.1:8000/api/user/${editCustomer.id}`,
        editCustomer,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      getCustomers();
      setShowEdit(false);
    } catch (err) {
      console.error("Gagal update user:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus user ini?")) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/api/user/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      getCustomers();
    } catch (err) {
      console.error("Gagal hapus user:", err);
    }
  };

  // === Render ===
  return (
    <div className="d-flex">
      <Sidebar />

      <div className="p-4 w-100" style={{ marginLeft: "250px" }}>
        <h2 className="mb-4">Daftar Customer</h2>

        <div className="mb-3 col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Cari berdasarkan nama..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <p>Memuat data pelanggan...</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped table-bordered align-middle">
              <thead className="table-dark">
                <tr>
                  <th>ID</th>
                  <th>Nama</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Tanggal Dibuat</th>
                  <th>Terakhir Diperbarui</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? (
                  filtered.map((cust) => (
                    <tr key={cust.id}>
                      <td>{cust.id}</td>
                      <td>{cust.name}</td>
                      <td>{cust.email}</td>
                      <td>{cust.role?.name || "N/A"}</td>
                      <td>{cust.created_at}</td>
                      <td>{cust.updated_at}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-primary me-2"
                          onClick={() => handleEdit(cust)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(cust.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center">
                      Tidak ada customer ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal Edit */}
        {showEdit && editCustomer && (
          <div
            className="modal show fade d-block"
            tabIndex="-1"
            style={{ background: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog">
              <div className="modal-content">
                <form onSubmit={handleSave}>
                  <div className="modal-header">
                    <h5 className="modal-title">Edit Customer</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowEdit(false)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Nama</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editCustomer.name}
                        onChange={(e) =>
                          setEditCustomer({
                            ...editCustomer,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={editCustomer.email}
                        onChange={(e) =>
                          setEditCustomer({
                            ...editCustomer,
                            email: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Role</label>
                      <select
                        className="form-select"
                        value={editCustomer.role_id}
                        onChange={(e) =>
                          setEditCustomer({
                            ...editCustomer,
                            role_id: e.target.value,
                          })
                        }
                      >
                        <option value="">-- Pilih Role --</option>
                        {roles.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowEdit(false)}
                    >
                      Batal
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Simpan Perubahan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
