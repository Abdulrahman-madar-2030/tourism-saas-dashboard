"use client";
import { Almarai } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

const almarai = Almarai({
  subsets: ["arabic"],
  weight: ["400", "700", "800"],
  display: "swap",
  variable: "--font-almarai",
  preload: true,
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000 * 5, // 5 minutes cache
            gcTime: 60 * 1000 * 15, // 15 minutes garbage collection
            refetchOnWindowFocus: false, // Prevent redundant background network requests when switching tabs
            retry: 1, // Minimize retry delay loops
          },
        },
      }),
  );
  return (
    <html lang="ar" dir="rtl">
      <head>
        <title>Tourism SaaS | لوحة السوبر أدمن المركزية لإدارة السياحة والسفر</title>
        <meta
          name="description"
          content="منظومة السوبر أدمن السحابية الموحدة لإدارة قطاع السياحة، باقات السفر، الفنادق، ووكالات السياحة"
        />
        <meta name="theme-color" content="#120c2b" />
      </head>
      <body className={`${almarai.className} antialiased`}>
        <Toaster />

        <SessionProvider>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
