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
import AboutPage from "./pages/about";
import Orders from "./pages/orders";
import Customers from "./pages/customers";
import Reports from "./pages/reports";
import PaymentSuccess from "./pages/payment-success";
export default function App() {
  const location = useLocation();

  return (
    <>
      {location.pathname !== "/login" &&
        location.pathname !== "/daftar" &&
        location.pathname !== "/dashboard" &&
        location.pathname !== "/product" && 
        location.pathname !== "/admin" && 
        location.pathname !== "/orders" && 
        location.pathname !== "/customers" && 
        location.pathname !== "/reports" && 
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
          path="/orders"
          element={
            <PrivateRouteAdmin>
              <Orders />
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
          path="/customers"
          element={
            <PrivateRouteAdmin>
              <Customers />
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
          path="/admin"
          element={
            <PrivateRouteAdmin>
              <Admin />
            </PrivateRouteAdmin>
          }
        />
        <Route path="/cart" element={<Cart />} />
        <Route path="/beranda" element={<Beranda />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/payment/success/:orderId" element={<PaymentSuccess />} />

        <Route path="*" element={<Navigate to="/beranda" replace />} />
      </Routes>
    </>
  );
}
