"use client"
import React from "react"
export default function CardUI({ children }: { children: React.ReactElement }) {


    return (


        <div className="max-w-full max-lg:w-[37rem]
       max-sm:h-[27rem] h-fit
        flex justify-center items-center rounded-3xl shadow-lg bg-white p-5">

            {children}

        </div>
    )
}