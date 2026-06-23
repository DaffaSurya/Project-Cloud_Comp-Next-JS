"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { registerSuperAdminAction } from "@/app/actions";
import "./login.css";

export default function LoginPage() {
  const router = useRouter();
  
  // Auth state
  const [email, setEmail] = useState("r.admin@kampus.ac.id");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Help / Registration Modal state
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  // Check if session already exists
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push("/");
      }
    };
    checkUser();
  }, [router]);

  // Handle standard login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw authError;
      }

      setSuccess("Login berhasil! Mengalihkan ke dashboard...");
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Gagal masuk. Silakan periksa kredensial Anda.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Kampus SSO mock login
  const handleSSOLogin = () => {
    setLoading(true);
    setError(null);
    setSuccess("Menghubungkan ke SSO Kampus...");
    
    // Simulate SSO success and redirect
    setTimeout(async () => {
      // Create or get a mock user session for developers to easily preview the app
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Sign in with default user or mock user if exists, or show notification
        setError("SSO Kampus memerlukan pendaftaran awal. Silakan gunakan kredensial email admin.");
        setLoading(false);
      } else {
        router.push("/");
      }
    }, 1200);
  };

  // Handle registering a new admin
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegLoading(true);
    setRegError(null);
    setRegSuccess(null);

    try {
      const formData = new FormData();
      formData.append("email", regEmail);
      formData.append("password", regPassword);

      const result = await registerSuperAdminAction(formData);

      if (result.error) {
        throw new Error(result.error);
      }

      setRegSuccess("Superadmin berhasil didaftarkan! Silakan masuk dengan akun ini.");
      setEmail(regEmail);
      setPassword(regPassword);
      // Auto close help modal after success
      setTimeout(() => {
        setShowHelpModal(false);
        setRegEmail("");
        setRegPassword("");
        setRegSuccess(null);
      }, 2000);
    } catch (err: any) {
      console.error("Registration error:", err);
      setRegError(err.message || "Terjadi kesalahan saat registrasi.");
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* LEFT PANEL: Visual Banner */}
      <div className="login-left">
        {/* Brand Logo Header */}
        <div className="login-brand">
          <div className="login-brand-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" fill="var(--open)" stroke="var(--open)" />
            </svg>
          </div>
          <div className="login-brand-text">
            <span className="login-brand-sub">DIREKTORI • KAMPUS</span>
            <span className="login-brand-main">Map Directory • Admin</span>
          </div>
        </div>

        {/* Left Content Body */}
        <div className="login-left-body">
          <div className="login-left-badge">
            <span className="badge-dot"></span>
            <span>PANEL INTERNAL • V1.0</span>
          </div>
          <h1 className="login-left-title">
            Kelola unit, gedung, dan <span className="accent">kategori kampus</span>.
          </h1>
          <p className="login-left-desc">
            Masuk untuk memperbarui data direktori yang dipakai aplikasi Android — foto, koordinat, jam layanan, dan lantai.
          </p>

          {/* Visual Map Canvas Grid Mockup */}
          <div className="map-visual-box">
            <div className="map-visual-header">
              <span>SINKRON TERAKHIR</span>
              <span>17 Mei • 09:14</span>
            </div>
            
            <div className="map-visual-canvas">
              {/* Dotted Grid and Map Paths SVGs */}
              <svg width="100%" height="100%" viewBox="0 0 400 180" xmlns="http://www.w3.org/2000/svg">
                {/* Grid Pattern */}
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <rect width="20" height="20" fill="none" />
                    <circle cx="1" cy="1" r="1" fill="rgba(255, 255, 255, 0.04)" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* Curved Dashed Paths */}
                <path d="M 50 140 Q 150 90 200 120 T 350 70" fill="none" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1.5" strokeDasharray="4 6" />
                <path d="M 120 40 Q 200 150 280 80 T 320 150" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1.5" strokeDasharray="3 5" />

                {/* Map Node Buildings */}
                {/* Node 1 */}
                <g transform="translate(130, 65)">
                  <rect x="-18" y="-12" width="36" height="24" rx="4" fill="#0d1210" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1" />
                  <circle cx="0" cy="0" r="12" fill="rgba(29, 156, 73, 0.12)" />
                  <circle cx="0" cy="0" r="4" fill="var(--open)" />
                </g>
                
                {/* Node 2 */}
                <g transform="translate(210, 105)">
                  <rect x="-18" y="-12" width="36" height="24" rx="4" fill="#0d1210" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1" />
                  <circle cx="0" cy="0" r="12" fill="rgba(29, 156, 73, 0.12)" />
                  <circle cx="0" cy="0" r="4" fill="var(--open)" />
                </g>

                {/* Node 3 */}
                <g transform="translate(300, 80)">
                  <rect x="-18" y="-12" width="36" height="24" rx="4" fill="#0d1210" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1" />
                  <circle cx="0" cy="0" r="12" fill="rgba(29, 156, 73, 0.12)" />
                  <circle cx="0" cy="0" r="4" fill="var(--open)" />
                </g>

                {/* Node 4 */}
                <g transform="translate(150, 130)">
                  <rect x="-18" y="-12" width="36" height="24" rx="4" fill="#0d1210" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1" />
                  <circle cx="0" cy="0" r="12" fill="rgba(29, 156, 73, 0.12)" />
                  <circle cx="0" cy="0" r="4" fill="var(--open)" />
                </g>

                {/* Node 5 */}
                <g transform="translate(280, 140)">
                  <rect x="-18" y="-12" width="36" height="24" rx="4" fill="#0d1210" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1" />
                  <circle cx="0" cy="0" r="12" fill="rgba(29, 156, 73, 0.12)" />
                  <circle cx="0" cy="0" r="4" fill="var(--open)" />
                </g>

                {/* Large White Pin Locator Icon */}
                <g transform="translate(232, 90)">
                  {/* Drop Shadow Ring */}
                  <circle cx="0" cy="8" r="8" fill="rgba(0, 0, 0, 0.4)" filter="blur(2px)" />
                  {/* Pin Body */}
                  <path d="M 0 0 C -7 -7 -10 -12 -10 -17 C -10 -23 -5 -28 0 -28 C 5 -28 10 -23 10 -17 C 10 -12 7 -7 0 0 Z" fill="#ffffff" stroke="rgba(0, 0, 0, 0.2)" strokeWidth="1" />
                  {/* Center Green Circle */}
                  <circle cx="0" cy="-17" r="4.5" fill="var(--open)" />
                </g>
              </svg>
            </div>

            <div className="map-visual-footer">
              <div className="map-visual-stats">
                <span>9 unit</span>
                <span>6 gedung</span>
                <span>6 kategori</span>
              </div>
              <div className="map-visual-status">
                <span className="map-visual-status-dot"></span>
                <span>API online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Left Footer (Empty for spacing aligning with mockup) */}
        <div></div>
      </div>

      {/* RIGHT PANEL: Login Form */}
      <div className="login-right">
        {/* Right Top Info Header */}
        <div className="login-right-header">
          <span className="login-right-domain">kampus.ac.id/admin</span>
          <button 
            className="btn-help" 
            onClick={() => {
              setShowHelpModal(!showHelpModal);
              // Clear previous messages
              setRegError(null);
              setRegSuccess(null);
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <span>Butuh akses?</span>
          </button>
        </div>

        {/* Login Form Center Body */}
        <div className="login-right-body">
          {/* Help / Register modal inline injection */}
          {showHelpModal ? (
            <div className="help-box" style={{
              backgroundColor: "var(--paper-2)",
              border: "1px solid var(--hairline)",
              borderRadius: "16px",
              padding: "1.5rem",
              marginBottom: "1.5rem"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <h3 style={{ fontSize: "15px", fontWeight: "800" }}>Registrasi Admin Baru</h3>
                <button 
                  onClick={() => setShowHelpModal(false)}
                  style={{ background: "none", border: "none", fontSize: "16px", cursor: "pointer", fontWeight: "bold" }}
                >✕</button>
              </div>
              <p style={{ fontSize: "12px", color: "var(--ink-2)", marginBottom: "1rem", lineHeight: "1.4" }}>
                Gunakan formulir ini jika Anda ingin mendaftarkan kredensial admin baru di sistem Supabase.
              </p>

              {regError && <div className="login-error-banner" style={{ padding: "0.5rem 0.75rem", fontSize: "12px" }}>{regError}</div>}
              {regSuccess && <div className="login-status-banner" style={{ padding: "0.5rem 0.75rem", marginTop: 0, marginBottom: "0.75rem" }}><div className="status-banner-desc" style={{ color: "var(--open)", fontWeight: "600" }}>{regSuccess}</div></div>}

              <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: "9px" }}>EMAIL REGISTER</label>
                  <input
                    type="email"
                    className="form-input"
                    style={{ padding: "0.55rem 0.85rem", fontSize: "13px" }}
                    placeholder="email@kampus.ac.id"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: "9px" }}>KATA SANDI</label>
                  <input
                    type="password"
                    className="form-input"
                    style={{ padding: "0.55rem 0.85rem", fontSize: "13px" }}
                    placeholder="Minimal 10 karakter"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={regLoading}
                  className="btn btn-primary"
                  style={{ width: "100%", padding: "0.6rem", fontSize: "13px", marginTop: "0.25rem" }}
                >
                  {regLoading ? "Mendaftarkan..." : "Daftarkan Admin"}
                </button>
              </form>
            </div>
          ) : null}

          {/* Badge */}
          <div className="login-right-badge-row">
            <span className="login-right-access-label">AKSES</span>
            <span className="login-right-admin-badge">ADMIN</span>
          </div>

          <h2 className="login-right-title">Masuk ke panel admin</h2>
          <p className="login-right-subtitle">
            Gunakan kredensial admin yang diberikan tim Cloud Computing. Semua perubahan tercatat di log audit.
          </p>

          {error && (
            <div className="login-error-banner">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="login-status-banner" style={{ marginTop: 0, marginBottom: "1.25rem" }}>
              <div className="status-banner-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <div className="status-banner-content">
                <span className="status-banner-title" style={{ color: "var(--open)" }}>Berhasil</span>
                <span className="status-banner-desc" style={{ color: "var(--ink)" }}>{success}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form className="login-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">EMAIL ADMIN</label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="r.admin@kampus.ac.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <div className="form-label-row">
                <label className="form-label" htmlFor="password">KATA SANDI</label>
                <a href="#lupa" className="form-link" onClick={(e) => {
                  e.preventDefault();
                  alert("Fitur lupa sandi: Silakan hubungi tim Cloud Computing untuk mereset kata sandi Anda.");
                }}>Lupa sandi?</a>
              </div>
              <div className="input-container">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="form-input form-input-password"
                  placeholder="Min. 10 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="btn-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? "Sembunyikan" : "Tampilkan"}
                </button>
              </div>
            </div>

            {/* Remember me Checkbox */}
            <label className="checkbox-row" htmlFor="remember-me">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
              />
              <div className="custom-checkbox">
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="checkbox-label">Jaga saya tetap masuk di perangkat ini</span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              className="btn-login-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg style={{ animation: "spin 1s linear infinite", width: "16px", height: "16px" }} fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" style={{ opacity: 0.2 }}></circle>
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" style={{ opacity: 0.8 }}></path>
                  </svg>
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke dashboard</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="login-divider">
            <span className="login-divider-text">ATAU</span>
          </div>

          {/* SSO login */}
          <button 
            type="button" 
            className="btn-sso" 
            onClick={handleSSOLogin}
            disabled={loading}
          >
            <span className="sso-icon">K</span>
            <span>Lanjut dengan SSO Kampus</span>
          </button>

          {/* Security Alert Badge */}
          <div className="login-status-banner">
            <div className="status-banner-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--open)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 11l2 2 4-4" />
              </svg>
            </div>
            <div className="status-banner-content">
              <span className="status-banner-title">Koneksi aman - TLS 1.3</span>
              <span className="status-banner-desc">Login dibatasi • 5 percobaan / 15 menit • IP tercatat</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="login-footer">
          <span className="login-footer-text">
            © 2026 • Cloud Computing • Map Directory v1.0
          </span>
          <div className="login-footer-links">
            <a href="#kebijakan" className="login-footer-link" onClick={(e) => { e.preventDefault(); alert("Kebijakan Privasi Intern."); }}>Kebijakan privasi</a>
            <a href="#ketentuan" className="login-footer-link" onClick={(e) => { e.preventDefault(); alert("Ketentuan Layanan Intern."); }}>Ketentuan layanan</a>
            <a href="#status" className="login-footer-link status-green" onClick={(e) => { e.preventDefault(); alert("Status Sistem: Semua Server Beroperasi Normal."); }}>Status sistem</a>
          </div>
        </div>
      </div>
    </div>
  );
}
