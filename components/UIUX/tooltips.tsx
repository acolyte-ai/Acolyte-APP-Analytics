import { Button } from "@/components/ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { IoMdInformationCircleOutline } from "react-icons/io"

export function Tooltips({ info, title }: { info: string | undefined, title: string | undefined }) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" className="px-1 hover:bg-transparent dark:hover:bg-transparent">

                        <IoMdInformationCircleOutline className="dark:text-gray-400 text-gray-500  cursor-pointer" size={15} />
                    </Button>
                </TooltipTrigger>
                <TooltipContent className="dark:bg-transparent bg-transparent">

                    <div className="custom-tooltip bg-[#EBE6F8] rounded-3xl max-w-xs min-w-44" >
                        <div className="tooltip-content p-2">

                            <div className=" p-4">
                                <h2 className="tooltip-title text-black font-bold text-lg ">{title}</h2>
                                <p className="tooltip-text text-black w-full leading-4 text-wrap text-xs py-2 min-h-20">{info}</p>
                            </div>

                        </div>

                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}