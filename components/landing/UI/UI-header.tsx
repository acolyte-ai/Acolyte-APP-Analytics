import {
    Menubar,

    MenubarMenu,

    MenubarTrigger,
} from "@/components/ui/menubar"
import { Moon } from "lucide-react"
export function HeaderMenubar() {
    return (
        <Menubar className="py-[6px] px-[18px] rounded-[22px] shadow-inner shadow-[#FFFFFF6E] bg-[#060606A1] dark:bg-[#060606A1] space-x-10 border-none h-[52px]">
            <MenubarMenu>
                <MenubarTrigger className="text-[16px] font-medium text-[#7E7E7E] dark:hover:text-emerald-500  hover:text-emerald-500 data-[state=open]:bg-emerald-500 data-[state=open]:text-emerald-500 dark:focus:bg-neutral-800 dark:focus:text-neutral-50 dark:data-[state=open]:bg-emerald-500 dark:data-[state=open]:text-emerald-500">Home</MenubarTrigger>

            </MenubarMenu>
            <MenubarMenu>
                <MenubarTrigger className="text-[16px] font-medium text-[#7E7E7E]  dark:hover:text-emerald-500  hover:text-emerald-500 data-[state=open]:bg-emerald-500 data-[state=open]:text-emerald-500 dark:focus:bg-neutral-800 dark:focus:text-neutral-50 dark:data-[state=open]:bg-emerald-500 dark:data-[state=open]:text-emerald-500">Personality</MenubarTrigger>

            </MenubarMenu>
            <MenubarMenu>
                <MenubarTrigger className="text-[16px] font-medium text-[#7E7E7E]  dark:hover:text-emerald-500  hover:text-emerald-500 data-[state=open]:bg-emerald-500 data-[state=open]:text-emerald-500 dark:focus:bg-neutral-800 dark:focus:text-neutral-50 dark:data-[state=open]:bg-emerald-500 dark:data-[state=open]:text-emerald-500">FAQ & Resources</MenubarTrigger>

            </MenubarMenu>
            <MenubarMenu>
                <MenubarTrigger className="text-[16px] font-medium text-[#7E7E7E]  dark:hover:text-emerald-500  hover:text-emerald-500 data-[state=open]:bg-emerald-500 data-[state=open]:text-emerald-500 dark:focus:bg-neutral-800 dark:focus:text-neutral-50 dark:data-[state=open]:bg-emerald-500 dark:data-[state=open]:text-emerald-500">Contact & About</MenubarTrigger>

            </MenubarMenu>
            <MenubarMenu>
                <MenubarTrigger className="text-[16px] font-medium bg-[#7E7E7E] text-[#7E7E7E] rounded-full  hover:bg-emerald-500 dark:hover:bg-emerald-500 p-1  dark:hover:text-emerald-500  hover:text-emerald-500 data-[state=open]:bg-emerald-500 data-[state=open]:text-emerald-500 dark:focus:bg-neutral-800 dark:focus:text-neutral-50 dark:data-[state=open]:bg-emerald-500 dark:data-[state=open]:text-emerald-500">
                    <Moon fill="black" />
                </MenubarTrigger>

            </MenubarMenu>
            <MenubarMenu>
                <MenubarTrigger>
                    <div

                        className={`shadow-inner shadow-[#FFFFFF6E] font-[Karla] font-bold text-[14px] data-[state=open]:bg-emerald-500 data-[state=open]:text-emerald-500 dark:focus:bg-neutral-800 dark:focus:text-neutral-50 dark:data-[state=open]:bg-emerald-500 dark:data-[state=open]:text-emerald-500 dark:hover:text-emerald-500  hover:text-emerald-500  rounded-full px-[25px]  py-2.5
                        'bg-[#5C5C5C] dark:bg-[#5C5C5C] cursor-not-allowed'
                                                    }`}
                    >
                        Login
                    </div>
                </MenubarTrigger>

            </MenubarMenu>
        </Menubar>
    )
}
