




import { useId } from "react"

import { Input } from "@/components/ui/input"

export default function DefinitionTypeInput() {
    const id = useId()
    return (
        <div className="group relative px-4 max-sm:my-4">
            <label
                htmlFor={id}
                className="origin-start text-muted-foreground/70 group-focus-within:text-foreground has-[+input:not(:placeholder-shown)]:text-foreground absolute top-1/2 block -translate-y-1/2 cursor-text px-1 text-sm transition-all group-focus-within:pointer-events-none group-focus-within:top-0 group-focus-within:cursor-default group-focus-within:text-xs group-focus-within:font-medium has-[+input:not(:placeholder-shown)]:pointer-events-none has-[+input:not(:placeholder-shown)]:top-0 has-[+input:not(:placeholder-shown)]:cursor-default has-[+input:not(:placeholder-shown)]:text-xs has-[+input:not(:placeholder-shown)]:font-medium"
            >

            </label>
            <Input id={id} type="email" placeholder="Type Your Answer Here " className="dark:bg-[#181A1D] bg-[#F3F4F9] h-[43px] shadow-[inset_0_0_8px_#B8B8B82B] dark:text-white text-black 2xl:h-[47px] 2xl:p-4  px-5 py-2 rounded-[7px] xl:text-sm text-[13px] " />
        </div>
    )
}
