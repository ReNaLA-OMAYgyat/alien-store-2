import React, { useEffect, useState, useRef } from "react";
import Sidebar from "../components/Admin/sidebar";
import Chart from "chart.js/auto";
import api from "../api"; // pastikan file api.js kamu udah setup axios

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalSales: 0,
    totalRevenue: 0,
    totalCustomers: 0,
  });
  const [transactions, setTransactions] = useState([]);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await api.get("/transaksi-admin");
        const data = res.data || [];

        // 🧮 Hitung summary dari data transaksi
        const totalSales = data.length;
        const totalRevenue = data.reduce(
          (sum, t) => sum + Number(t.gross_amount || 0),
          0
        );
        const uniqueCustomers = new Set(
          data.map((t) => t.user_id)
        ).size;

        // 💾 Simpan hasil summary & transaksi
        setSummary({
          totalSales,
          totalRevenue,
          totalCustomers: uniqueCustomers,
        });
        setTransactions(data);
      } catch (error) {
        console.error("Gagal memuat data laporan:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Buat grafik setelah data didapat
  useEffect(() => {
    if (!loading && transactions.length > 0) {
      if (chartInstance.current) chartInstance.current.destroy();

      // Kelompokkan pendapatan per bulan
      const monthlyRevenue = Array(12).fill(0);
      transactions.forEach((t) => {
        if (t.transaction_time) {
          const month = new Date(t.transaction_time).getMonth();
          monthlyRevenue[month] += t.gross_amount || 0;
        }
      });

      const ctx = chartRef.current.getContext("2d");
      chartInstance.current = new Chart(ctx, {
        type: "line",
        data: {
          labels: [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
          ],
          datasets: [
            {
              label: "Revenue",
              data: monthlyRevenue,
              borderColor: "rgba(54, 162, 235, 1)",
              backgroundColor: "rgba(54, 162, 235, 0.2)",
              fill: true,
              tension: 0.3,
            },
          ],
        },
      });
    }
  }, [loading, transactions]);

  return (
    <div className="d-flex">
      <Sidebar />

      <div style={{ marginLeft: "250px" }} className="p-4 w-100">
        <h2 className="mb-4">Reports</h2>

        {loading ? (
          <p>Loading reports...</p>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="row mb-4">
              <div className="col-md-4">
                <div className="card text-bg-primary shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title">Total Sales</h5>
                    <p className="fs-4 fw-bold">{summary.totalSales}</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card text-bg-success shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title">Total Revenue</h5>
                    <p className="fs-4 fw-bold">
                      Rp {summary.totalRevenue.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card text-bg-warning shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title">Total Customers</h5>
                    <p className="fs-4 fw-bold">{summary.totalCustomers}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-dark text-white">
                Revenue per Month
              </div>
              <div className="card-body">
                <canvas ref={chartRef} height="100"></canvas>
              </div>
            </div>

            {/* Recent Transactions Table */}
            <div className="card shadow-sm">
              <div className="card-header bg-dark text-white">
                Recent Transactions
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-striped table-hover mb-0">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((t) => (
                        <tr key={t.id}>
                          <td>{t.id}</td>
                          <td>{t.user?.name || "Unknown"}</td>
                          <td>Rp {t.gross_amount?.toLocaleString()}</td>
                          <td>{t.status}</td>
                          <td>{t.transaction_time || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
