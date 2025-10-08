import { Navigate } from "react-router-dom";

export default function PrivateRouteAdmin({ children }) {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const role = localStorage.getItem("role") || sessionStorage.getItem("role");

  // Kalau belum login atau bukan admin, paksa ke beranda
  if (!token || role !== "Admin") {
    return <Navigate to="/beranda" replace />;
  }
  
  // Kalau admin, render halaman yang diminta
  return children;
}
