"use client";
import React from "react";
import SideBarTest from "@/components/sidebar/sideBarTest";
import NavigationFeature from "@/components/UIUX/NavigationFeature";
import SmallScreenWarning from "@/components/UIUX/smallScreenWarning";
import AssessmentHeader from "@/components/sidebar/header";
import HeaderSearchBar from "@/components/sidebar/headerSearchBar";

export const dynamic = "force-dynamic";


interface AppLayoutProps {
  children: React.ReactNode
}


export default function Layout({ children }: AppLayoutProps) {
  const currentUser = {};
  return (
    <div className="h-screen w-screen bg-[#181A1D]  pt-4 pb-[17px] lg:pt-[17px] flex flex-col md:flex-row font-[futureHeadline]">
      <SmallScreenWarning />
      <AssessmentHeader />
      <SideBarTest {...currentUser} />
      <main className="flex  flex-col h-full w-full md:mr-4 no-scrollbar pb-6
            dark:bg-[#0F1012] bg-[#EBEBF5] rounded-[2rem]
            ">
        <HeaderSearchBar />{children}</main>

    </div>
  )
}



