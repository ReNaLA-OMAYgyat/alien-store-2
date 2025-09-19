import React, { useState, useEffect } from "react";
import api from "../api";

export default function DetailProductModal({ show, onClose, onSaved, productDetail, products }) {
  const [form, setForm] = useState({
    warna: "",
    ukuran: "",
    bahan: "",
    product_id: "",
  });

  // Reset form saat modal terbuka atau edit
  useEffect(() => {
    if (productDetail) {
      setForm({
        warna: productDetail.warna || "",
        ukuran: productDetail.ukuran || "",
        bahan: productDetail.bahan || "",
        product_id: productDetail.product_id || "",
      });
    } else {
      setForm({
        warna: "",
        ukuran: "",
        bahan: "",
        product_id: "",
      });
    }
  }, [productDetail]);

  // Handle input biasa
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
   try {
  if (productDetail) {
    await api.put(`/products-detail/${productDetail.id}`, form);
  } else {
    await api.post("/products-detail", form);
  }

  alert("Data detail produk berhasil disimpan ✅");

  onSaved();
  onClose();
} catch (err) {
  console.error("Error saving detail product:", err.response?.data || err);
  alert("Gagal menyimpan detail produk ❌");
}
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog modal-md modal-dialog-centered">
        <div className="modal-content shadow">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">
              {productDetail ? "Edit Detail Produk" : "Tambah Detail Produk"}
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Warna</label>
                <input
                  type="text"
                  name="warna"
                  className="form-control"
                  value={form.warna}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Ukuran</label>
                <input
                  type="text"
                  name="ukuran"
                  className="form-control"
                  value={form.ukuran}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Bahan</label>
                <input
                  type="text"
                  name="bahan"
                  className="form-control"
                  value={form.bahan}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Produk</label>
               <select
  name="product_id"
  className="form-select"
  value={form.product_id}
  onChange={handleChange}
  required
>
  <option value="">Pilih Produk</option>
  {products?.map((p) => (
    <option key={p.id} value={p.id}>
      {p.nama}
    </option>
  ))}
</select>

              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Batal
              </button>
              <button type="submit" className="btn btn-primary">
                {productDetail ? "Update" : "Simpan"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
