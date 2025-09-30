import React, { useEffect, useState, useMemo } from "react";
import api from "../api";
import Sidebar from "../components/Admin/sidebar.jsx";
import ProductModal from "../components/Admin/modalproduct.jsx";
import DetailProductModal from "../components/Admin/modaleditproduk.jsx";
import ModalShowDetail from "../components/Admin/modalshowproduk.jsx";

export default function Product() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [productDetail, setProductDetail] = useState(null);

  // Table / UX state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [subcategoryFilter, setSubcategoryFilter] = useState("");
  const [density, setDensity] = useState("comfortable");

  // Modal & selected product
  const [showShowDetailModal, setShowShowDetailModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);

  // Delete state
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch data
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/products");
      setProducts(res.data);
    } catch (err) {
      console.error("Gagal fetch produk:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubcategories = async () => {
    try {
      const res = await api.get("/subcategories");
      setSubcategories(res.data);
    } catch (err) {
      console.error("Gagal fetch subkategori:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchSubcategories();
  }, []);

  // Helpers
  const getSubcategoryName = (id) => {
    const found = subcategories.find((s) => s.id === id);
    return found ? found.name : "-";
  };

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? "▲" : "▼";
  };

  const sortedProducts = useMemo(() => {
    let sorted = [...products];

    // Filter search & subkategori
    if (searchQuery) {
      sorted = sorted.filter((p) =>
        p.nama.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (subcategoryFilter) {
      sorted = sorted.filter((p) => p.subcategory_id == subcategoryFilter);
    }

    // Sorting
    sorted.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === "asc" ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [products, searchQuery, subcategoryFilter, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / pageSize);
  const safeCurrentPage = Math.min(currentPage, totalPages || 1);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + pageSize);
  const pageNumbers = [...Array(totalPages).keys()].map((i) => i + 1);

  // Delete function
  const requestDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      setDeleting(true);
      await api.delete(`/products/${productToDelete.id}`);
      setProducts(products.filter((p) => p.id !== productToDelete.id));
      setProductToDelete(null);
    } catch (err) {
      console.error("Gagal hapus produk:", err);
    } finally {
      setDeleting(false);
    }
  };

  // Export CSV
  const exportCsv = () => {
    const rows = [
      ["ID", "Nama", "Merk", "Harga", "Stok", "Subkategori"],
      ...products.map((p) => [
        p.id,
        p.nama,
        p.merk,
        p.harga,
        p.stok,
        getSubcategoryName(p.subcategory_id),
      ]),
    ];
    const csvContent =
      "data:text/csv;charset=utf-8," + rows.map((r) => r.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "produk.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="d-flex">
      <Sidebar />
    <div className="container mt-4 pt-5" style={{ marginLeft: 250 }}>
      <h1>Manajemen Produk</h1>

      {/* Filter & Search */}
      <div className="d-flex gap-2 mb-3"
        style={{ justifyContent: "space-between" }}
      >

        <input
          type="text"
          className="form-control w-auto"
          placeholder="Cari produk..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          className="form-select w-auto"
          value={subcategoryFilter}
          onChange={(e) => setSubcategoryFilter(e.target.value)}
        >
          <option value="">Semua Subkategori</option>
          {subcategories.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <button
          className="btn btn-primary"
          onClick={() => {
            setSelectedProduct(null);
            setShowModal(true);
          }}
        >
          Tambah Produk
        </button>
        <button className="btn btn-success" onClick={exportCsv}>
          Export CSV
        </button>
      </div>

      {/* Tabel Produk */}
      <table className="table table-striped table-hover align-middle mb-0">
        <thead>
          <tr style={{ position: "sticky", top: 0, background: "#f8f9fa", zIndex: 1 }}>
            <th role="button" onClick={() => handleSort("id")}>
              ID {renderSortIcon("id")}
            </th>
            <th>Gambar</th>
            <th role="button" onClick={() => handleSort("nama")}>
              Nama {renderSortIcon("nama")}
            </th>
            <th role="button" onClick={() => handleSort("merk")}>
              Merk {renderSortIcon("merk")}
            </th>
            <th>Harga</th>
            <th>Stok</th>
            <th role="button" onClick={() => handleSort("subcategory_id")}>
              Subkategori {renderSortIcon("subcategory_id")}
            </th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="8" className="text-center py-4">
                <div className="spinner-border spinner-border-sm"></div> Memuat data...
              </td>
            </tr>
          ) : paginatedProducts.length > 0 ? (
            paginatedProducts.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt={p.nama}
                      className="rounded shadow-sm"
                      style={{ width: 60, height: 60, objectFit: "cover" }}
                    />
                  ) : (
                    "-"
                  )}
                </td>
                <td>{p.nama}</td>
                <td>{p.merk}</td>
                <td>Rp {parseInt(p.harga).toLocaleString()}</td>
                <td>{p.stok}</td>
                <td>{getSubcategoryName(p.subcategory_id)}</td>
                <td>
                  <div className="btn-group btn-group-sm">
                    <button
                      className="btn btn-outline-primary"
                      onClick={() => {
                        setSelectedProduct(p);
                        setShowModal(true);
                      }}
                    >
                      <i className="bi bi-pencil-square"></i>
                    </button>

                    <button
                      className="btn btn-outline-danger"
                      onClick={() => setProductToDelete(p)}
                    >
                      <i className="bi bi-trash3"></i>
                    </button>

                    <button
                      className="btn btn-outline-warning"
                      onClick={() => {
                        setSelectedProduct(p);
                        setShowDetailModal(true);
                      }}
                    >
                      <i className="bi bi-gear"></i>
                    </button>

                    <button
                      className="btn btn-outline-info"
                      onClick={() => {
                        setSelectedProductId(p.id);
                        setShowShowDetailModal(true);
                      }}
                    >
                      <i className="bi bi-card-list"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center py-4">
                Tidak ada produk
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
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
            <li className={`page-item ${safeCurrentPage === 1 ? "disabled" : ""}`}>
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
                className={`page-item ${p === safeCurrentPage ? "active" : ""}`}
              >
                <button className="page-link" onClick={() => setCurrentPage(p)}>
                  {p}
                </button>
              </li>
            ))}
            <li
              className={`page-item ${safeCurrentPage === totalPages ? "disabled" : ""}`}
            >
              <button
                className="page-link"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Berikutnya
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Modal Produk */}
      {showModal && (
        <ProductModal
          show={showModal}
          onClose={() => setShowModal(false)}
          onSaved={fetchProducts}
          product={selectedProduct}
          subcategories={subcategories}
        />
      )}

      {/* Modal CRUD Detail */}
      {showDetailModal && (
        <DetailProductModal
          show={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          onSaved={fetchProducts}
          productDetail={selectedProduct}
          products={products}
        />
      )}

      {/* Modal Show Detail */}
      {showShowDetailModal && (
        <ModalShowDetail
          show={showShowDetailModal}
          onClose={() => setShowShowDetailModal(false)}
          productId={selectedProductId}
        />
      )}

      {/* Delete Confirmation */}
      {productToDelete && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 1060 }}
        >
          <div className="bg-white rounded shadow" style={{ width: 460 }}>
            <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
              <h5 className="m-0">Hapus Produk</h5>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setProductToDelete(null)}
              >
                ✕
              </button>
            </div>
            <div className="p-3">
              Yakin ingin menghapus <strong>{productToDelete.nama}</strong>?
            </div>
            <div className="p-3 d-flex justify-content-end gap-2 border-top">
              <button
                className="btn btn-outline-secondary"
                onClick={() => setProductToDelete(null)}
                disabled={deleting}
              >
                Batal
              </button>
              <button
                className="btn btn-danger"
                onClick={requestDeleteProduct}
                disabled={deleting}
              >
                {deleting ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
