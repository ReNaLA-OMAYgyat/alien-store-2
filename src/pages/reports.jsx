import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Sidebar from "../components/sidebar";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Reports() {
  // Dummy data grafik
  const salesData = [
    { date: "01 Sep", total: 250000 },
    { date: "02 Sep", total: 120000 },
    { date: "03 Sep", total: 340000 },
    { date: "04 Sep", total: 180000 },
    { date: "05 Sep", total: 410000 },
  ];

  return (
   <div className="d-flex">
        <Sidebar />
   
   <div className="container-fluid mt-4" style={{ marginLeft: "250px" }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Reports Dashboard</h2>
        <button className="btn btn-primary">Download PDF</button>
      </div>

      {/* Filter Section */}
      <div className="card mb-4">
        <div className="card-body">
          <form className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Tanggal Mulai</label>
              <input type="date" className="form-control" />
            </div>
            <div className="col-md-3">
              <label className="form-label">Tanggal Akhir</label>
              <input type="date" className="form-control" />
            </div>
            <div className="col-md-3">
              <label className="form-label">Status</label>
              <select className="form-select">
                <option>Semua</option>
                <option>Selesai</option>
                <option>Pending</option>
                <option>Batal</option>
              </select>
            </div>
            <div className="col-md-3 d-flex align-items-end">
              <button type="submit" className="btn btn-success w-100">
                Filter
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Statistik Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card text-white bg-primary mb-3 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Total Orders</h5>
              <h3>125</h3>
              <small>+12% dari bulan lalu</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-success mb-3 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Revenue</h5>
              <h3>Rp 32.500.000</h3>
              <small>+8% dari bulan lalu</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-warning mb-3 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Pending</h5>
              <h3>15</h3>
              <small>-5% dari bulan lalu</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-danger mb-3 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Cancelled</h5>
              <h3>7</h3>
              <small>+3% dari bulan lalu</small>
            </div>
          </div>
        </div>
      </div>

      {/* Grafik Penjualan */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">Grafik Penjualan (Mingguan)</h5>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={salesData}>
                <CartesianGrid stroke="#ccc" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="#0d6efd" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tabel Laporan */}
      <div className="card">
        <div className="card-body">
          <h5 className="card-title mb-3">Detail Laporan Penjualan</h5>
          <div className="table-responsive">
            <table className="table table-bordered table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Tanggal</th>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>2025-09-01</td>
                  <td>#ORD1234</td>
                  <td>Andi</td>
                  <td>Rp 250.000</td>
                  <td><span className="badge bg-success">Selesai</span></td>
                </tr>
                <tr>
                  <td>2</td>
                  <td>2025-09-02</td>
                  <td>#ORD1235</td>
                  <td>Budi</td>
                  <td>Rp 120.000</td>
                  <td><span className="badge bg-warning text-dark">Pending</span></td>
                </tr>
                <tr>
                  <td>3</td>
                  <td>2025-09-03</td>
                  <td>#ORD1236</td>
                  <td>Citra</td>
                  <td>Rp 340.000</td>
                  <td><span className="badge bg-danger">Batal</span></td>
                </tr>
                <tr>
                  <td>4</td>
                  <td>2025-09-04</td>
                  <td>#ORD1237</td>
                  <td>Dewi</td>
                  <td>Rp 410.000</td>
                  <td><span className="badge bg-success">Selesai</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
   </div>
    </div>
  );
}
