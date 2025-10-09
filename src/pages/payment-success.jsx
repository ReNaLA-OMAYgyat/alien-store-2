import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getPaymentStatus } from "../api";

export default function PaymentSuccess() {
  const { orderId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchStatus = async () => {
      if (!orderId) {
        setError("Order ID tidak ditemukan pada URL.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const res = await getPaymentStatus(orderId);
        // Response shape from backend
        const payload = res.data || {};
        setData(payload);
      } catch (e) {
        setError(
          e?.response?.data?.message || "Gagal mengambil status pembayaran dari server."
        );
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchStatus();
    return () => {
      mounted = false;
    };
  }, [orderId]);

  const mid = useMemo(() => {
    const raw = data?.midtrans_response;
    if (!raw) return null;
    // normalize to plain object
    return typeof raw === "object" ? JSON.parse(JSON.stringify(raw)) : null;
  }, [data]);

  const statusLower = (data?.status || "unknown").toLowerCase();
  const badgeClass = useMemo(() => {
    if (["settlement", "capture"].includes(statusLower)) return "bg-success";
    if (statusLower === "pending") return "bg-warning text-dark";
    if (["deny", "cancel", "expire", "error"].includes(statusLower)) return "bg-danger";
    return "bg-secondary";
  }, [statusLower]);

  const grossAmount = useMemo(() => {
    let g = mid?.gross_amount;
    if (typeof g === "string") {
      const parsed = parseFloat(g);
      if (!Number.isNaN(parsed)) g = parsed;
    }
    return Number(g || 0);
  }, [mid]);

  return (
    <div className="container py-5" style={{ maxWidth: 880 }}>
      <div className="text-center mb-4">
        <i className="bi bi-bag-check-fill text-success" style={{ fontSize: "3rem" }}></i>
        <h1 className="mt-3">Status Pembayaran</h1>
        <p className="text-secondary">{data?.message || "Status transaksi"}</p>
      </div>

      <div className="card shadow-sm border-0 rounded-4">
        <div className="card-body p-4">
          {loading ? (
            <div className="d-flex align-items-center gap-2">
              <div className="spinner-border spinner-border-sm" />
              <span>Memuat status pembayaran...</span>
            </div>
          ) : error ? (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          ) : (
            <>
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="text-secondary mb-1">ID Order</div>
                  <div className="fw-semibold">{data?.order_id || orderId}</div>
                </div>
                <div className="col-md-3">
                  <div className="text-secondary mb-1">Status</div>
                  <span className={`badge ${badgeClass} text-uppercase`}>{statusLower}</span>
                </div>
                <div className="col-md-3">
                  <div className="text-secondary mb-1">Metode</div>
                  <div className="fw-semibold">{mid?.payment_type || "-"}</div>
                </div>
              </div>

              <hr className="my-4" />

              <div className="row g-4">
                <div className="col-md-4">
                  <div className="text-secondary mb-1">Jumlah</div>
                  <div className="fw-semibold">Rp {grossAmount.toLocaleString("id-ID")}</div>
                </div>
                <div className="col-md-4">
                  <div className="text-secondary mb-1">Waktu Transaksi</div>
                  <div className="fw-semibold">{mid?.transaction_time || "-"}</div>
                </div>
                <div className="col-md-4">
                  <div className="text-secondary mb-1">Waktu Settlement</div>
                  <div className="fw-semibold">{mid?.settlement_time || "-"}</div>
                </div>
              </div>

              <div className="row g-4 mt-1">
                <div className="col-md-4">
                  <div className="text-secondary mb-1">Mata Uang</div>
                  <div className="fw-semibold">{mid?.currency || "IDR"}</div>
                </div>
                <div className="col-md-4">
                  <div className="text-secondary mb-1">Issuer / Acquirer</div>
                  <div className="fw-semibold">
                    {(mid?.issuer || "-")} / {(mid?.acquirer || "-")}
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="text-secondary mb-1">Transaction ID</div>
                  <div className="fw-semibold">
                    <code>{mid?.transaction_id || "-"}</code>
                  </div>
                </div>
              </div>

              {(["settlement", "capture"].includes(statusLower)) && (
                <div className="alert alert-success d-flex align-items-center gap-2 mt-4" role="alert">
                  <i className="bi bi-check2-circle"></i>
                  <div>Pembayaran berhasil diproses. Terima kasih telah berbelanja di AlienStore!</div>
                </div>
              )}
              {statusLower === "pending" && (
                <div className="alert alert-warning d-flex align-items-center gap-2 mt-4" role="alert">
                  <i className="bi bi-hourglass-split"></i>
                  <div>Pembayaran Anda masih menunggu. Silakan cek kembali beberapa saat lagi.</div>
                </div>
              )}
              {["deny", "cancel", "expire"].includes(statusLower) && (
                <div className="alert alert-danger d-flex align-items-center gap-2 mt-4" role="alert">
                  <i className="bi bi-x-circle"></i>
                  <div>Pembayaran tidak berhasil. Silakan coba lagi atau gunakan metode lain.</div>
                </div>
              )}

              <div className="d-flex gap-2 mt-4">
                <Link to="/" className="btn btn-primary">
                  <i className="bi bi-house-door"></i> Kembali ke Beranda
                </Link>
                <Link to="/orders" className="btn btn-outline-secondary">
                  <i className="bi bi-card-list"></i> Lihat Pesanan
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="text-center mt-4 text-secondary">
        <small>Jika halaman ini terbuka otomatis setelah pembayaran, Anda dapat menutup tab ini.</small>
      </div>
    </div>
  );
}