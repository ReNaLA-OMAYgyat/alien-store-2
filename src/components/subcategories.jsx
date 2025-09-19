import { useEffect, useState } from "react";

export default function SubCategoryModal({
  show,
  handleClose,
  handleSave,
  subcategory,
  categories = [],
}) {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");

  useEffect(() => {
    if (show) {
      setName(subcategory?.name || "");
      setCategoryId(subcategory?.category_id?.toString() || "");
    }
  }, [show, subcategory]);

  if (!show) return null;

  const onSubmit = (e) => {
    e.preventDefault();
    handleSave({ name, category_id: categoryId });
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ background: "rgba(0,0,0,0.5)", zIndex: 1050 }}
    >
      <div className="bg-white rounded shadow" style={{ width: "520px" }}>
        <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
          <h5 className="m-0">{subcategory ? "Edit" : "Tambah"} Subcategory</h5>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={handleClose}
          >
            ✕
          </button>
        </div>

        <form className="p-3" onSubmit={onSubmit}>
          <div className="mb-3">
            <label className="form-label">Nama Subcategory</label>
            <input
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan nama subcategory"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Kategori</label>
            <select
              className="form-select"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              <option value="" disabled>
                Pilih kategori
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={handleClose}
            >
              Batal
            </button>
            <button type="submit" className="btn btn-primary">
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
