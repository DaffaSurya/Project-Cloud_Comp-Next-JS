import { createMcpHandler } from "mcp-handler";
import { z } from "zod";

const mcpHandler = createMcpHandler(async (server) => {
  // 1. Tool untuk informasi sistem
  server.tool(
    "get_system_info",
    "Mendapatkan informasi CPU, platform OS, penggunaan memori, dan lama waktu sistem aktif (uptime).",
    {},
    async () => {
      const os = await import("os");
      const uptime = os.uptime();
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                platform: os.platform(),
                arch: os.arch(),
                cpus: os.cpus().length,
                cpuModel: os.cpus()[0]?.model || "Unknown",
                memory: {
                  totalGB: (totalMem / 1024 / 1024 / 1024).toFixed(2),
                  usedGB: (usedMem / 1024 / 1024 / 1024).toFixed(2),
                  freeGB: (freeMem / 1024 / 1024 / 1024).toFixed(2),
                  usagePercent: ((usedMem / totalMem) * 100).toFixed(1) + "%",
                },
                uptimeHours: (uptime / 3600).toFixed(2),
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  // 2. Tool untuk waktu server
  server.tool(
    "get_current_time",
    "Mendapatkan waktu lokal server, tanggal, zona waktu, dan milidetik UTC saat ini.",
    {},
    async () => {
      const now = new Date();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                isoString: now.toISOString(),
                localTime: now.toLocaleString(),
                timezoneOffset: now.getTimezoneOffset(),
                timeMs: now.getTime(),
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  // 3. Tool untuk perhitungan matematika tingkat lanjut
  server.tool(
    "math_calculator",
    "Melakukan operasi matematika dasar hingga menengah seperti penjumlahan, pengurangan, perkalian, pembagian, dan pemangkatan.",
    {
      operation: z.enum(["add", "subtract", "multiply", "divide", "power"]),
      a: z.number(),
      b: z.number(),
    },
    async ({ operation, a, b }) => {
      let result: number;
      switch (operation) {
        case "add":
          result = a + b;
          break;
        case "subtract":
          result = a - b;
          break;
        case "multiply":
          result = a * b;
          break;
        case "divide":
          if (b === 0) {
            throw new Error("Tidak dapat membagi dengan nol");
          }
          result = a / b;
          break;
        case "power":
          result = Math.pow(a, b);
          break;
        default:
          throw new Error(`Operasi tidak dikenal: ${operation}`);
      }
      return {
        content: [
          {
            type: "text",
            text: `Hasil dari ${a} ${operation} ${b} = ${result}`,
          },
        ],
      };
    }
  );
}, {}, { basePath: "/api/mcp" });

// Next.js Route Handler wrapper
export async function GET(
  req: Request,
  context: { params: Promise<{ transport: string }> }
) {
  const params = await context.params;
  const transport = params.transport;

  // Stateless SSE fallback for local development without Redis configuration
  if (transport === "sse" && !process.env.REDIS_URL && !process.env.KV_URL) {
    const responseStream = new ReadableStream({
      start(controller) {
        // Stream the initial endpoint location event for MCP UI
        const eventData = `event: endpoint\ndata: /api/mcp/sse?sessionId=active-session\n\n`;
        controller.enqueue(new TextEncoder().encode(eventData));

        // Keep SSE connection alive with period ping heartbeats
        const interval = setInterval(() => {
          controller.enqueue(new TextEncoder().encode(`: ping\n\n`));
        }, 15000);

        req.signal.addEventListener("abort", () => {
          clearInterval(interval);
          controller.close();
        });
      },
    });

    return new Response(responseStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  }

  // Pass request to original mcp-handler
  return mcpHandler(req);
}

export async function POST(
  req: Request,
  context: { params: Promise<{ transport: string }> }
) {
  return mcpHandler(req);
}
