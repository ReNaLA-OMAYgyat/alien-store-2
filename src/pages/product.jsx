import React, { useEffect, useState } from "react";
import api from "../api";
import Sidebar from "../components/sidebar.jsx";
import ProductModal from "../components/modalproduct.jsx";
import DetailProductModal from "../components/modaleditproduk.jsx";
import ModalShowDetail from "../components/modalshowproduk.jsx";


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
  const [showShowDetailModal, setShowShowDetailModal] = useState(false); // untuk show-only
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [productDetails, setProductDetails] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(null);


  // Delete
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchSubcategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/products");
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };
  const fetchProductDetail = async () => {
    try {
      const res = await api.get("/product-detail");
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSubcategories = async () => {
    try {
      const res = await api.get("/subcategories");
      setSubcategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const getSubcategoryName = (id) =>
    subcategories.find((s) => s.id === id)?.name || "-";

  // Filter & search
  const filteredProducts = Array.isArray(products)
    ? products.filter((p) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
          p.nama.toLowerCase().includes(q) ||
          p.merk.toLowerCase().includes(q) ||
          getSubcategoryName(p.subcategory_id).toLowerCase().includes(q) ||
          String(p.id).includes(q)
        );
      })
    : [];

  const subFiltered = subcategoryFilter
    ? filteredProducts.filter(
        (p) => String(p.subcategory_id) === String(subcategoryFilter)
      )
    : filteredProducts;

  // Sorting
  const sortedProducts = [...subFiltered].sort((a, b) => {
    const dir = sortConfig.direction === "asc" ? 1 : -1;
    let aVal, bVal;
    if (sortConfig.key === "nama") {
      aVal = a.nama.toLowerCase();
      bVal = b.nama.toLowerCase();
    } else if (sortConfig.key === "merk") {
      aVal = a.merk.toLowerCase();
      bVal = b.merk.toLowerCase();
    } else if (sortConfig.key === "subcategory") {
      aVal = getSubcategoryName(a.subcategory_id).toLowerCase();
      bVal = getSubcategoryName(b.subcategory_id).toLowerCase();
    } else {
      aVal = a.id;
      bVal = b.id;
    }
    if (aVal < bVal) return -1 * dir;
    if (aVal > bVal) return 1 * dir;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIdx = (safeCurrentPage - 1) * pageSize;
  const paginatedProducts = sortedProducts.slice(startIdx, startIdx + pageSize);
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

  // Delete product
  const requestDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      setDeleting(true);
      await api.delete(`/products/${productToDelete.id}`);
      setProductToDelete(null);
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus produk");
    } finally {
      setDeleting(false);
    }
  };

  // Export CSV
  const exportCsv = () => {
    const rows = [
      ["ID", "Nama", "Merk", "Harga", "Stok", "Subkategori"],
      ...sortedProducts.map((p) => [
        p.id,
        p.nama,
        p.merk,
        p.harga,
        p.stok,
        getSubcategoryName(p.subcategory_id),
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
    a.download = "products.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="d-flex vh-100">
      <Sidebar />
      <div className="flex-grow-1 bg-light p-4">
        <h2 className="fw-bold mb-4">Dashboard Produk</h2>

        <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-2 mb-3">
          <div className="d-flex gap-2">
            <button
              className="btn btn-success"
              onClick={() => {
                setSelectedProduct(null);
                setShowModal(true);
              }}
            >
              + Tambah Produk
            </button>
            <button
              className="btn btn-outline-secondary"
              onClick={exportCsv}
            >
              <i className="bi bi-download"></i> Export CSV
            </button>
          </div>

          <div className="d-flex gap-2 align-items-center">
            <div className="input-group">
              <span className="input-group-text bg-white">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Cari nama, merk, subkategori..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
              {searchQuery && (
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setSearchQuery("")}
                >
                  Bersihkan
                </button>
              )}
            </div>

            <select
              className="form-select form-select-sm"
              style={{ minWidth: 180 }}
              value={subcategoryFilter}
              onChange={(e) => {
                setSubcategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">Semua Subkategori</option>
              {subcategories.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            <div className="btn-group" role="group" aria-label="Density">
              <button
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
                className={`btn btn-sm ${
                  density === "compact" ? "btn-primary" : "btn-outline-primary"
                }`}
                onClick={() => setDensity("compact")}
              >
                Padat
              </button>
            </div>
          </div>
        </div>

        <div className="card shadow-sm p-3">
          <div className="text-secondary small mb-2">
            Menampilkan {paginatedProducts.length} dari {sortedProducts.length} hasil
          </div>

          <div className="table-responsive" style={{ maxHeight: 480 }}>
            <table
              className={`table table-bordered ${
                density === "compact" ? "table-sm" : ""
              } table-striped table-hover align-middle mb-0`}
            >
              <thead>
                <tr style={{ position: "sticky", top: 0, background: "#f8f9fa", zIndex: 1 }}>
                  <th role="button" onClick={() => handleSort("id")}>ID {renderSortIcon("id")}</th>
                  <th>Gambar</th>
                  <th role="button" onClick={() => handleSort("nama")}>Nama {renderSortIcon("nama")}</th>
                  <th role="button" onClick={() => handleSort("merk")}>Merk {renderSortIcon("merk")}</th>
                  <th>Harga</th>
                  <th>Stok</th>
                  <th role="button" onClick={() => handleSort("subcategory")}>Subkategori {renderSortIcon("subcategory")}</th>
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
                          <img src={p.image_url} alt={p.nama} className="rounded shadow-sm" style={{ width: 60, height: 60, objectFit: "cover" }}/>
                        ) : "-"}
                      </td>
                      <td>{p.nama}</td>
                      <td>{p.merk}</td>
                      <td>Rp {parseInt(p.harga).toLocaleString()}</td>
                      <td>{p.stok}</td>
                      <td>{getSubcategoryName(p.subcategory_id)}</td>
                      <td>
                        <div className="btn-group btn-group-sm">
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

  {/* CRUD Detail */}
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
  onClick={async () => {
    setSelectedProductId(p.id); // ✅ simpan ID produk
    setShowShowDetailModal(true);
  }}
>
  <i className="bi bi-card-list"></i>
</button>


</div>




                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-4">Tidak ada produk</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mt-3">
            <div className="d-flex align-items-center gap-2">
              <span className="text-secondary small">Tampilan</span>
              <select
                className="form-select form-select-sm"
                style={{ width: 80 }}
                value={pageSize}
                onChange={(e) => { setPageSize(parseInt(e.target.value)); setCurrentPage(1); }}
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
                  <button className="page-link" onClick={() => setCurrentPage((p) => Math.max(1, p-1))}>Sebelumnya</button>
                </li>
                {pageNumbers.map((p) => (
                  <li key={p} className={`page-item ${p === safeCurrentPage ? "active" : ""}`}>
                    <button className="page-link" onClick={() => setCurrentPage(p)}>{p}</button>
                  </li>
                ))}
                <li className={`page-item ${safeCurrentPage === totalPages ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setCurrentPage((p) => Math.min(totalPages, p+1))}>Berikutnya</button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
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
    productDetail={selectedProduct} // produk yg dipilih
    products={products}
  />
)}

<ModalShowDetail
  show={showShowDetailModal}
  onClose={() => setShowShowDetailModal(false)}
  productId={selectedProductId}
/>






      {/* Delete Confirmation */}
      {productToDelete && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: "rgba(0,0,0,0.5)", zIndex: 1060 }}>
          <div className="bg-white rounded shadow" style={{ width: 460 }}>
            <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
              <h5 className="m-0">Hapus Produk</h5>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setProductToDelete(null)}>✕</button>
            </div>
            <div className="p-3">
              Yakin ingin menghapus <strong>{productToDelete.nama}</strong>?
            </div>
            <div className="p-3 d-flex justify-content-end gap-2 border-top">
              <button className="btn btn-outline-secondary" onClick={() => setProductToDelete(null)} disabled={deleting}>Batal</button>
              <button className="btn btn-danger" onClick={requestDeleteProduct} disabled={deleting}>{deleting ? "Menghapus..." : "Hapus"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
