// src/pages/Settings.jsx
import React from "react";
import Sidebar from "../components/sidebar";


export default function Settings() {
  return (
    <div className="d-flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-grow-1 p-4" style={{ marginLeft: "250px" }}>
        <h2 className="fw-bold mb-4">⚙️ Store Settings</h2>

        {/* Card: Informasi Toko */}
        <div className="card mb-4 shadow-sm">
          <div className="card-body">
            <h5 className="card-title">Informasi Toko</h5>
            <form className="row g-3 mt-2">
              <div className="col-md-6">
                <label className="form-label">Nama Toko</label>
                <input
                  type="text"
                  className="form-control"
                  defaultValue="AlienStore"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Email Admin</label>
                <input
                  type="email"
                  className="form-control"
                  defaultValue="admin@alienstore.com"
                />
              </div>
              <div className="col-12">
                <label className="form-label">Alamat Toko</label>
                <textarea
                  className="form-control"
                  rows="2"
                  defaultValue="Jl. Andromeda No. 23, Bandung"
                />
              </div>
              <div className="col-12">
                <button className="btn btn-primary">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>

        {/* Card: Keamanan */}
        <div className="card mb-4 shadow-sm">
          <div className="card-body">
            <h5 className="card-title">Keamanan</h5>
            <form className="row g-3 mt-2">
              <div className="col-md-6">
                <label className="form-label">Password Baru</label>
                <input type="password" className="form-control" />
              </div>
              <div className="col-md-6">
                <label className="form-label">Konfirmasi Password</label>
                <input type="password" className="form-control" />
              </div>
              <div className="col-12">
                <button className="btn btn-danger">Update Password</button>
              </div>
            </form>
          </div>
        </div>

        {/* Card: Preferensi */}
        <div className="card shadow-sm">
          <div className="card-body">
            <h5 className="card-title">Preferensi</h5>
            <div className="form-check form-switch mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                defaultChecked
              />
              <label className="form-check-label">Aktifkan Mode Gelap</label>
            </div>
            <div className="form-check form-switch">
              <input className="form-check-input" type="checkbox" />
              <label className="form-check-label">Notifikasi Email</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
