"use client"
import { Button } from "@/components/ui/button";
import Image, { StaticImageData } from "next/image";
import { useRouter } from "next/navigation"

export default function UserButtonUI({ name, icon, colorFrom, colorTo, link, classStyle }: {
    name: string, icon?: StaticImageData,
    colorFrom: string, colorTo: string, link: string, classStyle: string
}) {
    const router = useRouter()

    return (
        <Button className={`
       dark:border-none
          dark:bg-gradient-to-r dark:from-[${colorFrom}] dark:to-[${colorTo}]
          dark:hover:to-[${colorFrom}] dark:hover:from-[${colorTo}] hover:bg-[#fff8f8]
          ${classStyle} bg-[#F2F2F2] border-[#0A0B0C] border
      w-full
        py-6   text-sm flex justify-center items-center
       gap-4 `}
            onClick={() => router.push(link)}

        >
            {
                icon && <span>
                    <Image
                        src={icon}
                        alt={name}
                        className="object-contain h-4 w-4 "
                        width={50}
                        height={50}
                    />
                </span>
            }
            <p>{name}</p>
        </Button>
    )
}