import React, { useEffect, useState } from "react";
import api from "../api";

export default function ProductModal({ show, onClose, onSaved, product, subcategories }) {
  const [form, setForm] = useState({
    nama: "",
    merk: "",
    harga: "",
    stok: "",
    subcategory_id: "",
    image: null,
  });

  // Reset form atau isi kalau edit
  useEffect(() => {
    if (product) {
      setForm({
        nama: product.nama || "",
        merk: product.merk || "",
        harga: product.harga || "",
        stok: product.stok || "",
        subcategory_id: product.subcategory_id || "",
        image: null,
      });
    } else {
      setForm({
        nama: "",
        merk: "",
        harga: "",
        stok: "",
        subcategory_id: "",
        image: null,
      });
    }
  }, [product]);

  // Handle input biasa
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle upload gambar
  const handleFileChange = (e) => {
    setForm((prev) => ({
      ...prev,
      image: e.target.files[0],
    }));
  };

  // Submit data
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      if (form[key] !== null && form[key] !== "") {
        formData.append(key, form[key]);
      }
    });

    try {
      if (product) {
        // Update → pakai POST + _method=PUT
        formData.append("_method", "PUT");
        await api.post(`/products/${product.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        // Create
        await api.post("/products", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      onSaved();
      onClose();
    } catch (err) {
      console.error("Error saving product:", err.response?.data || err);
    }
  };

  if (!show) return null;

  // Buat preview gambar saat edit
  const image =
    product && product.image
      ? `${import.meta.env.VITE_API_BASE_URL.replace(
          "/api",
          ""
        )}/storage/${product.image}`
      : null;

  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content shadow">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">
              {product ? "Edit Produk" : "Tambah Produk"}
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Nama Produk</label>
                  <input
                    type="text"
                    name="nama"
                    className="form-control"
                    value={form.nama}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Merk</label>
                  <input
                    type="text"
                    name="merk"
                    className="form-control"
                    value={form.merk}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Harga</label>
                  <input
                    type="number"
                    name="harga"
                    className="form-control"
                    value={form.harga}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Stok</label>
                  <input
                    type="number"
                    name="stok"
                    className="form-control"
                    value={form.stok}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Subkategori</label>
                <select
  name="subcategory_id"
  className="form-select"
  value={form.subcategory_id}
  onChange={handleChange}
  required
>
  <option value="">Pilih Subkategori</option>
  {subcategories.map((s) => (
    <option key={s.id} value={s.id}>
      {s.name}
    </option>
  ))}
</select>

                </div>

                <div className="col-md-6">
                  <label className="form-label">Gambar Produk</label>
                  <input
                    type="file"
                    className="form-control"
                    onChange={handleFileChange}
                  />
                  {image && (
                    <div className="mt-2">
                      <img
                        src={image}
                        alt="preview"
                        style={{
                          width: "100px",
                          height: "100px",
                          objectFit: "cover",
                        }}
                        className="rounded shadow-sm"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Batal
              </button>
              <button type="submit" className="btn btn-primary">
                {product ? "Update" : "Simpan"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
