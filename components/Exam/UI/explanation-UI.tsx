import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image"
import ExplanationForQuestions from "../dailytest/explanation-test";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export default function ExplanationUI({ elaborate, data, seeWhy, handleElaborate, attempted }) {
    const safeJsonParse = (value, fallback = false) => {
        if (!value || value === "null" || value === "undefined") return fallback;
        try {
            return JSON.parse(value);
        } catch (error) {
            return fallback;
        }
    };
    const url = window.location.pathname;
    const id = url.split('/').pop();
    const isCompleted = safeJsonParse(localStorage.getItem(`aco-isCompleted-${id}`));
    const isSimulated = safeJsonParse(localStorage.getItem("aco-isSimulated"));

    const checkCondition = isCompleted
        ? (seeWhy || attempted)
        : isSimulated
            ? (seeWhy && attempted)
            : (seeWhy || attempted);

    return (


        <div className="h-full w-full">

            <div className="h-full overflow-y-auto no-scrollbar">

                {
                    (data.photo && !elaborate) &&
                    <div className="h-72 2xl:h-[376px] w-full p-6 dark:bg-[#1A1B1F] bg-[#F3F4F9] dark:border-none border border-[#B8B8B8] dark:shadow-none shadow-[2px_3px_4px_0_rgba(0,0,0,0.10)] rounded-lg 2xl:mb-10 mb-6 px-[15px] py-[22px]">
                        <Image
                            src={data.photo}
                            height={12}
                            width={12}
                            alt={"icon"}
                            className="w-full h-full  object-contain p-4"
                        />
                    </div>
                }

                {checkCondition && (data.explanation || data.sub_questions) &&
                    <div className=" h-auto  w-full py-4 px-[16px] dark:bg-[#1A1B1F] bg-[#F3F4F9] text-black dark:text-white dark:border-none border border-[#B8B8B8] dark:shadow-none shadow-[2px_3px_4px_0_rgba(0,0,0,0.10)]
                             rounded-lg 2xl:space-y-6 2xl:py-6 2xl:px-6">
                        <p className="text-[15px] 2xl:text-[16px] mb-5 font-medium text-black dark:text-white flex items-center gap-[15px]"> <Check className="border rounded-sm w-5 h-5 2xl:w-7 2xl:h-7 bg-emerald-600" /> Explanation</p>

                        <div className="overflow-y-auto no-scrollbar  ">
                            <ExplanationForQuestions data={data} />

                        </div>
                        <div className="flex items-end justify-end font-[futureHeadline] h-fit w-full ">
                            <Button variant={"ghost"} className="text-emerald-400 dark:text-emerald-400 my-5 font-medium text-[14px] items-end 2xl:text-[14px]"
                                onClick={() => handleElaborate(!elaborate)}
                            >{!elaborate ? "Elaborate" : "collapse"}</Button>
                        </div>
                    </div>
                }
            </div>
        </div>

    )
}