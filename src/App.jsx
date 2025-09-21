import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import Navbar from "./components/navbar";
import Beranda from "./pages/beranda";
import Daftar from "./pages/daftar";
import PrivateRouteAdmin from "./components/ProtecRoute";
import Product from "./pages/product";
import Cart from "./pages/cart";
import ErrorBoundary from "./ErrorBoundary";
import Admin from "./pages/admin";
import Reports from "./pages/reports";
import Orders from "./pages/orders";
import Customers from "./pages/customer";
import Settings from "./pages/setting";
export default function App() {
  const location = useLocation();

  return (
    <>
      {location.pathname !== "/login" &&
        location.pathname !== "/daftar" &&
        location.pathname !== "/dashboard" &&
        location.pathname !== "/product" && 
        location.pathname !== "/admin" && 
        location.pathname !== "/reports" && 
        location.pathname !== "/orders" && 
        location.pathname !== "/customer" && 
        location.pathname !== "/setting" && 
        <Navbar />}
      <Routes>
        <Route path="/" element={<Navigate to="/beranda" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/daftar" element={<Daftar />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRouteAdmin>
              <Dashboard />
            </PrivateRouteAdmin>
          }
        />
        <Route
          path="/product"
          element={
            <PrivateRouteAdmin>
              <Product />
            </PrivateRouteAdmin>
          }
        />
        <Route
          path="/setting"
          element={
            <PrivateRouteAdmin>
              <Settings />
            </PrivateRouteAdmin>
          }
        />
        <Route
          path="/admin"
          element={
            <PrivateRouteAdmin>
              <Admin />
            </PrivateRouteAdmin>
          }
        />
        <Route
          path="/reports"
          element={
            <PrivateRouteAdmin>
              <Reports />
            </PrivateRouteAdmin>
          }
        />
        <Route
          path="/orders"
          element={
            <PrivateRouteAdmin>
              <Orders />
            </PrivateRouteAdmin>
          }
        />
        <Route
          path="/customer"
          element={
            <PrivateRouteAdmin>
              <Customers />
            </PrivateRouteAdmin>
          }
        />
        <Route path="/cart" element={<Cart />} />
        <Route path="/beranda" element={<Beranda />} />

        <Route path="*" element={<Navigate to="/beranda" replace />} />
      </Routes>
    </>
  );
}
