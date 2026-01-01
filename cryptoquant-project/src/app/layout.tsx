import type { Metadata } from "next";
import localFont from "next/font/local";
import AppLayout from "@/components/layout/AppLayout";
import QueryProvider from "@/providers/QueryProvider";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "CryptoQuant - AI 기반 암호화폐 차트 & 자동매매 데모",
  description: "암호화폐 시세 데이터를 시각적으로 제공하고, 자동매매 전략을 설정하여 모의 백테스트를 수행할 수 있는 웹 기반 데모 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <AppLayout>{children}</AppLayout>
        </QueryProvider>
      </body>
    </html>
  );
}
