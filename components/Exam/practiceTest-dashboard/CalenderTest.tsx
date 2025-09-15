"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon, ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

export function DatePickerSearch() {
    const [date, setDate] = React.useState<Date>(new Date(Date.now()))

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "max-w-[340px] 2xl:text-[13px] w-[240px] col-span-5 border-[1.28px] px-[26px] py-[24px] 2xl:px-[24px] 2xl:py-[22px]  dark:border-[#202020] bg-[#F3F4F9] dark:bg-[#1A1B1F] border-[#B8B8B8] shadow-md  justify-center text-left text-[14px] font-causten-semibold",
                        !date && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                    <ChevronDown size={40} className="dark:text-white text-black" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    )
}