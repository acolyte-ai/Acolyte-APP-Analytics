import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ToastContainer } from 'react-toastify'
import React from 'react'
import { SettingsProvider } from "@/context/store";
import { Toaster } from "sonner";
import { ThemeProvider } from "next-themes";
import { JobPollingProvider } from "@/context/jobCreationContext";



const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "MyAcolyte",
  description: "FileManagement - Store your files in the cloud",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
      <SettingsProvider>
        <JobPollingProvider>

          <html lang="en">
            <body className={`${poppins.variable} font-poppins antialiased w-screen h-screen`}>
              {/* <Toaster position="top-right" richColors /> */}
              <ToastContainer style={{ zIndex: 9999 }} />
              <Toaster position="top-right" richColors />
              <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                {children}
              </ThemeProvider>
              {/* <WorkspaceGuard/> */}
            </body>
          </html>
        </JobPollingProvider>
      </SettingsProvider>

  );
}