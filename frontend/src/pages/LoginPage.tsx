import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loginWithGoogle = () => {
    window.location.href = "http://localhost:4000/auth/google";
  };

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/auth/local/login", { email, password });
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logoCircle}>R</div>
          <h1 style={styles.title}>Welcome back</h1>
          <p style={styles.subtitle}>
            Login to access your ReachInbox scheduler dashboard
          </p>
        </div>

        {/* Google Login */}
        <button style={styles.googleBtn} onClick={loginWithGoogle}>
          <div style={styles.googleIcon}>G</div>
          <span style={styles.googleText}>Continue with Google</span>
        </button>

        <div style={styles.dividerRow}>
          <div style={styles.line} />
          <span style={styles.dividerText}>or</span>
          <div style={styles.line} />
        </div>

        {/* Email Login */}
        <form style={{ ...styles.form, ...styles.formWrap }} onSubmit={handleLogin}>
          <label style={styles.label}>Email</label>
          <input
            style={styles.input}
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label style={{ ...styles.label, marginTop: 14 }}>Password</label>
          <input
            style={styles.input}
            placeholder="Enter your password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p style={styles.errorText}>{error}</p>}

          <button
            type="submit"
            style={{
              ...styles.loginBtn,
              opacity: loading ? 0.8 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p style={styles.helperText}>
            Don’t have an account?{" "}
            <Link to="/register" style={styles.link}>
              Create account
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

  googleBtn: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid rgba(0,0,0,0.08)",
    background: "#ffffff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    fontWeight: 800,
    transition: "0.2s ease",
    boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
  },

  googleIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    display: "grid",
    placeItems: "center",
    background: "#f3f4f6",
    fontWeight: 900,
    color: "#111827",
  },

  googleText: {
    fontSize: 14.5,
    color: "#111827",
  },

  dividerRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    margin: "18px 0",
  },

  line: { height: 1, background: "rgba(0,0,0,0.10)", flex: 1 },

  dividerText: {
    fontSize: 12,
    color: "#9ca3af",
    fontWeight: 800,
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

  loginBtn: {
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
