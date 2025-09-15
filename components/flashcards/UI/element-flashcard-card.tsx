"use client"

import * as React from "react"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
// import BookmarkDialog from "../dialogueBox/dialoguebox-bookmark"



export function CardElementFlashcard({ children, loading, classes, backgroundHidden, title }: { children: React.ReactElement, backgroundHidden: boolean, loading: boolean, classes: string, title: string }) {
    return (

        <Card className="p-0 bg-transparent dark:bg-transparent shadow-none border-none relative">
            <CardHeader className='p-0 mb-[15px]'>
                <CardTitle className="text-[#228367] font-medium dark:text-white text-[22px] xl:text-[24px] font-causten-bold tracking-normal">
                    {title}
                </CardTitle>
                {/* {title === "Bookmarked cards" && <div className="absolute top-0 right-2  gap-2"><BookmarkDialog /></div>} */}
            </CardHeader>
            <CardContent className={`rounded-[9px] w-full h-full flex-1 flex flex-col  justify-center ${classes} ${!backgroundHidden ? " bg-[#F3F4F9] dark:bg-[#181A1D] dark:shadow-[inset_0_0_8px_#B8B8B82B] dark:border-none border border-[#B8B8B8] shadow-md" : ""} w-full p-0  `} >
                {loading ?
                    <div className="flex items-center justify-center p-8 h-[360px]">
                        <div className="flex flex-col items-center space-y-3">
                            <div className={`w-6 h-6 animate-spin rounded-full border-2 border-muted-foreground/20 border-t-primary`} />
                            <p className="text-sm text-muted-foreground">Loading content...</p>
                        </div>
                    </div>
                    : (<div>{children}</div>)}
            </CardContent>
        </Card>

    )
}
