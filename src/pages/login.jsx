import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/login", {
        email: email,
        password: password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      // Trigger custom event untuk update navbar
      window.dispatchEvent(
        new CustomEvent("userLogin", {
          detail: { role: res.data.role },
        })
      );

      alert(res.data.message);

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
        alert(messages.join("\n"));
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
          maxWidth: "400px",
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
            style={{
              width: "105px",
              padding: "10px",
            }}
          />
        </div>

        <h2 className="text-center mb-4 fw-bold text-primary">AlienStore</h2>
        <form onSubmit={handleLogin}>
          {/* Email */}
          <div className="mb-3">
            <label htmlFor="email" className="form-label fw-semibold">
              Email
            </label>
            <input
              type="email"
              className="form-control p-3 btn btn-outline-dark"
              id="email"
              placeholder="admin123@email.com"
              value={email} // <-- tambahin ini
              onChange={(e) => setEmail(e.target.value)} // <-- tambahin ini
              required
              style={{ borderRadius: "12px" }}
            />
          </div>

          {/* Password */}
          <div className="mb-3">
            <label htmlFor="password" className="form-label fw-semibold">
              Password
            </label>
            <div className="input-group">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control p-3 btn btn-outline-dark"
                id="password"
                placeholder="Masukkan password"
                value={password} // <-- tambahin ini
                onChange={(e) => setPassword(e.target.value)} // <-- tambahin ini
                required
                style={{ borderRadius: "12px 0 0 12px" }}
              />
              <button
                type="button"
                className="btn btn-outline-dark"
                onClick={() => setShowPassword((prev) => !prev)}
                style={{ borderRadius: "0 12px 12px 0" }}
              >
                <i
                  className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}
                ></i>
              </button>
            </div>
          </div>

          {/* Button Login */}
          <button
            type="submit"
            className="btn btn-primary w-100 p-3 fw-semibold"
            style={{ borderRadius: "12px" }}
          >
            Login
          </button>
        </form>

        {/* Footer */}
        <p className="text-center mt-4 mb-0 text-muted">
          Belum punya akun? <Link to="/daftar">Daftar</Link>
        </p>
      </div>
      <style>{`
    .form-control:focus {
      box-shadow: 0 0 0 2px #0d6efd33;
      border-color: #0d6efd;
    }
    .btn-primary:hover {
      background: #0b5ed7;
    }
  `}</style>
    </div>
  );
}
