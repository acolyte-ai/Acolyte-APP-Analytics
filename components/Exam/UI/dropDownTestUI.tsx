import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDownIcon } from "lucide-react";

interface Props {
    name: string;
    value: string;
    options: string[];
    disabled?: boolean | false;
    changeOption: (val: string) => void;
}
export function DropdownCustomTest({ name, value, options, changeOption, disabled }: Props) {
    return (
        <div className="space-y-5 max-lg:space-y-3 col-span-1 w-full ">

            <p className="text-[18px] 2xl:text-[20px] dark:text-white text-[#184C3D] text-nowrap truncate font-semibold font-pt-sans">{name}</p>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="default"
                        className="w-full dark:bg-[#1F2323] hover:dark:bg-[#2a3030] pl-4 bg-[#F3F4F9] shadow-md hover:bg-white active:bg-white
                        active:dark:bg-[#1F2323] text-[13px] max-lg:text-sm py-[14px] px-[16px] 2xl:px-[25px] 2xl:py-[17px] border border-[#C7C7C7] dark:border-none
                        dark:text-[#AAAAAA] text-black items-center justify-between flex"
                        disabled={disabled}
                    >{value}
                        <ChevronDownIcon />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full dark:bg-[#1F2323]
                         py-[14px]  2xl:py-[17px] text-center
                        dark:text-[#AAAAAA] mt-3 font-medium text-[13px] 2xl:text-[14px]">
                    {
                        options.map((item: string, index: number) => (
                            <DropdownMenuItem key={index}
                                className="w-full hover:dark:bg-[#2a3030] flex items-center justify-center hover:bg-[#788989] active:bg-[#7a9595] active:dark:bg-[#1F2323]"
                                onClick={() => {
                                    changeOption(item)
                                }}
                            >{item}</DropdownMenuItem>
                        )

                        )
                    }


                </DropdownMenuContent>
            </DropdownMenu>
        </div>

    )
}
