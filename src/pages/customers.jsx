import React, { useEffect, useState } from "react";
import api from "../api";
import Sidebar from "../components/Admin/sidebar";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [roles, setRoles] = useState([]); // roles untuk dropdown
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const getToken = () => localStorage.getItem("token") || sessionStorage.getItem("token");

  const [showEdit, setShowEdit] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);

  useEffect(() => {
    fetchCustomers();
    fetchRoles();
  }, []);

  const fetchCustomers = () => {
    const token = getToken();
    api
      .get("/user", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setCustomers(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetch customers:", err);
        setLoading(false);
      });
  };

  const fetchRoles = () => {
    const token = getToken();
    api
      .get("/role", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setRoles(res.data); // contoh: [{id:1,name:"admin"},{id:2,name:"customer"}]
      })
      .catch((err) => {
        console.error("Error fetch roles:", err);
      });
  };

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (cust) => {
    setEditCustomer({ ...cust, role_id: cust.role?.id || "" });
    setShowEdit(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const token = getToken();
    api
      .put(`/user/${editCustomer.id}`, editCustomer, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        fetchCustomers();
        setShowEdit(false);
      })
      .catch((err) => {
        console.error("Error update customer:", err);
      });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Yakin mau hapus customer ini?")) return;
    const token = getToken();
    api
      .delete(`/user/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        fetchCustomers();
      })
      .catch((err) => {
        console.error("Error delete customer:", err);
      });
  };

  return (
    <div className="d-flex">
      <Sidebar />

      <div style={{ marginLeft: "250px" }} className="p-4 w-100">
        <h2 className="mb-4">Customers</h2>

        <div className="row mb-3">
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading && <p>Loading customers...</p>}

        {!loading && (
          <div className="table-responsive">
            <table className="table table-striped table-bordered align-middle">
              <thead className="table-dark">
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created At</th>
                  <th>Updated At</th>
                  <th>Action</th>
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
                      No customers found.
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
                      <label className="form-label">Name</label>
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
                        <option value="">-- Select Role --</option>
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
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Save Changes
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
