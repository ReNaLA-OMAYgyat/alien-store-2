import React, { useEffect, useState } from "react";
import Sidebar from "../components/Admin/sidebar";
import api from "../api"; // kamu udah punya ini, pakai langsung

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    produk: 0,
    kategori: 0,
    subkategori: 0,
    transaksi: 0,
    pendapatan: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [produkRes, kategoriRes, subkategoriRes, transaksiRes] =
          await Promise.all([
            api.get("/products"),
            api.get("/categories"),
            api.get("/subcategories"),
            api.get("/transaksi-admin"),
          ]);
console.log("📦 Produk:", produkRes.data);
console.log("📂 Kategori:", kategoriRes.data);
console.log("🗂️ Subkategori:", subkategoriRes.data);
console.log("💰 Transaksi:", transaksiRes.data);

        // Pastikan transaksi berupa array
        const transaksiArray =
          transaksiRes.data.data || transaksiRes.data || [];

        // Hitung total pendapatan
        const totalPendapatan = transaksiArray.reduce(
          (sum, t) => sum + Number(parseFloat(t.gross_amount) || 0),
          0
        );

        setStats({
          produk: produkRes.data.data?.length || produkRes.data.length || 0,
          kategori: kategoriRes.data.data?.length || kategoriRes.data.length || 0,
          subkategori:
            subkategoriRes.data.data?.length || subkategoriRes.data.length || 0,
          transaksi: transaksiArray.length,
          pendapatan: totalPendapatan,
        });
      } catch (error) {
        console.error("❌ Gagal ambil data dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const cards = [
    { title: "Produk", value: stats.produk, icon: "📦" },
    { title: "Kategori", value: stats.kategori, icon: "📂" },
    { title: "Subkategori", value: stats.subkategori, icon: "🗂️" },
    { title: "Transaksi", value: stats.transaksi, icon: "💰" },
    {
      title: "Total Revenue",
      value: stats.pendapatan.toLocaleString("id-ID", {
        style: "currency",
        currency: "IDR",
      }),
      icon: "💵",
    },
  ];

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Memuat...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="d-flex"
      style={{
        background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
        minHeight: "100vh",
      }}
    >
      <Sidebar />

      <div className="flex-grow-1 p-4" style={{ marginLeft: "250px" }}>
        <div className="container-fluid">
          <h1
            className="mb-2 text-dark fw-bold"
            style={{ fontFamily: "Coolvetica, sans-serif" }}
          >
            📊 Dashboard Admin
          </h1>
          <p className="text-muted mb-4">
            Pantau performa toko Anda dengan data terkini.
          </p>

          {/* Kartu Statistik */}
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 mb-4">
            {cards.map((item, index) => (
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
                    e.currentTarget.style.boxShadow =
                      "0 8px 20px rgba(0,0,0,0.12)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(0,0,0,0.08)";
                  }}
                >
                  <div className="card-body d-flex flex-column justify-content-center align-items-center">
                    <div className="fs-1 mb-3">{item.icon}</div>
                    <h6
                      className="card-title text-muted mb-2"
                      style={{
                        fontFamily: "Coolvetica, sans-serif",
                      }}
                    >
                      {item.title}
                    </h6>
                    <p className="card-text fs-4 fw-bold text-primary mb-0">
                      {item.value}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
