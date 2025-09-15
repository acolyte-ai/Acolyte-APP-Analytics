import { Button } from "@/components/ui/button"

type Suggestion = {
    topic: string,
    time: string
}

export default function SuggestionsTest() {

    const tests = [
        {
            topic: "topic 1",
            time: "10 min"
        },
        {
            topic: "topic 1",
            time: "10 min"
        },
        {
            topic: "topic 1",
            time: "10 min"
        }
    ]


    return (
        <div className=" 2xl:mb-[21px] mb-[14px] space-y-4 max-lg:space-y-3 w-full">
            <p className="text-[18px] 2xl:text-[20px]  font-semibold font-pt-sans">Suggested for you</p>
            <div className="w-full grid grid-cols-2 gap-8 max-lg:gap-3 md:grid-cols-4">
                {tests.map((item: Suggestion, index: number) => (
                    <Button key={index} className="dark:bg-[#2D3130] bg-white max-w-[160px] 2xl:w-[210px] 2xl:mr-5 mr-3
                    font-pt-sans 2xl:px-[17px] 2xl:py-[16px] border border-[#B8B8B8] dark:border-none
                 px-[15px] py-[14px] rounded-[10px] 2xl:rounded-[16px]">
                        <div className="flex items-center justify-between w-full ">
                            <p className="dark:text-[#DEDEDE] text-black font-medium text-[15px] 2xl:text-[17px]">{item.topic}</p>
                            <p className="dark:text-[#959595] text-black font-medium text-xs 2xl:text-[13px]">({item.time})</p>
                        </div>
                    </Button>
                ))
                }

            </div>

        </div>
    )
}