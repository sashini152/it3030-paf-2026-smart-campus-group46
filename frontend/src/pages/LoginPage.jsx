import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { postJson } from "../api/client";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.email.trim() || !form.password.trim()) {
      setError("Please enter email and password");
      return;
    }

    try {
      setLoading(true);
      const data = await postJson("/api/auth/login", {
        email: form.email.trim(),
        password: form.password,
      });
      login(data);
      navigate("/");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="hub-app hub-app--auth">
      <main className="hub-main">
        <div className="hub-auth-card hub-auth-card--playful">
          <div className="hub-auth-hero">
            <h1>Welcome back</h1>
            <p className="hub-lead">
              Sign in to access your account, notifications, and role-based
              Smart Campus services.
            </p>
            <div className="hub-auth-pills">
              <span>Resources</span>
              <span>Bookings</span>
              <span>Tickets</span>
            </div>
          </div>

          <div className="hub-auth-panel">
            <div className="hub-auth-panel__orb"></div>
            <h2>Sign in</h2>

            <form onSubmit={handleSubmit}>
              <div className="hub-field">
                <span>Email</span>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              <div className="hub-field">
                <span>Password</span>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                />
              </div>

              {error && <p className="hub-alert hub-alert--error">{error}</p>}

              <div className="hub-auth-actions">
                <button
                  type="submit"
                  className="hub-btn hub-btn--primary"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>
              </div>

              <div className="hub-auth-divider">
                <span>or</span>
              </div>

              <div className="hub-auth-actions">
                <a
                  href="http://localhost:8081/oauth2/authorization/google"
                  className="hub-btn hub-btn--google hub-btn--full"
                >
                  <svg className="hub-btn__icon" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </a>
              </div>
            </form>

            <p className="hub-auth-note">
              Don't have an account? <Link to="/register">Create account</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
