import React from "react";




export default function ExplanationForQuestions({ data }) {


    return (
        <ul className="w-full space-y-4 2xl:space-y-7  font-[futureHeadline] text-[15px] 2xl:text-[26px]">

            {
                (data.question_type === "CASE_BASED" || data.questionType === "CASE_BASED") && <>
                    {data.sub_questions.map((subQuestion: any, subIndex: number) => (
                        <React.Fragment key={subIndex}>
                            <div className=" text-black dark:text-white text-sm 2xl:text-[18px] text-[15px]  leading-[18px] 2xl:leading-[22px]">{subQuestion.question_text}</div>
                            {subQuestion.explanation.map((explanationItem: any, index: number) => (
                                <li className="" key={index + 1}>
                                    {explanationItem.isCorrect && (
                                        <div className=" space-y-4 2xl:space-y-7">
                                            <p className="text-black dark:text-white text-sm 2xl:text-[18px] text-[15px] leading-[18px] 2xl:leading-[22px]">
                                                {index + 1}. {explanationItem.text}
                                            </p>
                                            <p className="text-emerald-400 text-[15px] leading-[18px] 2xl:text-[18px] 2xl:leading-[22px]">
                                                {explanationItem.explanation}
                                            </p>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </React.Fragment>
                    ))}


                </>
            }

            {
                (data.question_type === "MULTI_LOGIC" || data.questionType === "MULTI_LOGIC") && <>
                    {data.subQuestions.map((subQuestion: any, subIndex: number) => (
                        <React.Fragment key={subIndex}>
                            {/* <div className=" text-black dark:text-white text-sm 2xl:text-[18px] text-[15px] leading-[18px] 2xl:leading-[22px]">{subQuestion.question_text}</div> */}

                            <li className="" key={subIndex + 1}>

                                <div className=" space-y-4 2xl:space-y-7">
                                    <p className="text-black dark:text-white text-sm 2xl:text-[18px] text-[15px] leading-[18px] 2xl:leading-[22px]">
                                        {subQuestion.correct_answer}. {subQuestion.question_text}
                                    </p>
                                    <p className="text-emerald-400 text-[15px] leading-[18px] 2xl:text-[18px] 2xl:leading-[22px]">
                                        {subQuestion.explanation}
                                    </p>
                                </div>

                            </li>

                        </React.Fragment>
                    ))}


                </>
            }

            {
                (data.question_type === "EXTENDED_MATCHING" || data.questionType === "EXTENDED_MATCHING") && <>
                    {
                        data.explanation.map((item, index) =>
                        (<li className="" key={index + 1}>
                            {
                                item.isCorrect && (
                                    <div className="space-y-4 2xl:space-y-7 ">
                                        <p className="text-black dark:text-white text-sm 2xl:text-[18px] text-[15px] leading-[18px] 2xl:leading-[22px]">{index + 1}. {item.text}</p>
                                        {item.explaination.map((items) =>
                                        (<div className=" space-y-2 2xl:space-y-4" key={items.item_b}>
                                            <p className="text-black dark:text-white text-sm 2xl:text-[18px] text-[15px] leading-[18px] 2xl:leading-[22px]">{items.item_b}-{items.item_a}</p>
                                            <p className={`${item.isCorrect ? "text-emerald-400" : "text-red"} text-[15px] leading-[18px] 2xl:text-[18px] 2xl:leading-[22px]`}>{items.explanation}</p>
                                        </div>))}
                                    </div>
                                )
                            }
                        </li>)
                        )
                    }


                </>
            }


            {
                (data.question_type === "FILL_IN_THE_BLANKS" || data.question_type === "MCQ" || data.questionType === "FILL_IN_THE_BLANKS" || data.questionType === "MCQ") && <>
                    {
                        data.explanation.map((item, index) =>
                        (<li className="" key={index + 1}>
                            {
                                item.isCorrect && (<div className=" space-y-4 2xl:space-y-7">
                                    <p className="text-black dark:text-white text-sm 2xl:text-[18px] text-[15px] leading-[18px] 2xl:leading-[22px]">{index + 1}. {item.text}</p>
                                    <p className={`${item.isCorrect ? "text-emerald-400" : "text-red"} text-[15px] leading-[18px] 2xl:text-[18px] 2xl:leading-[22px]`}>{item.explanation}</p>
                                </div>)
                            }
                        </li>)
                        )
                    }
                </>
            }




            {
                (data.question_type === "SCRIPT_CONCORDANCE" || data.questionType === "SCRIPT_CONCORDANCE") && <>
                    <ul>
                        <li className="">
                            {
                                (<div className=" space-y-4 ">
                                    <p className="text-black dark:text-white text-sm 2xl:text-[18px] text-[15px] leading-[18px] 2xl:leading-[22px] mt-4">clinical reasoning</p>
                                    <p className={`text-emerald-400  text-[15px] leading-[18px] 2xl:text-[18px] 2xl:leading-[22px]`}>{data?.explanation?.clinical_reasoning}</p>
                                </div>)
                            }
                        </li>
                        <li className="">
                            {
                                (<div className=" space-y-4 ">
                                    <p className="text-black dark:text-white text-sm 2xl:text-[18px] text-[15px] leading-[18px] 2xl:leading-[22px] mt-4">Educational Notes</p>
                                    <p className={`text-emerald-400  text-[15px] leading-[18px] 2xl:text-[18px] 2xl:leading-[22px]`}>{data?.explanation?.educational_notes}</p>
                                </div>)
                            }
                        </li>
                        <li className="">
                            {
                                (<div className=" space-y-4 ">
                                    <p className="text-black dark:text-white text-sm 2xl:text-[18px] text-[15px] leading-[18px] 2xl:leading-[22px] mt-4">Points Of Disagreement</p>
                                    <p className={`text-emerald-400  text-[15px] leading-[18px] 2xl:text-[18px] 2xl:leading-[22px]`}>{data?.explanation?.points_of_disagreement}</p>
                                </div>)
                            }
                        </li>
                        <li className="">
                            {
                                (<div className=" space-y-4 ">
                                    <p className="text-black dark:text-white text-sm 2xl:text-[18px] text-[15px] leading-[18px] 2xl:leading-[22px] mt-4">Justification</p>
                                    <p className={`text-emerald-400  text-[15px] leading-[18px] 2xl:text-[18px] 2xl:leading-[22px]`}>{data?.explanation?.justification}</p>
                                </div>)
                            }
                        </li>
                    </ul>



                </>
            }


        </ul>
    )
}