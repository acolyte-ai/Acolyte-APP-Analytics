import { Card, CardContent } from "@/components/ui/card"



export default function ScriptConcordanceTest({ hypothesis, info, vignette, question }: { hypothesis: string, info: string, vignette: string, question: string }) {
    return (
        <Card className="bg-transparent dark:bg-transparent border-none p-0 pb-[5px] shadow-none">
            <CardContent className="space-y-[20px] text-base text-foreground p-0 md:text-[15px] text-[13px]  font-medium">
                <div>
                    <p>
                        <span className="text-[#36AF8D]">Clinical Vignette :</span>{vignette}
                    </p>
                </div>



                <div>
                    <p>
                        <span className="text-[#36AF8D]">Initial Hypothesis :</span>
                        <span>          {hypothesis}</span>
                    </p>
                </div>

                <div>
                    <p>
                        <span className="text-[#36AF8D]">New Information :</span>
                        <span> {info}</span>
                    </p>
                </div>

                <div>
                    <p>
                        <span className="text-[#36AF8D]">Question :</span>
                        {question}
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
