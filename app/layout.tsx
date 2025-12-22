import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/components/providers/StoreProvider";
import { NotificationProvider } from "@/components/gamification/NotificationProvider";
import { ServiceWorkerProvider } from "@/components/providers/ServiceWorkerProvider";
import { NavigationProvider } from "@/components/providers/NavigationProvider";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { ProfileSyncProvider } from "@/components/providers/ProfileSyncProvider";
import { GuestCookieSync } from "@/components/providers/GuestCookieSync";
import { WebVitalsReporter } from "@/components/WebVitalsReporter";
import { TopNavigation } from "@/components/navigation/TopNavigation";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
  adjustFontFallback: true,
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "AI Park - AI 기반 맞춤형 학습 플랫폼",
    template: "%s | AI Park",
  },
  description:
    "초등학교부터 대학교까지 학교급에 맞춘 AI Park 수학·영어 학습. 실시간 대화, 맞춤형 학습, 성과 분석으로 효과적인 학습을 경험하세요.",
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
  authors: [{ name: "AI Park Team" }],
  creator: "AI Park",
  publisher: "AI Park",
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
    siteName: "AI Park",
    title: "AI Park - AI 기반 맞춤형 학습 플랫폼",
    description: "개인 맞춤형 AI 튜터와 함께하는 스마트 학습. 수학과 영어를 효과적으로 배우세요.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AI Park - AI 학습 플랫폼",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Park - AI 기반 맞춤형 학습 플랫폼",
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
        {/* Preload hero video for faster LCP */}
        <link rel="preload" href="/videos/demo_s.mp4" as="video" type="video/mp4" />
        {/* Puter.js - Async loading to comply with Next.js best practices */}
        <script src="https://js.puter.com/v2/" async></script>
        {/* Hide Next.js dev indicator */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function removeNextDevIndicator() {
                  const selectors = [
                    '[data-next-mark-loading]',
                    '[data-nextjs-dev-tools]',
                    '[data-nextjs-dev-tools-button]',
                    'button[aria-label*="Next.js"]',
                    'div[aria-label*="Next.js"]',
                    '#__next-build-watcher'
                  ];
                  selectors.forEach(selector => {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach(el => el.remove());
                  });
                }
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', removeNextDevIndicator);
                } else {
                  removeNextDevIndicator();
                }
                setInterval(removeNextDevIndicator, 1000);
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased">
        <ErrorBoundary>
          {/* ⚠️ AUTHENTICATION DISABLED: SessionProvider kept for compatibility, but authentication is bypassed in useAuth hook */}
          <SessionProvider>
            <ProfileSyncProvider>
              <StoreProvider>
                <NotificationProvider>
                  <ServiceWorkerProvider>
                    <NavigationProvider>
                      <GuestCookieSync />
                      <TopNavigation />
                      {children}
                    </NavigationProvider>
                  </ServiceWorkerProvider>
                </NotificationProvider>
              </StoreProvider>
            </ProfileSyncProvider>
          </SessionProvider>
        </ErrorBoundary>
        <WebVitalsReporter />
      </body>
    </html>
  );
}
