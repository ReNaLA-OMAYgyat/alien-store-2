import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import mascotImg from "../assets/images/Branding/MaskotAlienStore.png";
import logoImg from "../assets/images/Branding/alienStoreLogo_noBrand.png";

export default function Daftar() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role_id] = useState(2);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: string }

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (password !== confirmPassword) {
      setErrors({ password: ["Password dan Konfirmasi Password tidak cocok!"] });
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/register", {
        name: nama,
        email,
        password,
        password_confirmation: confirmPassword,
        role_id,
      });

      setMessage({ type: "success", text: res.data?.message || "Daftar berhasil!" });
      // Redirect to login after a short delay
      setTimeout(() => navigate("/login"), 800);
    } catch (err) {
      console.error("Register error:", err);
      if (!err.response) {
        const backendHint = import.meta.env.VITE_API_BASE_URL || "http://alienstore.test/api";
        setMessage({ type: "error", text: `Tidak dapat terhubung ke server. Pastikan backend berjalan di ${backendHint}.` });
        return;
      }

      if (err.response?.status === 422) {
        // Backend returns validation errors as a flat object (not nested under `errors`)
        const verrors = err.response.data;
        setErrors(verrors || {});
        const texts = Object.values(verrors || {}).map(arr => Array.isArray(arr) ? arr[0] : String(arr));
        setMessage({ type: "error", text: texts.join("\n") || "Periksa kembali input Anda." });
      } else {
        setMessage({ type: "error", text: err.response?.data?.message || "Terjadi kesalahan, coba lagi." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid auth-bg" style={{ minHeight: "100vh" }}>
      <div className="row g-0 min-vh-100 align-items-center">
        {/* Illustration / Mascot */}
        <div className="col-lg-6 d-none d-lg-flex justify-content-center">
          <div className="p-5 w-100 d-flex justify-content-center align-items-center" style={{ maxWidth: 900 }}>
            <img src={mascotImg} alt="AlienStore Mascot" className="img-fluid" style={{ objectFit: "contain", maxHeight: "75vh", width: "100%" }} />
          </div>
        </div>

        {/* Form Card */}
        <div className="col-12 col-lg-6 d-flex justify-content-center">
          <div className="card shadow-lg border-0 p-4 my-5" style={{ width: "100%", maxWidth: 430, borderRadius: 16, backgroundColor: "#111827", color: "#e5e7eb" }}>
            {/* Logo */}
            <div className="text-center mb-3">
              <img src={logoImg} alt="AlienStore" style={{ height: 110 }} />
            </div>

            <h3 className="fw-semibold mb-2 text-white">Create account</h3>
            {message && (
              <div className={`alert ${message.type === "error" ? "alert-danger" : "alert-success"} py-2`} role="status">
                {message.text}
              </div>
            )}

            {/* Social Row */}
            <div className="d-flex gap-2 mb-3">
              <button type="button" className="btn btn-outline-light flex-fill" style={{ background: "#1f2937", borderColor: "#374151" }}>
                <i className="bi bi-facebook me-2"></i> Facebook
              </button>
              <button type="button" className="btn btn-outline-light flex-fill" style={{ background: "#1f2937", borderColor: "#374151" }}>
                <i className="bi bi-twitter-x me-2"></i> Twitter
              </button>
              <button type="button" className="btn btn-outline-light flex-fill" style={{ background: "#1f2937", borderColor: "#374151" }}>
                <i className="bi bi-linkedin me-2"></i> LinkedIn
              </button>
            </div>

            <div className="hr-text mb-3"><span>Or</span></div>

            <form onSubmit={handleRegister}>
              {/* Name */}
              <div className="mb-3">
                <label htmlFor="nama" className="form-label">Full name</label>
                <input
                  type="text"
                  className={`form-control ${errors.name ? "is-invalid" : ""}`}
                  id="nama"
                  placeholder="Your full name"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  required
                  autoComplete="name"
                  disabled={loading}
                  style={{ background: "#111827", borderColor: "#374151", color: "#e5e7eb" }}
                />
                {errors.name && <div className="invalid-feedback d-block">{errors.name[0]}</div>}
              </div>

              {/* Email */}
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email address</label>
                <input
                  type="email"
                  className={`form-control ${errors.email ? "is-invalid" : ""}`}
                  id="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  inputMode="email"
                  disabled={loading}
                  style={{ background: "#111827", borderColor: "#374151", color: "#e5e7eb" }}
                />
                {errors.email && <div className="invalid-feedback d-block">{errors.email[0]}</div>}
              </div>

              {/* Password */}
              <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <div className="input-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`form-control ${errors.password ? "is-invalid" : ""}`}
                    id="password"
                    placeholder="Create password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    disabled={loading}
                    style={{ background: "#111827", borderColor: "#374151", color: "#e5e7eb" }}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowPassword((p) => !p)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    title={showPassword ? "Hide password" : "Show password"}
                    disabled={loading}
                  >
                    <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                  </button>
                </div>
                {errors.password && <div className="invalid-feedback d-block">{errors.password[0]}</div>}
              </div>

              {/* Confirm Password */}
              <div className="mb-3">
                <label htmlFor="confirm" className="form-label">Confirm password</label>
                <div className="input-group">
                  <input
                    type={showConfirm ? "text" : "password"}
                    className="form-control"
                    id="confirm"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    disabled={loading}
                    style={{ background: "#111827", borderColor: "#374151", color: "#e5e7eb" }}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowConfirm((p) => !p)}
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                    aria-pressed={showConfirm}
                    title={showConfirm ? "Hide password" : "Show password"}
                    disabled={loading}
                  >
                    <i className={`bi ${showConfirm ? "bi-eye-slash" : "bi-eye"}`}></i>
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Creating account...
                  </>
                ) : (
                  "REGISTER"
                )}
              </button>
            </form>

            <div className="text-center mt-3">
              <span className="text-muted me-1">Already have an account?</span>
              <Link to="/login" style={{ color: "#93c5fd" }}>Login</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
