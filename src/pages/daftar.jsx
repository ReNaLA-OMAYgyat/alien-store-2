import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

export default function Daftar() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role_id] = useState(2);
  const [errors, setErrors] = useState({}); // state untuk error

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setErrors({ password: ["Password dan Konfirmasi Password tidak cocok!"] });
      return;
    }

    try {
      await api.post("/register", {
        name: nama,
        email: email,
        password: password,
        password_confirmation: confirmPassword,
        role_id: role_id,
      });

      alert("Daftar berhasil!");
      navigate("/login");
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors); // tangkap error validasi Laravel
      } else {
        alert(err.response?.data?.message || "Terjadi kesalahan, coba lagi.");
      }
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        background: "linear-gradient(135deg, #2a55e2ff 50%, #f0fdfa 50%)",
      }}
    >
      <div
        className="card shadow-lg border-0 p-4 animate__animated animate__fadeInUp"
        style={{
          width: "100%",
          maxWidth: "370px",
          borderRadius: "20px",
          position: "relative",
          paddingTop: "60px",
        }}
      >
        {/* Logo */}
        <div
          style={{
            position: "absolute",
            top: "-45px",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <img
            src="/contoh.png"
            alt="Logo"
            className="mx-auto d-block mb-7"
            style={{ width: "105px", padding: "10px" }}
          />
        </div>

        <h2 className="text-center mb-4 fw-bold text-primary">Daftar Akun</h2>
        <form onSubmit={handleRegister}>
          {/* Nama */}
          <div className="mb-3">
            <label htmlFor="nama" className="form-label fw-semibold">
              Nama Lengkap
            </label>
            <input
              type="text"
              className={`form-control p-3 btn btn-outline-dark ${
                errors.name ? "is-invalid" : ""
              }`}
              id="nama"
              placeholder="Nama lengkap"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              required
            />
            {errors.name && (
              <div className="invalid-feedback">{errors.name[0]}</div>
            )}
          </div>

          {/* Email */}
          <div className="mb-3">
            <label htmlFor="email" className="form-label fw-semibold">
              Email
            </label>
            <input
              type="email"
              className={`form-control p-3 btn btn-outline-dark ${
                errors.email ? "is-invalid" : ""
              }`}
              id="email"
              placeholder="email@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {errors.email && (
              <div className="invalid-feedback">{errors.email[0]}</div>
            )}
          </div>

          {/* Password */}
          <div className="mb-3">
            <label htmlFor="password" className="form-label fw-semibold">
              Password
            </label>
            <div className="input-group">
              <input
                type={showPassword ? "text" : "password"}
                className={`form-control p-3 btn btn-outline-dark ${
                  errors.password ? "is-invalid" : ""
                }`}
                id="password"
                placeholder="Buat password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="btn btn-outline-dark"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                <i
                  className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}
                ></i>
              </button>
            </div>
            {errors.password && (
              <div className="invalid-feedback d-block">
                {errors.password[0]}
              </div>
            )}
          </div>

          {/* Konfirmasi Password */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Konfirmasi Password</label>
            <div className="input-group">
              <input
                type={showConfirm ? "text" : "password"}
                className="form-control p-3 btn btn-outline-dark"
                placeholder="Ulangi password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="btn btn-outline-dark"
                onClick={() => setShowConfirm((prev) => !prev)}
              >
                <i
                  className={`bi ${showConfirm ? "bi-eye-slash" : "bi-eye"}`}
                ></i>
              </button>
            </div>
          </div>

          {/* Button Daftar */}
          <button
            type="submit"
            className="btn btn-primary w-100 p-3 fw-semibold"
            style={{ borderRadius: "12px" }}
          >
            Daftar
          </button>
        </form>

        {/* Footer */}
        <p className="text-center mt-4 mb-0 text-muted">
          Sudah punya akun? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
