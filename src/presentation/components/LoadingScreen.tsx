import React from "react";

export function LoadingScreen() {
  return (
    <div style={{
      display: "flex",
      height: "100vh",
      width: "100vw",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "var(--paper)",
      fontFamily: "var(--font-sans)",
      color: "var(--ink-2)",
      fontSize: "14px",
      fontWeight: "600"
    }}>
      <svg style={{ animation: "spin 1s linear infinite", width: "24px", height: "24px", marginRight: "12px" }} fill="none" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" style={{ opacity: 0.2 }}></circle>
        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" style={{ opacity: 0.8 }}></path>
      </svg>
      <span>Memverifikasi sesi admin...</span>
    </div>
  );
}
