import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AI Park - AI-Powered Learning Platform",
    short_name: "AI Park",
    description: "학교급과 학년에 맞춘 AI 기반 수학·영어 학습 튜터링 서비스",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#9333ea",
    scope: "/",
    orientation: "portrait-primary",
    categories: ["education", "productivity"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Math Tutor",
        short_name: "Math",
        description: "Start math tutoring session",
        url: "/tutor/math",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "English Tutor",
        short_name: "English",
        description: "Start English tutoring session",
        url: "/tutor/english",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Dashboard",
        short_name: "Dashboard",
        description: "View learning progress",
        url: "/dashboard",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
    ],
  };
}
