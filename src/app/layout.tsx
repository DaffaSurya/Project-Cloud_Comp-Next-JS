import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MCP Nexus - Developer Dashboard & Server",
  description: "Dashboard developer terintegrasi untuk Model Context Protocol (MCP) di Next.js. Bangun, kelola, dan uji tool AI Anda secara real-time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>
        {children}
      </body>
    </html>
  );
}
