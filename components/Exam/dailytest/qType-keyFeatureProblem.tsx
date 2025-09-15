import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

const stages = [
    {
        title: "Task 1",
        question: "What is the most critical immediate assessment needed?",
        options: ["MRI brain", "CT chest", "CT head without contract", "Carotid ultrasound"],
        selected: "Chest X-ray",
    },
    {
        title: "Task 2",
        result: "",
        question: "If CT shows no hemorrhage, what is the next most critical steps?",
        options: ["Order MRI for confirmation", "Start aspirin immediately", "Check INR and consider reversal"],
        selected: "Chest X-ray",
    },
];

export default function KeyFeatureProblems() {
    return (
        <div className="w-full">
            {stages.map((stage, index) => (
                <Card key={index} className="bg-transparent dark:bg-transparent p-0 border-none mb-[41px]">
                    <CardContent className="p-0 ">
                        <p className="text-[#36AF8D] font-medium text-[15px]">{stage.title} :</p>
                        {stage?.result && <p className="text-white font-medium text-[15px] mb-6">Result : {stage?.result}</p>}
                        <p className="text-white font-medium text-[15px] mb-6">{stage.question}</p>

                        <div className="space-y-7 mt-[27px] font-pt-sans 2xl:text-[15px]  text-[13px] font-medium">
                            {stage.options.map((option, i) => (
                                <div
                                    key={i}
                                    className={`flex items-center space-x-3 dark:bg-[#181A1D] bg-[#F3F4F9] shadow-[inset_0_0_8px_#B8B8B82B] h-[38px] 2xl:h-[47px] 2xl:p-4 dark:text-white text-black  px-5 py-2 rounded-[7px] text-sm ${option === stage.selected ? "bg-emerald-900/50 " : ""
                                        }`}
                                >
                                    <Checkbox id={`${stage.title}-${i}`} checked={option === stage.selected} className={` border-[#EDEDED] ${option === stage.selected ? "bg-[#36AF8D] dark:bg-[#36AF8D]" : "bg-[#2A2A2A] dark:bg-[#2A2A2A] "}`} />
                                    <Label htmlFor={`${stage.title}-${i}`} className="text-white">{option}</Label>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
