// src/components/Footer.jsx
import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
} from "react-bootstrap-icons"; // Bootstrap Icons

export default function Footer() {
  return (
    <footer className="bg-dark text-light pt-5 pb-3 mt-5">
      <div className="container">
        <div className="row">
          {/* Logo + Deskripsi */}
          <div className="col-md-3 mb-4">
            <h4 className="fw-bold">AlienStore</h4>
            <p className="small">
              Belanja mudah dan aman bersama AlienSore. Produk original & harga
              terbaik untuk kebutuhan Anda.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-md-2 mb-4">
            <h6 className="fw-bold">Quick Links</h6>
            <ul className="list-unstyled small">
              <li><a href="/" className="text-decoration-none text-light">Home</a></li>
              <li><a href="/cart" className="text-decoration-none text-light">Carts</a></li>
             </ul>
          </div>

          {/* Customer Service */}
          <div className="col-md-3 mb-4">
            <h6 className="fw-bold">Customer Service</h6>
            <ul className="list-unstyled small">
              <li><a href="/faq" className="text-decoration-none text-light">FAQ</a></li>
              <li><a href="/returns" className="text-decoration-none text-light">Pengembalian</a></li>
              <li><a href="/terms" className="text-decoration-none text-light">Syarat & Ketentuan</a></li>
              <li><a href="/privacy" className="text-decoration-none text-light">Kebijakan Privasi</a></li>
            </ul>
          </div>

          {/* Kontak & Sosmed */}
          <div className="col-md-4 mb-4">
            <h6 className="fw-bold">Kontak Kami</h6>
            <p className="small mb-1">Email: support@alienstore.com</p>
            <p className="small mb-1">Telp: +62 812-3456-7890</p>
            <p className="small">Alamat: Jakarta, Indonesia</p>
            <div className="d-flex gap-3">
              <a href="#" className="text-light fs-5"><Facebook /></a>
              <a href="#" className="text-light fs-5"><Instagram /></a>
              <a href="#" className="text-light fs-5"><Twitter /></a>
              <a href="#" className="text-light fs-5"><Youtube /></a>
            </div>
          </div>
        </div>

        <hr className="border-light" />
        <div className="text-center small">
          © 2025 AlienStore. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
