"use client"

import * as React from "react"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card"



export function CardElementHome({ children, loading, classes, title }: { children: React.ReactElement, loading: boolean, classes: string, title: string }) {
    return (
        <>
            <Card className="p-0 bg-transparent dark:bg-transparent shadow-none border-none">
                <CardHeader className="p-0 mb-[12px]">
                    <CardTitle className="text-[18px] md:text-[20px] xl:text-[24px] dark:text-white text-[#228367] font-causten-semibold tracking-wide font-bold ">{title}</CardTitle>
                    {/* <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
        <CardAction>
          <Button variant="link">Sign Up</Button>
        </CardAction> */}
                </CardHeader>
                <CardContent className={`rounded-[9px] flex-1 flex flex-col  bg-[#F3F4F9]
                      dark:bg-[#181A1D] dark:shadow-[inset_0_0_8px_#B8B8B82B] dark:border-none border
                       border-[#B8B8B8] shadow-md w-full p-0  py-[18px] px-[25px] ${classes}`} >
                    {loading ?
                        <div className="flex items-center justify-center p-8 h-[32vh] max-sm:h-[20vh]">
                            <div className="flex flex-col items-center space-y-3">
                                <div className={`w-6 h-6 animate-spin rounded-full border-2 border-muted-foreground/20 border-t-primary`} />
                                <p className="text-sm text-muted-foreground">Loading content...</p>
                            </div>
                        </div>
                        : (<div>{children}</div>)}
                </CardContent>
            </Card>
        </>
    )
}
