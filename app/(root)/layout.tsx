"use client"
import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar"

export const dynamic = "force-dynamic";

const Layout = ({ children }: { children: React.ReactNode }) => {

  return (
    <SidebarProvider className="w-fit ">
      <main className="flex flex-col h-screen bg-[#EBEBF5] dark:bg-[#0F1012]">
        {children}
      </main>
    </SidebarProvider>
  );
};

export default Layout;