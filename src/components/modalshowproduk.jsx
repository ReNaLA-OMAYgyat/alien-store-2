import React, { useEffect, useState } from "react";
import api from "../api";

export default function ModalShowDetail({ show, onClose, productId }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch detail product ketika modal terbuka
  useEffect(() => {
    if (show && productId) {
      setLoading(true);
      api
        .get(`/products-detail/${productId}`)
        .then((res) => {
          setDetail(res.data);
        })
        .catch((err) => {
          console.error("Error fetching product detail:", err);
          setDetail([]);
        })
        .finally(() => setLoading(false));
    }
  }, [show, productId]);

  if (!show) return null;

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
                    <tr key={d.id}>
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
