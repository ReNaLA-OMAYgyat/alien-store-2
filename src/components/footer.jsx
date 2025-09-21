// src/components/Footer.jsx
import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./footer.css"; // css custom

export default function Footer() {
  return (
    <footer className="footer text-white pt-5 pb-3 mt-5">
      <div className="container">
        <div className="row">
          {/* Brand */}
          <div className="col-md-4 mb-4">
            <h4 className="fw-bold">AlienStore</h4>
            <p className="small text-light">
              Solusi belanja online modern dengan harga terjangkau dan layanan
              terbaik untuk kebutuhan sehari-hari Anda.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-md-2 mb-4">
            <h6 className="fw-bold">Menu</h6>
            <ul className="list-unstyled">
              <li><a href="/beranda">Beranda</a></li>

            </ul>
          </div>

          {/* Support */}
          <div className="col-md-3 mb-4">
            <h6 className="fw-bold">Bantuan</h6>
            <ul className="list-unstyled">
              <li><a href="#">FAQ</a></li>
              <li><a href="#">Kebijakan Privasi</a></li>
              <li><a href="#">Syarat & Ketentuan</a></li>
              <li><a href="/contact">Kontak Kami</a></li>
            </ul>
          </div>

          {/* Contact & Sosial Media */}
          <div className="col-md-3 mb-4">
            <h6 className="fw-bold">Hubungi Kami</h6>
            <p className="small mb-1">Email: support@alienstore.com</p>
            <p className="small mb-3">Telp: +62 881 0221 19170</p>
            <div className="d-flex gap-3">
              <a href="#"><i className="bi bi-facebook fs-5"></i></a>
              <a href="#"><i className="bi bi-instagram fs-5"></i></a>
              <a href="#"><i className="bi bi-twitter fs-5"></i></a>
              <a href="#"><i className="bi bi-whatsapp fs-5"></i></a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-light" />

        {/* Copyright */}
        <div className="text-center small">
          © {new Date().getFullYear()} AlienStore. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
