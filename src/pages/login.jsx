import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import mascotImg from "../assets/images/Branding/MaskotAlienStore.png";
import logoImg from "../assets/images/Branding/alienStoreLogo_noBrand.png";

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: string }

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const res = await api.post("/login", {
        email,
        password,
      });

      const storage = remember ? localStorage : sessionStorage;
      storage.setItem("token", res.data.token);
      storage.setItem("role", res.data.role);
      storage.setItem("user", JSON.stringify(res.data.user)); 
      // keep the other storage clean if toggled
      const other = remember ? sessionStorage : localStorage;
      other.removeItem("token");
      other.removeItem("role");
      other.removeItem("user"); 
      // Trigger custom event untuk update navbar
      window.dispatchEvent(
        new CustomEvent("userLogin", {
          detail: { role: res.data.role,user: res.data.user },
        })
      );

      setMessage({ type: "success", text: res.data.message || "Login berhasil." });

      // redirect sesuai role
      if (res.data.role === "Admin") {
        navigate("/dashboard"); // halaman admin
      } else if (res.data.role === "User") {
        navigate("/beranda"); // halaman user
      } else {
        navigate("/login");
      }
    } catch (err) {
      console.error("Error Response:", err.response?.data);

      if (err.response?.status === 422) {
        const errors = err.response.data;
        let messages = [];
        for (let field in errors) {
          messages.push(errors[field][0]);
        }
        setMessage({ type: "error", text: messages.join("\n") });
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

            <h3 className="fw-semibold mb-2 text-white">Sign in</h3>
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

            <form onSubmit={handleLogin}>
              {/* Email */}
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email address</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  inputMode="email"
                  autoFocus
                  disabled={loading}
                  style={{ background: "#111827", borderColor: "#374151", color: "#e5e7eb" }}
                />
              </div>

              {/* Password */}
              <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <div className="input-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    id="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
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
              </div>

              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="remember" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                  <label className="form-check-label" htmlFor="remember">Remember me</label>
                </div>
                <Link className="text-decoration-none" to="#" style={{ color: "#93c5fd" }}>Forgot password?</Link>
              </div>

              <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Logging in...
                  </>
                ) : (
                  "LOGIN"
                )}
              </button>
            </form>

            <div className="text-center mt-3">
              <span className="text-muted me-1">Don't have an account?</span>
              <Link to="/daftar" style={{ color: "#93c5fd" }}>Register</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
