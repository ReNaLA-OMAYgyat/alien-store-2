// src/components/Navbar.jsx
import React from "react";
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";
import { BsLightning, BsPerson, BsBag } from "react-icons/bs";
import { AiOutlineMenu, AiOutlineSearch, AiOutlineArrowRight } from "react-icons/ai";

export default function Navbar() {
  return (
    <div className="w-100 bg-primary text-white">

      {/* Top promo bar */}
      <div className="w-100 py-2 d-flex justify-content-center align-items-center bg-info">
        <BsLightning className="me-1" />
        <p className="mb-0 small">Hi, you're new here! Get 20% off card!</p>
      </div>

      {/* Main navbar */}
      <div className="container-fluid py-3 d-flex align-items-center">
        {/* Menu icon */}
        <div className="me-3 d-flex align-items-center">
          <AiOutlineMenu size={24} />
        </div>

        {/* Logo */}
        <div className="d-flex align-items-center me-4">
          <div className="bg-gradient rounded-circle d-flex align-items-center justify-content-center p-2 me-2" style={{ background: 'linear-gradient(to right, #a78bfa, #f9a8d4)' }}>
            <BsLightning className="text-white" />
          </div>
          <span className="fw-bold fs-4">Yofte.</span>
        </div>

        {/* Navigation buttons */}
        <div className="d-flex flex-grow-1 justify-content-center gap-2">
          <button className="btn btn-light btn-sm rounded-pill">CATEGORY</button>
          <button className="btn btn-light btn-sm rounded-pill">COLLECTION</button>
          <button className="btn btn-light btn-sm rounded-pill">STORY</button>
          <button className="btn btn-light btn-sm rounded-pill">BRAND</button>
        </div>

        {/* User & cart */}
        <div className="d-flex align-items-center ms-auto gap-3">
          <div className="position-relative">
            <BsBag size={24} />
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-circle bg-light text-primary p-1" style={{ fontSize: '0.6rem' }}>
              3
            </span>
          </div>
          <div className="d-flex align-items-center gap-1">
            <BsPerson />
            <span>Sign In</span>
          </div>
        </div>
      </div>

      {/* Search and social */}
      <div className="container-fluid bg-light py-3 d-flex align-items-center">
        <div className="d-flex align-items-center flex-grow-1 me-3">
          <label className="me-2 mb-0 text-dark">Search items:</label>
          <div className="input-group">
            <input type="text" className="form-control" placeholder="Search..." />
            <span className="input-group-text bg-white">
              <AiOutlineSearch />
            </span>
          </div>
        </div>

        <button className="btn btn-warning me-3">
          <AiOutlineArrowRight />
        </button>

        <div className="d-flex gap-2">
          <div className="btn btn-primary rounded-circle p-2"><FaFacebookF className="text-white" /></div>
          <div className="btn btn-primary rounded-circle p-2"><FaInstagram className="text-white" /></div>
          <div className="btn btn-primary rounded-circle p-2"><FaTwitter className="text-white" /></div>
        </div>
      </div>

    </div>
  );
}
