import { Button } from "@/components/ui/button"

type Suggestion = {
    topic: string,
    time: string
}

export default function AdditionalSuggestionsTest() {

    const tests = localStorage.getItem("aco-exam-topic")?.split(",") || ["-", "-"]


    return (
        <div className="2xl:space-y-6 col-span-3 max-md:col-span-4 space-y-2 w-full" >
            <p className="text-[18px] mb-[13px] 2xl:text-[20px] font-semibold dark:text-[#C1C1C1] text-[#184C3D] font-pt-sans">Additional topics</p>

            <div className=" py-[14px] px-[16px] 2xl:px-[18px] 2xl:py-[16px]  overflow-y-auto no-scrollbar h-[65px]
            rounded-lg dark:border-none border dark:border-[#B8B8B8] border-[#C7C7C7] bg-[#F3F4F9] dark:bg-[#1F2323]">
                <div className="flex items-center flex-wrap justify-start max-md:gap-3 gap-[26px] 2xl:gap-[40px]">
                    {tests.map((item, index) => (
                        <Button
                            key={index}
                            className="dark:bg-[#3D3E42] bg-[#E8EAF3] hover:bg-[#E8EAF3] dark:hover:bg-[#3D3E42] border border-[#ABABAB] dark:border-none
                            font-pt-sans dark:shadow-none shadow-md py-[14px] px-[16px] 2xl:px-[18px] 2xl:py-[16px] rounded-[11px] whitespace-nowrap"
                        >
                            <div className="flex items-center justify-center font-medium">
                                <p className="dark:text-white text-[#2D3130] text-[15px] 2xl:text-[17px]">{item}</p>
                                {/* <p className="dark:text-[#959595]">({item.time})</p> */}
                            </div>
                        </Button>
                    ))}
                </div>
            </div>


        </div>
    )
}