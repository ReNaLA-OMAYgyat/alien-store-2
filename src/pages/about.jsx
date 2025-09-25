import React from "react";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="fw-bold text-center mb-3">Tentang Alien Store</h1>
            <p className="text-muted text-center mb-4">
              Misi kami adalah memudahkan belanja harian dengan pengalaman cepat, aman, dan menyenangkan.
            </p>
          </motion.div>

          <div className="row g-4" data-aos="fade-up">
            <div className="col-12 col-md-4">
              <div className="p-4 border rounded h-100 text-center">
                <h5 className="fw-semibold">Cepat</h5>
                <p className="mb-0">Pengiriman dan proses checkout yang ringkas.</p>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="p-4 border rounded h-100 text-center">
                <h5 className="fw-semibold">Aman</h5>
                <p className="mb-0">Pembayaran aman dan data terlindungi.</p>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="p-4 border rounded h-100 text-center">
                <h5 className="fw-semibold">Terjangkau</h5>
                <p className="mb-0">Harga kompetitif dengan promo menarik.</p>
              </div>
            </div>
          </div>

          <div className="mt-5" data-aos="fade-up" data-aos-delay="150">
            <div className="p-4 p-md-5 bg-light rounded">
              <h4 className="fw-semibold mb-2">Hubungi Kami</h4>
              <p className="mb-0">Email: support@alien-store.test</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
