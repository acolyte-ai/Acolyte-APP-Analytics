import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";

// const subjects = [
//     { name: "Neurophysiology", value: 50 },
//     { name: "Action Potentials", value: 40 },
//     { name: "Autonomic Nervous System", value: 10 },
// ];

export default function TopicInvolvementCard({ data }) {
    return (
        <Card className=" dark:shadow-sm shadow-none w-full bg-transparent dark:bg-transparent p-0 border-none ">
            <CardContent className="p-0 shadow-none">
                <h3 className=" font-normal tracking-normal text-[22px] font-[futureHeadlineBold] mb-6 text-[#228367] dark:text-white">Topic Involvement</h3>



                <div className="overflow-y-auto no-scrollbar dark:bg-[#181A1D] bg-[#F3F4F9] h-[215px]  dark:shadow-[inset_0_0_8px_#B8B8B82B]
                dark:border-none border border-[#B8B8B8] shadow-md px-6 py-5 text-white rounded-xl">
                    {!data ? <div className="w-full h-[120px]  items-center justify-center text-center">No data</div> :
                        <div className="space-y-3">
                            {data?.subjectPerformance.map((subject) => (
                                <div key={subject.subject} className="space-y-4">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xl text-black dark:text-white">{subject.subject}</span>
                                        <span className={`${subject.accuracy >= 80 ? "text-emerald-500" :
                                            subject.accuracy >= 60 ? "text-[#F4A300]" :
                                                subject.accuracy >= 40 ? "text-red" :
                                                    "text-red"
                                            } font-semibold text-[15px]`}>
                                            {subject.accuracy}%
                                        </span>
                                    </div>
                                    {/* Custom Progress Bar using div */}
                                    <div className="w-full h-1.5 dark:bg-[#3A342B] bg-[#B9B9B9] rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-300 ease-out ${subject.accuracy >= 80 ? "bg-emerald-500" :
                                                subject.accuracy >= 60 ? "bg-[#EC990C]" :
                                                    subject.accuracy >= 40 ? "bg-red" :
                                                        "bg-red"
                                                }`}
                                            style={{ width: `${subject.accuracy}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    }
                </div>
            </CardContent>
        </Card>
    );
}
