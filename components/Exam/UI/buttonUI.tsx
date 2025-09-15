import { Button } from "@/components/ui/button";


export default function VibrantButtonUI({ children, size, active, onClick, font, disable }: {
    children: React.ReactElement, size: "default" | "icon" | "lg" | "sm", active: boolean,
    font: string,
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void,
    disable?: boolean
}) {
    return (
        <Button className={`active:bg-[#36AF8D] active:dark:bg-[#36AF8D] font-medium font-[futureHeadlineBold] tracking-wider  hover:dark:bg-[#36AF8D]/70 hover:bg-[#36AF8D]/70 hover:dark:text-black
         hover:text-[#184C3D]  max-w-full text-sm ${font}
          active:dark:text-black dark:text-white
         ${active ? "bg-[#36AF8D] dark:bg-[#36AF8D] antialiased  dark:text-black text-white" : "dark:bg-[#1F2323]  bg-[#E6E7EB] shadow-none text-[#184C3D] dark:text-white"}
         `}
            disabled={disable}
            size={size}
            onClick={onClick}
        >{children}</Button>
    )
}