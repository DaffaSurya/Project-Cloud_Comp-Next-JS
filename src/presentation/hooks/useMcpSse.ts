import { useState, useEffect, useRef } from "react";

export function useMcpSse() {
  const [connectionStatus, setConnectionStatus] = useState<"disconnected" | "connecting" | "connected" | "error">("disconnected");
  const [postUrl, setPostUrl] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>("");
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    setConnectionStatus("connecting");
    const es = new EventSource("/api/mcp/sse");
    eventSourceRef.current = es;

    es.onopen = () => {
      setConnectionStatus("connected");
    };

    es.onerror = () => {
      setConnectionStatus("error");
    };

    es.addEventListener("endpoint", (event: MessageEvent) => {
      const url = event.data;
      setPostUrl(url);
      try {
        const parsedUrl = new URL(url, window.location.href);
        const sId = parsedUrl.searchParams.get("sessionId") || "active-session";
        setSessionId(sId);
      } catch (err) {
        setSessionId("active-session");
      }
    });

    return () => {
      es.close();
      eventSourceRef.current = null;
    };
  }, []);

  return {
    connectionStatus,
    postUrl,
    sessionId
  };
}
