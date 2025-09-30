import React, { useEffect, useState } from "react";
import api from "../api";
import SubCategoryModal from "../components/subcategories.jsx";
import Sidebar from "../components/sidebar.jsx";

export default function Dashboard() {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loadingSubcats, setLoadingSubcats] = useState(false);

  // Table UX state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [density, setDensity] = useState("comfortable"); // "compact" uses table-sm

  const [showSubModal, setShowSubModal] = useState(false);
  const [selectedSub, setSelectedSub] = useState(null);
  const [subToDelete, setSubToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
  }, []);

  // === FETCH CATEGORIES ===
  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (err) {
      console.error("Gagal fetch kategori:", err);
    }
  };

  // === FETCH SUBCATEGORIES ===
  const fetchSubcategories = async () => {
    try {
      setLoadingSubcats(true);
      const res = await api.get("/subcategories");
      setSubcategories(res.data);
    } catch (err) {
      console.error("Gagal fetch subcategory:", err);
    } finally {
      setLoadingSubcats(false);
    }
  };

  // === SAVE SUBCATEGORY ===
  const handleSaveSubcategory = async (data) => {
    try {
      const token = localStorage.getItem("token");

      const payload = {
        name: data.name,
        category_id: parseInt(data.category_id),
      };

      if (selectedSub) {
        await api.put(`/subcategories/${selectedSub.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Subcategory berhasil diupdate!");
      } else {
        await api.post("/subcategories", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Subcategory berhasil ditambahkan!");
      }

      fetchSubcategories();
      setShowSubModal(false);
      setSelectedSub(null);
    } catch (err) {
      console.error(err.response?.data || err);
      alert("Gagal menyimpan subcategory");
    }
  };

  // === Table helpers ===
  const getCategoryName = (categoryId) =>
    categories.find((c) => c.id === categoryId)?.name || "-";

  const filteredSubcategories = subcategories.filter((sub) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const nameMatch = sub.name?.toLowerCase().includes(q);
    const categoryMatch = getCategoryName(sub.category_id)
      .toLowerCase()
      .includes(q);
    return nameMatch || categoryMatch || String(sub.id).includes(q);
  });

  const categoryFiltered = categoryFilter
    ? filteredSubcategories.filter(
        (s) => String(s.category_id) === String(categoryFilter)
      )
    : filteredSubcategories;

  const sortedSubcategories = [...categoryFiltered].sort((a, b) => {
    const dir = sortConfig.direction === "asc" ? 1 : -1;
    const key = sortConfig.key;
    let aVal;
    let bVal;
    if (key === "category") {
      aVal = getCategoryName(a.category_id).toLowerCase();
      bVal = getCategoryName(b.category_id).toLowerCase();
    } else if (key === "name") {
      aVal = a.name?.toLowerCase() || "";
      bVal = b.name?.toLowerCase() || "";
    } else {
      aVal = a.id;
      bVal = b.id;
    }
    if (aVal < bVal) return -1 * dir;
    if (aVal > bVal) return 1 * dir;
    return 0;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(sortedSubcategories.length / pageSize)
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIdx = (safeCurrentPage - 1) * pageSize;
  const paginatedSubcategories = sortedSubcategories.slice(
    startIdx,
    startIdx + pageSize
  );
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key)
      return <i className="bi bi-arrow-down-up ms-1 text-secondary"></i>;
    return sortConfig.direction === "asc" ? (
      <i className="bi bi-caret-up-fill ms-1"></i>
    ) : (
      <i className="bi bi-caret-down-fill ms-1"></i>
    );
  };

  const exportCsv = () => {
    const rows = [
      ["ID", "Nama", "Kategori"],
      ...sortedSubcategories.map((s) => [
        s.id,
        s.name,
        getCategoryName(s.category_id),
      ]),
    ];
    const csv = rows
      .map((r) =>
        r.map((c) => `"${String(c ?? "").replaceAll('"', '""')}"`).join(",")
      )
      .join("\n");
    const blob = new Blob(["\ufeff" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "subcategories.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const requestDeleteSubcategory = async () => {
    if (!subToDelete) return;
    try {
      setDeleting(true);
      const token = localStorage.getItem("token");
      await api.delete(`/subcategories/${subToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubToDelete(null);
      fetchSubcategories();
    } catch (err) {
      console.error("Gagal menghapus subcategory:", err);
      alert("Gagal menghapus subcategory");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="d-flex vh-100">
      {/* Sidebar */}
      <Sidebar />
      {/* Main Content */}
      <div className="flex-grow-1 bg-light p-4">
        <h2 className="fw-bold mb-4">Dashboard Subcategories</h2>

        <button
          className="btn btn-success mb-3"
          onClick={() => {
            setSelectedSub(null);
            setShowSubModal(true);
          }}
        >
          + Tambah Subcategory
        </button>

        <div className="card shadow-sm p-3">
          <div className="d-flex flex-column gap-2">
            <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-2">
              <h5 className="fw-bold m-0">Daftar Subcategory</h5>
              <div className="d-flex align-items-center gap-2">
                <button
                  className="btn btn-primary d-flex align-items-center gap-2"
                  onClick={() => {
                    setSelectedSub(null);
                    setShowSubModal(true);
                  }}
                >
                  <i className="bi bi-plus-lg"></i>
                  Tambah
                </button>
                <button
                  className="btn btn-outline-secondary d-flex align-items-center gap-2"
                  onClick={exportCsv}
                >
                  <i className="bi bi-download"></i>
                  Export CSV
                </button>
              </div>
            </div>

            <div className="d-flex flex-column flex-xl-row align-items-xl-center justify-content-between gap-2">
              <div
                className="d-flex align-items-center gap-2"
                style={{ maxWidth: 520, width: "100%" }}
              >
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <i className="bi bi-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Cari nama atau kategori..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                  {searchQuery ? (
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => setSearchQuery("")}
                    >
                      Bersihkan
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="d-flex align-items-center gap-2">
                <select
                  className="form-select form-select-sm"
                  style={{ minWidth: 180 }}
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">Semua Kategori</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <div className="btn-group" role="group" aria-label="Density">
                  <button
                    type="button"
                    className={`btn btn-sm ${
                      density === "comfortable"
                        ? "btn-primary"
                        : "btn-outline-primary"
                    }`}
                    onClick={() => setDensity("comfortable")}
                  >
                    Nyaman
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${
                      density === "compact"
                        ? "btn-primary"
                        : "btn-outline-primary"
                    }`}
                    onClick={() => setDensity("compact")}
                  >
                    Padat
                  </button>
                </div>
              </div>
            </div>

            <div className="text-secondary small">
              Menampilkan {paginatedSubcategories.length} dari{" "}
              {sortedSubcategories.length} hasil
            </div>
          </div>

          <div className="table-responsive" style={{ maxHeight: 480 }}>
            <table
              className={`table table-bordered ${
                density === "compact" ? "table-sm" : ""
              } table-striped table-hover align-middle mb-0`}
            >
              <thead>
                <tr
                  style={{
                    position: "sticky",
                    top: 0,
                    background: "#f8f9fa",
                    zIndex: 1,
                  }}
                >
                  <th
                    role="button"
                    onClick={() => handleSort("id")}
                    className="user-select-none"
                  >
                    ID {renderSortIcon("id")}
                  </th>
                  <th
                    role="button"
                    onClick={() => handleSort("name")}
                    className="user-select-none"
                  >
                    Nama {renderSortIcon("name")}
                  </th>
                  <th
                    role="button"
                    onClick={() => handleSort("category")}
                    className="user-select-none"
                  >
                    Kategori {renderSortIcon("category")}
                  </th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loadingSubcats ? (
                  <tr>
                    <td colSpan="4" className="text-center py-4">
                      <div className="d-inline-flex align-items-center gap-2 text-secondary">
                        <div
                          className="spinner-border spinner-border-sm"
                          role="status"
                        ></div>
                        <span>Memuat data…</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedSubcategories.length > 0 ? (
                  paginatedSubcategories.map((sub) => (
                    <tr key={sub.id}>
                      <td>{sub.id}</td>
                      <td>{sub.name}</td>
                      <td>
                        {categories.find((c) => c.id === sub.category_id)
                          ?.name || "-"}
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm" role="group">
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => {
                              setSelectedSub(sub);
                              setShowSubModal(true);
                            }}
                          >
                            <i className="bi bi-pencil-square"></i>
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => setSubToDelete(sub)}
                          >
                            <i className="bi bi-trash3"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-4">
                      <div className="text-secondary">
                        Tidak ada data yang cocok.{" "}
                        {searchQuery ? (
                          <button
                            className="btn btn-link btn-sm"
                            onClick={() => setSearchQuery("")}
                          >
                            Hapus pencarian
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mt-3">
            <div className="d-flex align-items-center gap-2">
              <span className="text-secondary small">Tampilan</span>
              <select
                className="form-select form-select-sm"
                style={{ width: 80 }}
                value={pageSize}
                onChange={(e) => {
                  setPageSize(parseInt(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span className="text-secondary small">per halaman</span>
            </div>
            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li
                  className={`page-item ${
                    safeCurrentPage === 1 ? "disabled" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    Sebelumnya
                  </button>
                </li>
                {pageNumbers.map((p) => (
                  <li
                    key={p}
                    className={`page-item ${
                      p === safeCurrentPage ? "active" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(p)}
                    >
                      {p}
                    </button>
                  </li>
                ))}
                <li
                  className={`page-item ${
                    safeCurrentPage === totalPages ? "disabled" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                  >
                    Berikutnya
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      {/* Modal Subcategory */}
      <SubCategoryModal
        show={showSubModal}
        handleClose={() => setShowSubModal(false)}
        handleSave={handleSaveSubcategory}
        subcategory={selectedSub}
        categories={categories}
      />

      {/* Delete Confirmation Modal */}
      {subToDelete && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 1060 }}
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded shadow" style={{ width: "460px" }}>
            <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
              <h5 className="m-0">Hapus Subcategory</h5>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setSubToDelete(null)}
              >
                ✕
              </button>
            </div>
            <div className="p-3">
              <p className="mb-0">
                Yakin ingin menghapus <strong>{subToDelete.name}</strong>?
                Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="p-3 d-flex justify-content-end gap-2 border-top">
              <button
                className="btn btn-outline-secondary"
                onClick={() => setSubToDelete(null)}
                disabled={deleting}
              >
                Batal
              </button>
              <button
                className="btn btn-danger"
                onClick={requestDeleteSubcategory}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    ></span>
                    Menghapus...
                  </>
                ) : (
                  "Hapus"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
