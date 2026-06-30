"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { registerSuperAdminAction } from "@/app/actions";
import "./register.css";

export default function RegisterPage() {
  const router = useRouter();

  // Registration state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

  // Handle registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Client-side validations
    if (password.length < 10) {
      setError("Kata sandi harus minimal 10 karakter.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Kata sandi dan konfirmasi kata sandi tidak cocok.");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);

      const result = await registerSuperAdminAction(formData);

      if (result.error) {
        throw new Error(result.error);
      }

      setSuccess("Registrasi admin berhasil! Mengalihkan ke halaman masuk...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      console.error("Registration page error:", err);
      setError(err.message || "Terjadi kesalahan saat melakukan registrasi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      {/* LEFT PANEL: Visual Banner */}
      <div className="register-left">
        {/* Brand Logo Header */}
        <div className="register-brand">
          <div className="register-brand-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" fill="var(--open)" stroke="var(--open)" />
            </svg>
          </div>
          <div className="register-brand-text">
            <span className="register-brand-sub">DIREKTORI • KAMPUS</span>
            <span className="register-brand-main">Map Directory • Admin</span>
          </div>
        </div>

        {/* Left Content Body */}
        <div className="register-left-body">
          <div className="register-left-badge">
            <span className="badge-dot"></span>
            <span>PANEL INTERNAL • V1.0</span>
          </div>
          <h1 className="register-left-title">
            Kelola unit, gedung, dan <span className="accent">kategori kampus</span>.
          </h1>
          <p className="register-left-desc">
            Daftar untuk membuat kredensial admin baru yang digunakan untuk mengelola data direktori — foto, koordinat, jam layanan, dan lantai.
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

        {/* Left Footer - Empty for spacing (Next.js logo ignored) */}
        <div></div>
      </div>

      {/* RIGHT PANEL: Register Form */}
      <div className="register-right">
        {/* Right Top Info Header */}
        <div className="register-right-header">
          <span className="register-right-domain">kampus.ac.id/admin</span>
          <Link href="/login" className="btn-login-redirect">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
              <polyline points="10 17 15 12 10 7"></polyline>
              <line x1="15" y1="12" x2="3" y2="12"></line>
            </svg>
            <span>Sudah punya akun? Masuk</span>
          </Link>
        </div>

        {/* Register Form Center Body */}
        <div className="register-right-body">
          {/* Badge */}
          <div className="register-right-badge-row">
            <span className="register-right-access-label">AKSES</span>
            <span className="register-right-admin-badge">ADMIN</span>
          </div>

          <h2 className="register-right-title">Registrasi admin baru</h2>
          <p className="register-right-subtitle">
            Buat kredensial admin baru di sistem Supabase. Semua aktivitas admin akan tercatat secara aman di log audit.
          </p>

          {error && (
            <div className="register-error-banner">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="register-status-banner" style={{ marginTop: 0, marginBottom: "1.25rem" }}>
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
          <form className="register-form" onSubmit={handleRegister}>
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
              <label className="form-label" htmlFor="password">KATA SANDI</label>
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

            <div className="form-group">
              <label className="form-label" htmlFor="confirm-password">KONFIRMASI KATA SANDI</label>
              <div className="input-container">
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  className="form-input form-input-password"
                  placeholder="Ulangi kata sandi"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="btn-toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  {showConfirmPassword ? "Sembunyikan" : "Tampilkan"}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn-register-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg style={{ animation: "spin 1s linear infinite", width: "16px", height: "16px" }} fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" style={{ opacity: 0.2 }}></circle>
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" style={{ opacity: 0.8 }}></path>
                  </svg>
                  <span>Mendaftarkan...</span>
                </>
              ) : (
                <>
                  <span>Daftar admin baru</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Security Alert Badge */}
          <div className="register-status-banner">
            <div className="status-banner-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--open)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 11l2 2 4-4" />
              </svg>
            </div>
            <div className="status-banner-content">
              <span className="status-banner-title">Koneksi aman - TLS 1.3</span>
              <span className="status-banner-desc">Pendaftaran dienkripsi • Verifikasi internal diperlukan • IP tercatat</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="register-footer">
          <span className="register-footer-text">
            © 2026 • Cloud Computing • Map Directory v1.0
          </span>
          <div className="register-footer-links">
            <a href="#kebijakan" className="register-footer-link" onClick={(e) => { e.preventDefault(); alert("Kebijakan Privasi Intern."); }}>Kebijakan privasi</a>
            <a href="#ketentuan" className="register-footer-link" onClick={(e) => { e.preventDefault(); alert("Ketentuan Layanan Intern."); }}>Ketentuan layanan</a>
            <a href="#status" className="register-footer-link status-green" onClick={(e) => { e.preventDefault(); alert("Status Sistem: Semua Server Beroperasi Normal."); }}>Status sistem</a>
          </div>
        </div>
      </div>
    </div>
  );
}
