import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/auth/local/register", { name, email, password });
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoCircle}>R</div>
          <h1 style={styles.title}>Create account</h1>
          <p style={styles.subtitle}>
            Register with email/password or use Google login
          </p>
        </div>

        <form style={{ ...styles.form, ...styles.formWrap }} onSubmit={handleRegister}>
          <label style={styles.label}>Full name</label>
          <input
            style={styles.input}
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label style={{ ...styles.label, marginTop: 14 }}>Email</label>
          <input
            style={styles.input}
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label style={{ ...styles.label, marginTop: 14 }}>Password</label>
          <input
            style={styles.input}
            placeholder="Create a password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p style={styles.errorText}>{error}</p>}

          <button
            type="submit"
            style={{
              ...styles.registerBtn,
              opacity: loading ? 0.8 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Account"}
          </button>

          <p style={styles.helperText}>
            Already have an account?{" "}
            <Link to="/login" style={styles.link}>
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: 20,
    background:
      "radial-gradient(circle at top, rgba(34,197,94,0.15), transparent 40%), linear-gradient(180deg, #ffffff, #f6f7fb)",
    fontFamily:
      "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
  },

  card: {
    width: "100%",
    maxWidth: 460,
    background: "#fff",
    borderRadius: 22,
    border: "1px solid rgba(0,0,0,0.06)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
    padding: 34,
  },

  header: { textAlign: "center", marginBottom: 18 },

  logoCircle: {
    width: 46,
    height: 46,
    borderRadius: "50%",
    margin: "0 auto 10px auto",
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
    color: "#16a34a",
    background: "rgba(34,197,94,0.12)",
    border: "1px solid rgba(34,197,94,0.25)",
  },

  title: {
    margin: 0,
    fontSize: 28,
    fontWeight: 900,
    letterSpacing: "-0.6px",
    color: "#111827",
  },

  subtitle: {
    margin: "8px 0 0 0",
    fontSize: 13.5,
    color: "#6b7280",
    lineHeight: 1.4,
  },

  form: { display: "flex", flexDirection: "column" },

  formWrap: { paddingLeft: 8, paddingRight: 8 },

  label: {
    fontSize: 12.5,
    fontWeight: 800,
    color: "#111827",
    marginBottom: 6,
  },

  input: {
    width: "100%",
    padding: "13px 14px",
    borderRadius: 14,
    border: "1px solid rgba(0,0,0,0.10)",
    outline: "none",
    fontSize: 14,
    background: "#f9fafb",
  },

  errorText: {
    marginTop: 10,
    fontSize: 12.5,
    fontWeight: 700,
    color: "#dc2626",
  },

  registerBtn: {
    marginTop: 16,
    width: "100%",
    height: 48,
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(180deg, #22c55e, #16a34a)",
    color: "#fff",
    fontWeight: 900,
    fontSize: 15,
    transition: "0.2s ease",
    boxShadow: "0 10px 18px rgba(22,163,74,0.18)",
  },

  helperText: {
    marginTop: 12,
    fontSize: 12.5,
    color: "#6b7280",
    textAlign: "center",
  },

  link: {
    color: "#16a34a",
    fontWeight: 900,
    textDecoration: "none",
  },
};
