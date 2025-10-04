import React, { useEffect, useState, useRef } from "react";
import Sidebar from "../components/Admin/sidebar";
import Chart from "chart.js/auto";

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({});
  const [transactions, setTransactions] = useState([]);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    // Dummy data
    setTimeout(() => {
      setSummary({
        totalSales: 152,
        totalRevenue: 3200000,
        totalCustomers: 45,
      });

      setTransactions([
        { id: 1, customer: "John Doe", amount: 250000, date: "2025-09-01" },
        { id: 2, customer: "Jane Smith", amount: 500000, date: "2025-09-03" },
        { id: 3, customer: "Michael Lee", amount: 125000, date: "2025-09-07" },
      ]);

      setLoading(false);
    }, 800);
  }, []);

  useEffect(() => {
    if (!loading) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext("2d");
      chartInstance.current = new Chart(ctx, {
        type: "line",
        data: {
          labels: [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ],
          datasets: [
            {
              label: "Revenue",
              data: [200000, 300000, 500000, 400000, 600000, 800000, 700000, 900000, 650000, 720000, 850000, 950000],
              borderColor: "rgba(54, 162, 235, 1)",
              backgroundColor: "rgba(54, 162, 235, 0.2)",
              fill: true,
              tension: 0.3,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: true,
              position: "top",
            },
          },
        },
      });
    }
  }, [loading]);

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
                    <p className="fs-4 fw-bold">Rp {summary.totalRevenue.toLocaleString()}</p>
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
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((t) => (
                        <tr key={t.id}>
                          <td>{t.id}</td>
                          <td>{t.customer}</td>
                          <td>Rp {t.amount.toLocaleString()}</td>
                          <td>{t.date}</td>
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
