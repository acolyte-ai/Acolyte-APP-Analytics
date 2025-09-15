import * as React from "react"


import {
    Card,
    CardContent,

} from "@/components/ui/card"



export function CardStudent({ children, className }: {
    children: React.ReactElement, className: string,
    title: string, description: string
}) {
    return (
        <Card className={`border-0 p-0 m-0 h-full dark:bg-transparent bg-transparent `}>

            <CardContent className={`${className}  rounded-[9px] p-0 m-0  space-y-3`}>
                {children}
            </CardContent>

        </Card>
    )
}
