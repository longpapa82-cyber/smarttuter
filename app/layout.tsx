import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/components/providers/StoreProvider";
import { NotificationProvider } from "@/components/gamification/NotificationProvider";
import { ServiceWorkerProvider } from "@/components/providers/ServiceWorkerProvider";
import { WebVitalsReporter } from "@/components/WebVitalsReporter";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "SmartTuter - AI 기반 맞춤형 학습 플랫폼",
    template: "%s | SmartTuter",
  },
  description:
    "초등학교부터 대학교까지 학교급에 맞춘 AI 수학·영어 튜터. 실시간 대화, 맞춤형 학습, 성과 분석으로 효과적인 학습을 경험하세요.",
  keywords: [
    "AI 튜터",
    "온라인 학습",
    "수학 학습",
    "영어 학습",
    "맞춤형 교육",
    "학습 플랫폼",
    "AI 교육",
    "실시간 튜터링",
    "학습 분석",
    "교육 기술",
  ],
  authors: [{ name: "SmartTuter Team" }],
  creator: "SmartTuter",
  publisher: "SmartTuter",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "/",
    siteName: "SmartTuter",
    title: "SmartTuter - AI 기반 맞춤형 학습 플랫폼",
    description: "개인 맞춤형 AI 튜터와 함께하는 스마트 학습. 수학과 영어를 효과적으로 배우세요.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SmartTuter - AI 학습 플랫폼",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SmartTuter - AI 기반 맞춤형 학습 플랫폼",
    description: "개인 맞춤형 AI 튜터와 함께하는 스마트 학습",
    images: ["/og-image.png"],
    creator: "@smarttuter",
  },
  verification: {
    google: "google-site-verification-code",
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="antialiased">
        <StoreProvider>
          <NotificationProvider>
            <ServiceWorkerProvider>
              {children}
            </ServiceWorkerProvider>
          </NotificationProvider>
        </StoreProvider>
        <WebVitalsReporter />
      </body>
    </html>
  );
}
