import { ScrollArea } from "@/components/ui/scroll-area";
import ScoreCard from "../UI/card_score";
import TestScoreUI from "../UI/testScoreUI";




type TestType = {
    topics: string;
    name: string;
    startedAt: string;
    score: string;
    attemptId: string;
    question_bank_id: string;
    main_topics?: string;

}


export default function TestScore({ data }) {
    const formatDate = (isoString) => {
        const date = new Date(isoString);

        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        };

        return date.toLocaleDateString('en-US', options);
    };
    return (
        <ScrollArea className="h-[350px] 2xl:h-[500px]  overflow-hidden">
            <div className="grid grid-cols-1 gap-7 2xl:gap-9 w-full ">

                {
                    data?.map((item: TestType, index: number) => (


                        <ScoreCard key={index} className=" font-causten-semibold dark:bg-[#181A1D]  bg-[#F3F4F9]  dark:shadow-[inset_0_0_8px_#B8B8B82B] dark:border-none border border-[#B8B8B8] shadow-md ">
                            <TestScoreUI
                                name={item.topics ?
                                    item.topics
                                        .split(' ')
                                        .slice(0, 2)
                                        .map(word => word.charAt(0).toUpperCase())
                                        .join('') : item.main_topics ?
                                        item.main_topics.split(' ')
                                            .slice(0, 2)
                                            .map(word => word.charAt(0).toUpperCase())
                                            .join('') :
                                        "UN"}
                                subject={item.topics}
                                date={formatDate(item.startedAt)}
                                score={item.score}
                                id={item.attemptId}
                                q_id={item.question_bank_id}
                                subjectName={item.subject}

                            />
                        </ScoreCard>


                    ))
                }

            </div>
        </ScrollArea>
    );
}