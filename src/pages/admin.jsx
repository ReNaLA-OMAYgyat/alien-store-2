// src/pages/AdminDashboard.jsx
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Sidebar from "../components/sidebar";

export default function AdminDashboard() {
  const stats = [
    { title: "Produk", value: 120, icon: "📦" },
    { title: "Kategori", value: 10, icon: "📂" },
    { title: "Subkategori", value: 25, icon: "🗂️" },
    { title: "Transaksi", value: 450, icon: "💰" },
    { title: "Customer", value: 180, icon: "👥" },
  ];

  const salesData = [
    { month: "Jan", sales: 400 },
    { month: "Feb", sales: 300 },
    { month: "Mar", sales: 500 },
    { month: "Apr", sales: 700 },
    { month: "May", sales: 600 },
  ];

  return (
    <div className="d-flex" style={{ background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)", minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Konten Dashboard */}
      <div className="flex-grow-1 p-4" style={{ marginLeft: "250px" }}>
        <div className="container-fluid">
          <h1 className="mb-2 text-dark fw-bold" style={{ fontFamily: "Coolvetica, sans-serif" }}>📊 Dashboard Admin</h1>
          <p className="text-muted mb-4">Pantau performa toko Anda dengan data terkini.</p>

          {/* Stats Cards */}
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 mb-4">
            {stats.map((item, index) => (
              <div key={index} className="col">
                <div
                  className="card text-center h-100 border-0 shadow-sm"
                  style={{
                    borderRadius: "16px",
                    background: "#fff",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-5px)";
                    e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.12)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                  }}
                >
                  <div className="card-body d-flex flex-column justify-content-center align-items-center">
                    <div className="fs-1 mb-3">{item.icon}</div>
                    <h6 className="card-title text-muted mb-2" style={{ fontFamily: "Coolvetica, sans-serif" }}>{item.title}</h6>
                    <p className="card-text fs-3 fw-bold text-primary mb-0">{item.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sales Chart */}
          <div className="card border-0 shadow-sm" style={{ borderRadius: "16px", background: "#fff" }}>
            <div className="card-body">
              <h5 className="card-title mb-4 text-dark fw-bold" style={{ fontFamily: "Coolvetica, sans-serif" }}>Grafik Penjualan Bulanan</h5>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={salesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                  <XAxis dataKey="month" tick={{ fontSize: 14, fill: "#6c757d" }} />
                  <YAxis tick={{ fontSize: 14, fill: "#6c757d" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #dee2e6",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                    labelStyle={{ color: "#495057" }}
                  />
                  <Bar dataKey="sales" fill="#007bff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
