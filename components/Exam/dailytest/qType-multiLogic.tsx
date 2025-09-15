import { Card, CardContent } from "@/components/ui/card"


// const stages = [
//     {
//         title: "Stage 1",
//         question: "What is the most appropriate initial diagnostic test?",
//         options: ["Sputum culture", "CT chest", "Chest X-ray"],
//         selected: "Chest X-ray",
//     },
//     {
//         title: "Stage 2",
//         result: "Chest X-ray shows right lower lobe consolidation.",
//         question: "What is the most appropriate initial treatment?",
//         options: ["Sputum culture", "CT chest", "Chest X-ray"],
//         selected: "Chest X-ray",
//     },
// ];




export default function MultiLogicQuestions({ stages, name }) {

    return (
        <div className="w-full">
            {/* {stages.map((stage, index) => ( */}
            <Card className="bg-transparent dark:bg-transparent p-0 border-none mb-[41px]  shadow-none">
                <CardContent className="p-0 border-none shadow-none">
                    <p className="text-[#36AF8D] font-medium text-[15px] mb-6">{name} </p>

                    <p className="dark:text-white text-black font-medium text-[15px] mb-4">{stages.question_text}</p>
                    {stages.description && <p className="dark:text-white text-black font-medium text-[15px] mb-6">description : {stages.description}</p>}


                </CardContent>
            </Card>



        </div>
    );
}
