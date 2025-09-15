
import { ScrollArea } from "@/components/ui/scroll-area";
import ScoreCard from "../UI/card_score";
import AiSuggestionItems from "../UI/suggestion";


const suggestion = [
    {
        title: "Focus on pathology concepts!",
        name: "Create quiz"
    },
    {
        title: "practice more Mcq's",
        name: "Create quiz"
    },
    {
        title: "Strengthen anatomy",
        name: "Create quiz"
    },
    {
        title: "Focus on pathology concepts!",
        name: "Create quiz"
    },
    {
        title: "practice more Mcq's",
        name: "Create quiz"
    },
    {
        title: "Strengthen anatomy",
        name: "Create quiz"
    }

]

export default function AiSuggestion() {

    return (
        <div className="col-span-8 md:col-span-4 overflow-hidden relative">
            <p className="text-[22px] 2xl:text-[24px] font-causten-semibold mb-5 2xl:pb-4 max-lg:pb-10 max-md:pb-5 pb-5 2xl:mb-[18px] text-[#184C3D] dark:text-white">
                AI suggestion
            </p>
            <ScrollArea className="h-[350px] 2xl:h-[500px] max-md:pb-20">
                <div className="flex flex-col gap-8 2xl:gap-6 w-full">
                    {suggestion.map((item: { name: string, title: string }, index: number) => (
                        <ScoreCard
                            key={index}
                            className="dark:bg-[#181A1D] bg-[#F3F4F9] dark:shadow-[inset_0_0_8px_#B8B8B82B] dark:border-none border border-[#B8B8B8] shadow-md"
                        >
                            <AiSuggestionItems
                                name={item.name}
                                title={item.title}
                            />
                        </ScoreCard>
                    ))}
                </div>
            </ScrollArea>

            {/* Development Overlay */}
            <div className="absolute inset-0 dark:bg-black/60 bg-[#ebebf5]/60 backdrop-blur-sm flex items-center justify-center z-50">
                <div className=" px-8 py-6 rounded-lg  ">
                    <div className="flex items-center gap-3">

                        <h3 className="text-xl font-causten-semibold dark:text-white text-black">
                            In Development
                        </h3>
                    </div>
                    <p className="dark:text-white text-black mt-2 text-sm">
                        This feature is currently being developed
                    </p>
                </div>
            </div>
        </div>

    )
}