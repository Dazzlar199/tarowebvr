import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tarotaros Worlds - Create Your Virtual World",
  description: "프롬프트 한 줄로 나만의 세계를 즉시 걷는 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <ClientLayout>
          <main className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900">
            {children}
          </main>
        </ClientLayout>
      </body>
    </html>
  );
}
