"use client";

import { useState, useEffect, useRef } from "react";

interface Tool {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

export default function Home() {
  // State untuk koneksi MCP
  const [connectionStatus, setConnectionStatus] = useState<"disconnected" | "connecting" | "connected" | "error">("disconnected");
  const [postUrl, setPostUrl] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>("");
  const [logs, setLogs] = useState<{ timestamp: string; type: "request" | "response" | "system"; data: any }[]>([]);

  // State untuk tools yang tersedia
  const [tools, setTools] = useState<Tool[]>([
    {
      name: "get_system_info",
      description: "Mendapatkan informasi CPU, platform OS, penggunaan memori, dan lama waktu sistem aktif (uptime).",
      parameters: { type: "object", properties: {} }
    },
    {
      name: "get_current_time",
      description: "Mendapatkan waktu lokal server, tanggal, zona waktu, dan milidetik UTC saat ini.",
      parameters: { type: "object", properties: {} }
    },
    {
      name: "math_calculator",
      description: "Melakukan operasi matematika dasar hingga menengah seperti penjumlahan, pengurangan, perkalian, pembagian, dan pemangkatan.",
      parameters: {
        type: "object",
        properties: {
          operation: { type: "string", enum: ["add", "subtract", "multiply", "divide", "power"], description: "Operasi matematika" },
          a: { type: "number", description: "Angka pertama" },
          b: { type: "number", description: "Angka kedua" }
        },
        required: ["operation", "a", "b"]
      }
    }
  ]);

  // State untuk playground
  const [selectedToolName, setSelectedToolName] = useState<string>("get_system_info");
  const [mathOp, setMathOp] = useState<string>("add");
  const [mathA, setMathA] = useState<number>(10);
  const [mathB, setMathB] = useState<number>(5);
  const [executing, setExecuting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"result" | "raw">("result");
  const [lastResult, setLastResult] = useState<any>(null);
  const [lastRequest, setLastRequest] = useState<any>(null);

  // State untuk data sistem live
  const [systemMetrics, setSystemMetrics] = useState<any>({
    platform: "Loading...",
    arch: "Loading...",
    cpus: 0,
    cpuModel: "Loading...",
    memory: { totalGB: "0.00", usedGB: "0.00", freeGB: "0.00", usagePercent: "0%" },
    uptimeHours: "0.00"
  });

  const eventSourceRef = useRef<EventSource | null>(null);

  // Fungsi untuk menambah log
  const addLog = (type: "request" | "response" | "system", data: any) => {
    setLogs((prev) => [
      {
        timestamp: new Date().toLocaleTimeString(),
        type,
        data
      },
      ...prev.slice(0, 49) // Simpan maksimal 50 log terakhir
    ]);
  };

  // 1. Koneksi SSE ke Server MCP
  useEffect(() => {
    setConnectionStatus("connecting");
    addLog("system", "Memulai koneksi SSE ke /api/mcp/sse...");

    const es = new EventSource("/api/mcp/sse");
    eventSourceRef.current = es;

    es.onopen = () => {
      setConnectionStatus("connected");
      addLog("system", "Koneksi SSE berhasil dibuka.");
    };

    es.onerror = () => {
      setConnectionStatus("error");
      addLog("system", "Kesalahan koneksi SSE atau server terputus.");
    };

    // Dengarkan event 'endpoint' dari adapter mcp-handler
    es.addEventListener("endpoint", (event: MessageEvent) => {
      const url = event.data;
      setPostUrl(url);
      
      // Ambil session ID dari query string
      try {
        const parsedUrl = new URL(url, window.location.href);
        const sId = parsedUrl.searchParams.get("sessionId") || "active-session";
        setSessionId(sId);
        addLog("system", `Menerima endpoint POST MCP: ${url}`);
      } catch (err) {
        setSessionId("active-session");
      }
    });

    return () => {
      es.close();
      eventSourceRef.current = null;
    };
  }, []);

  // 2. Fetch data sistem awal setelah terkoneksi
  useEffect(() => {
    if (connectionStatus === "connected" && postUrl) {
      // Panggil tool sistem info untuk mengisi metrik di dashboard
      fetchSystemInfoDirectly();
    }
  }, [connectionStatus, postUrl]);

  const fetchSystemInfoDirectly = async () => {
    if (!postUrl) return;
    try {
      const reqId = Date.now();
      const reqBody = {
        jsonrpc: "2.0",
        method: "tools/call",
        params: {
          name: "get_system_info",
          arguments: {}
        },
        id: reqId
      };
      
      const res = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqBody)
      });
      const data = await res.json();
      if (data?.result?.content?.[0]?.text) {
        const metrics = JSON.parse(data.result.content[0].text);
        setSystemMetrics(metrics);
      }
    } catch (e) {
      console.error("Gagal memperbarui metrik sistem", e);
    }
  };

  // 3. Eksekusi tool melalui POST
  const handleExecuteTool = async () => {
    if (!postUrl) {
      alert("Koneksi MCP belum siap. Tunggu hingga status 'CONNECTED'.");
      return;
    }

    setExecuting(true);
    const reqId = Math.floor(Math.random() * 100000);

    // Kumpulkan argumen berdasarkan tool yang dipilih
    let toolArgs = {};
    if (selectedToolName === "math_calculator") {
      toolArgs = {
        operation: mathOp,
        a: Number(mathA),
        b: Number(mathB)
      };
    }

    const jsonRpcRequest = {
      jsonrpc: "2.0",
      method: "tools/call",
      params: {
        name: selectedToolName,
        arguments: toolArgs
      },
      id: reqId
    };

    setLastRequest(jsonRpcRequest);
    addLog("request", jsonRpcRequest);

    try {
      const res = await fetch(postUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(jsonRpcRequest)
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const jsonRpcResponse = await res.json();
      setLastResult(jsonRpcResponse);
      addLog("response", jsonRpcResponse);

      // Jika mengeksekusi get_system_info, update metrik dashboard secara dinamis!
      if (selectedToolName === "get_system_info" && jsonRpcResponse?.result?.content?.[0]?.text) {
        try {
          const metrics = JSON.parse(jsonRpcResponse.result.content[0].text);
          setSystemMetrics(metrics);
        } catch (_) {}
      }
    } catch (err: any) {
      const errorResponse = {
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: err.message || "Internal error"
        },
        id: reqId
      };
      setLastResult(errorResponse);
      addLog("response", errorResponse);
    } finally {
      setExecuting(false);
    }
  };

  const selectedTool = tools.find((t) => t.name === selectedToolName);

  return (
    <div className="dashboard-container">
      {/* Background Neon Glows */}
      <div className="bg-glow glow-top-left"></div>
      <div className="bg-glow glow-bottom-right"></div>

      {/* Header Area */}
      <header>
        <div className="logo-area">
          <h1>MCP Nexus</h1>
          <p>Next.js Model Context Protocol Server & Playground</p>
        </div>
        
        <div className="status-area">
          <div className="status-badge" style={{
            borderColor: connectionStatus === "connected" ? "rgba(0, 242, 254, 0.2)" : 
                         connectionStatus === "connecting" ? "rgba(252, 211, 77, 0.2)" : "rgba(239, 68, 68, 0.2)",
            background: connectionStatus === "connected" ? "rgba(0, 242, 254, 0.05)" : 
                        connectionStatus === "connecting" ? "rgba(252, 211, 77, 0.05)" : "rgba(239, 68, 68, 0.05)"
          }}>
            <div className="pulse-dot" style={{
              backgroundColor: connectionStatus === "connected" ? "var(--accent-cyan)" : 
                               connectionStatus === "connecting" ? "#fcd34d" : "#ef4444",
              boxShadow: connectionStatus === "connected" ? "0 0 12px var(--accent-cyan)" : 
                         connectionStatus === "connecting" ? "0 0 12px #fcd34d" : "0 0 12px #ef4444",
            }}></div>
            <span style={{
              color: connectionStatus === "connected" ? "var(--accent-cyan)" : 
                     connectionStatus === "connecting" ? "#fcd34d" : "#ef4444"
            }}>
              {connectionStatus === "connected" ? "Connected via SSE" : 
               connectionStatus === "connecting" ? "Connecting SSE..." : 
               connectionStatus === "disconnected" ? "Disconnected" : "Connection Error"}
            </span>
          </div>
        </div>
      </header>

      {/* Grid Layout */}
      <div className="dashboard-grid">
        {/* Left Side: Server Status & Tools List */}
        <div className="panel-section">
          {/* Status Panel */}
          <div className="glass-panel" style={{ padding: "1.5rem" }}>
            <h2 className="panel-title">Server Registry & Status</h2>
            <div className="info-row">
              <span className="info-label">Active Transport</span>
              <span className="info-value" style={{ color: "var(--accent-cyan)" }}>Server-Sent Events (SSE)</span>
            </div>
            <div className="info-row">
              <span className="info-label">SSE Connection Endpoint</span>
              <span className="info-value">/api/mcp/sse</span>
            </div>
            <div className="info-row">
              <span className="info-label">Session ID</span>
              <span className="info-value" style={{ fontSize: "0.85rem", opacity: 0.8 }}>
                {sessionId ? sessionId.substring(0, 18) + "..." : "Wait for connection..."}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">POST Target Url</span>
              <span className="info-value" style={{ fontSize: "0.8rem", maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={postUrl}>
                {postUrl || "Wait for Connection..."}
              </span>
            </div>
          </div>

          {/* System Performance Panel (Live stats) */}
          <div className="glass-panel" style={{ padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2 className="panel-title" style={{ marginBottom: 0 }}>System Resource Monitor</h2>
              <button 
                onClick={fetchSystemInfoDirectly} 
                className="tab-btn" 
                style={{ color: "var(--accent-cyan)", border: "none", cursor: "pointer" }}
              >
                ↻ Refresh
              </button>
            </div>
            <div className="info-row">
              <span className="info-label">OS / Platform</span>
              <span className="info-value">{systemMetrics.platform} ({systemMetrics.arch})</span>
            </div>
            <div className="info-row">
              <span className="info-label">CPU Cores / Model</span>
              <span className="info-value" style={{ fontSize: "0.85rem" }} title={systemMetrics.cpuModel}>
                {systemMetrics.cpus} Cores ({systemMetrics.cpuModel.split(" ")[0]}...)
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Memory Usage</span>
              <span className="info-value" style={{ color: "var(--accent-purple)" }}>
                {systemMetrics.memory.usedGB} GB / {systemMetrics.memory.totalGB} GB ({systemMetrics.memory.usagePercent})
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Server Uptime</span>
              <span className="info-value">{systemMetrics.uptimeHours} Jam</span>
            </div>

            {/* RAM Progress Bar */}
            <div style={{ marginTop: "1rem", width: "100%", height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "3px", overflow: "hidden" }}>
              <div style={{ 
                width: systemMetrics.memory.usagePercent, 
                height: "100%", 
                background: "linear-gradient(90deg, var(--accent-blue), var(--accent-purple))",
                transition: "width 0.5s ease-in-out"
              }}></div>
            </div>
          </div>

          {/* Tools List */}
          <div className="panel-section">
            <h2 className="panel-title" style={{ marginBottom: "-1rem" }}>Exposed MCP Tools</h2>
            <div className="tools-list">
              {tools.map((t) => (
                <div 
                  key={t.name} 
                  className={`tool-card ${selectedToolName === t.name ? "active" : ""}`}
                  onClick={() => setSelectedToolName(t.name)}
                >
                  <div className="tool-header">
                    <span className="tool-name">{t.name}</span>
                    <span className="tool-badge">
                      {Object.keys(t.parameters.properties).length} params
                    </span>
                  </div>
                  <p className="tool-desc">{t.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Playground */}
        <div className="panel-section">
          <div className="glass-panel playground-panel">
            <h2 className="panel-title">Live Tool Playground</h2>
            
            {selectedTool && (
              <div>
                <div style={{ marginBottom: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "1rem" }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Nama Tool</span>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.2rem", fontWeight: 700, color: "var(--accent-blue)", margin: "0.25rem 0" }}>
                    {selectedTool.name}
                  </div>
                  <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)" }}>{selectedTool.description}</p>
                </div>

                {/* Dinamis Parameter Inputs */}
                {selectedTool.name === "math_calculator" ? (
                  <div style={{ marginBottom: "1.5rem" }}>
                    <div className="form-group">
                      <label>Pilih Operasi Matematika</label>
                      <select 
                        value={mathOp} 
                        onChange={(e) => setMathOp(e.target.value)} 
                        className="form-input"
                      >
                        <option value="add">Tambah (+)</option>
                        <option value="subtract">Kurang (-)</option>
                        <option value="multiply">Kali (*)</option>
                        <option value="divide">Bagi (/)</option>
                        <option value="power">Pangkat (^)</option>
                      </select>
                    </div>
                    <div className="math-inputs">
                      <div className="form-group">
                        <label>Nilai a</label>
                        <input 
                          type="number" 
                          value={mathA} 
                          onChange={(e) => setMathA(Number(e.target.value))} 
                          className="form-input" 
                        />
                      </div>
                      <div className="form-group">
                        <label>Nilai b</label>
                        <input 
                          type="number" 
                          value={mathB} 
                          onChange={(e) => setMathB(Number(e.target.value))} 
                          className="form-input" 
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: "1rem", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px dashed var(--border-color)", marginBottom: "1.5rem", textAlign: "center" }}>
                    <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Tool ini tidak memerlukan parameter input.</span>
                  </div>
                )}

                {/* Execute Button */}
                <button 
                  onClick={handleExecuteTool} 
                  disabled={executing || connectionStatus !== "connected"} 
                  className="btn-primary"
                >
                  {executing ? "Mengeksekusi..." : "Jalankan Tool (Call)"}
                </button>

                {/* Response / Logs Output */}
                <div className="response-container">
                  <div className="tab-header">
                    <button 
                      onClick={() => setActiveTab("result")} 
                      className={`tab-btn ${activeTab === "result" ? "active" : ""}`}
                    >
                      Hasil Output
                    </button>
                    <button 
                      onClick={() => setActiveTab("raw")} 
                      className={`tab-btn ${activeTab === "raw" ? "active" : ""}`}
                    >
                      JSON-RPC Transaksi
                    </button>
                  </div>

                  {activeTab === "result" ? (
                    <div className="json-viewer" style={{ minHeight: "150px" }}>
                      {lastResult ? (
                        <div>
                          {lastResult.error ? (
                            <div style={{ color: "#f87171" }}>
                              <strong>Kesalahan Sistem (Code {lastResult.error.code}):</strong>
                              <p style={{ marginTop: "0.5rem" }}>{lastResult.error.message}</p>
                            </div>
                          ) : (
                            <div style={{ color: "#34d399" }}>
                              <strong>Hasil Eksekusi Tool:</strong>
                              <pre style={{ marginTop: "0.75rem", whiteSpace: "pre-wrap", background: "rgba(0,0,0,0.2)", padding: "1rem", borderRadius: "6px" }}>
                                {lastResult?.result?.content?.[0]?.text || JSON.stringify(lastResult, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "120px", color: "var(--text-muted)" }}>
                          Klik tombol di atas untuk menjalankan tool
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="json-viewer" style={{ minHeight: "150px", fontSize: "0.8rem" }}>
                      {lastRequest && lastResult ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                          <div>
                            <span style={{ color: "var(--accent-cyan)", fontWeight: "bold" }}>➔ JSON-RPC Request:</span>
                            <pre style={{ background: "rgba(255,255,255,0.02)", padding: "0.75rem", borderRadius: "4px", marginTop: "0.25rem", overflowX: "auto" }}>
                              {JSON.stringify(lastRequest, null, 2)}
                            </pre>
                          </div>
                          <div>
                            <span style={{ color: "var(--accent-purple)", fontWeight: "bold" }}>&lt;─ JSON-RPC Response:</span>
                            <pre style={{ background: "rgba(255,255,255,0.02)", padding: "0.75rem", borderRadius: "4px", marginTop: "0.25rem", overflowX: "auto" }}>
                              {JSON.stringify(lastResult, null, 2)}
                            </pre>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "120px", color: "var(--text-muted)" }}>
                          Belum ada transaksi JSON-RPC yang dikirimkan.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Area: Live SSE Stream Console */}
      <div className="glass-panel" style={{ marginTop: "2rem", padding: "1.5rem" }}>
        <h2 className="panel-title" style={{ fontSize: "1.1rem" }}>SSE Stream & Developer Console (Live)</h2>
        <div style={{ 
          fontFamily: "var(--font-mono)", 
          fontSize: "0.85rem", 
          background: "rgba(0,0,0,0.5)", 
          borderRadius: "8px", 
          border: "1px solid var(--border-color)", 
          padding: "1rem", 
          maxHeight: "180px", 
          overflowY: "auto" 
        }}>
          {logs.length > 0 ? (
            logs.map((log, index) => (
              <div key={index} className="terminal-line" style={{ 
                color: log.type === "request" ? "var(--accent-blue)" : 
                       log.type === "response" ? "#34d399" : "#e2e8f0" 
              }}>
                <span className="terminal-meta">[{log.timestamp}]</span>{" "}
                <span style={{ fontWeight: "bold" }}>
                  {log.type === "request" ? "➔ REQUEST" : 
                   log.type === "response" ? "← RESPONSE" : "ℹ SYSTEM"}
                </span>:{" "}
                <span>
                  {log.type === "system" ? log.data : JSON.stringify(log.data)}
                </span>
              </div>
            ))
          ) : (
            <div style={{ color: "var(--text-muted)" }}>Menunggu log aktivitas dari koneksi SSE...</div>
          )}
        </div>
      </div>

      <footer>
        <p>Built with Next.js App Router, TypeScript, and Model Context Protocol SDK.</p>
        <p style={{ marginTop: "0.5rem", fontSize: "0.8rem" }}>
          © 2026 MCP Nexus. Dokumentasi resmi protokol dapat ditemukan di{" "}
          <a href="https://modelcontextprotocol.io" target="_blank" rel="noopener noreferrer">modelcontextprotocol.io</a>
        </p>
      </footer>
    </div>
  );
}
