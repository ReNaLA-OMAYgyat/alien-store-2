import React, { useEffect, useState } from "react";
import api from "../../api";

export default function ModalShowDetail({ show, onClose, productId, productDetail }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // If parent already provided detail data, use it. Otherwise fetch.
  useEffect(() => {
    let mounted = true;
    async function load() {
      setErrorMessage(null);
      if (!show) return;

      if (productDetail) {
        // parent provided data (could be array or single object)
        if (mounted) {
          setDetail(Array.isArray(productDetail) ? productDetail : [productDetail]);
        }
        return;
      }

      if (!productId) {
        if (mounted) setDetail([]);
        return;
      }

      setLoading(true);
    try {
  const url = `/products-detail`;
  console.debug(`Fetching all product details from ${url}`);
  const res = await api.get(url);

  let data = res.data;

  // cari produk sesuai productId
  const product = data.find((p) => p.id === productId);

  // ambil details-nya
  const details = product?.details || [];

  if (mounted) setDetail(details);
} catch (err) {
  console.error("Error fetching product detail:", err);
  let msg = "Gagal memuat detail produk.";
  if (err.response) {
    msg += ` Server mengembalikan status ${err.response.status}.`;
  } else if (err.request) {
    msg += " Tidak ada respons dari server (cek koneksi / CORS / base URL).";
  }
  if (mounted) {
    setErrorMessage(msg);
    setDetail([]);
  }
      } finally {
        if (mounted) setLoading(false);
      }

    }

    load();
    return () => {
      mounted = false;
    };
  }, [show, productId, productDetail]);

  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content shadow">
          <div className="modal-header bg-info text-white">
            <h5 className="modal-title">Detail Produk</h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>

          <div className="modal-body">
            {loading ? (
              <p>Loading...</p>
            ) : errorMessage ? (
              <div className="alert alert-warning">{errorMessage}</div>
            ) : detail && detail.length > 0 ? (
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Warna</th>
                    <th>Ukuran</th>
                    <th>Bahan</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.map((d) => (
                    <tr key={d.id || `${d.warna}-${d.ukuran}`}>
                      <td>{d.warna}</td>
                      <td>{d.ukuran}</td>
                      <td>{d.bahan ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>Belum ada detail untuk produk ini</p>
            )}
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
