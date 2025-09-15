import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import useUserId from "@/hooks/useUserId";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import stopwatch from "@/public/stopwatchYellow.svg"
import { Progress } from "@/components/ui/progress";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { ChevronUp } from "lucide-react";
import { IconSquareChevronUpFilled } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import halfHeart from "@/public/heartBroken.svg"
import heart from "@/public/greenheart.svg"
import thermo from "@/public/thermometergreen.svg"
import chest from "@/public/chestXray.svg";
import lock from "@/public/lock.svg"


interface QuestionData {
    case: string;
    patient: string;
    clinicalEvidence: {
        bp: string;
        hr: string;
        rr: string;
        spo2: string;
    };
    options: string[];
}

interface Props {
    next: (val: boolean) => void;
}

type ClinicalTest = {
    name: string;
    isUnlocked: boolean;
};

type DiagnosisOption =
    | "Acute Myocardial Infarction"
    | "Pulmonary Embolism"
    | "Aortic Dissection"
    | "Panic Attack";

const CaseQuestion: React.FC<Props> = ({ next }) => {
    const [minutes, setMinutes] = useState(2);
    const [seconds, setSeconds] = useState(35);
    const [loading, setLoading] = useState(false);
    const [question, setQuestion] = useState();
    const [selectedOptions, setSelectedOptions] = useState({ A: "", B: "", C: "", D: "" });
    const [selectOption, setSelectOption] = useState("");
    const [result, setResult] = useState(null);
    const [imageview, setImageView] = useState<{
        img1: boolean,
        img2: boolean,
        img3: boolean,
    }>({
        img1: false,
        img2: false,
        img3: false
    })
    const userId = useUserId();
    const [clinicalTests, setClinicalTests] = useState<ClinicalTest[]>([
        { name: "Chest X-Ray", isUnlocked: true },
        { name: "Unlock (paid)", isUnlocked: false },
        { name: "Unlock (paid)", isUnlocked: false },
    ]);

    useEffect(() => {
        fetchActiveQuestion()
    }, [])


    const fetchActiveQuestion = async () => {
        try {
            setLoading(true);
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL + "/dev";
            const response = await fetch(`${API_BASE_URL}/qotd/active`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("No active question found for today");
            }

            const data = await response.json();
            // The API response contains the question in data.question
            setQuestion(data.question);

            // const options = [[data.question.options["A"],"A"], [data.question.options["B"],"B"], [data.question.options["C"],"C"],[ data.question.options["D"],"D"]]
            // Reset selected option when we get a new question
            setSelectedOptions(data.question.options);
            console.log(data.question.options["A"])
        } catch (err: any) {

            setQuestion(null);
        } finally {
            setLoading(false);
        }
    };


    const submitAnswer = async () => {
        try {
            setLoading(true);
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL + "/dev";
            // Send the selected option key (A, B, C, D) to the API
            console.log(question?.questionId,
                selectOption,)
            const response = await fetch(`${API_BASE_URL}/qotd/submit`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId,
                    questionId: question?.questionId || "",
                    selectOption,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to submit answer");
            }

            const data = await response.json();
            console.log(data)
            // setResult({
            //     isCorrect: data.isCorrect,
            //     earnedPoints: data.earnedPoints,
            //     message: data.message,
            // });

            if (data.isCorrect) {
                next(true)
            } else {
                next(false)
            }

        } catch (err) {
            // setResult({
            //     isCorrect: false,

            // });
            next(false)
        } finally {
            setLoading(false);
        }
    };

    const questionData: QuestionData = {
        case: "42 year old male with sudden chest pain and shortness of breath arrives at ER.",
        patient: "Smoker, hypertension",
        clinicalEvidence: {
            bp: "160/95 mmHg",
            hr: "110 bpm",
            rr: "24 min",
            spo2: "94%",
        },
        options: [
            "Acute Myocardial Infarction",
            "Pulmonary Embolism",
            "Aortic Dissection",
            "Panic Attack",
        ],
    };



    const TOTAL_TIME = 31; // seconds
    const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);

    useEffect(() => {
        // && !submitted
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        }

        //   if (timeLeft === 0 && !submitted) {
        //     handleSubmit(); // Auto submit
        //   }
    }, [timeLeft]);

    const progressPercentage = ((TOTAL_TIME - timeLeft) / TOTAL_TIME) * 100;

    // const handleOptionChange = (option: string) => {
    //     setSelectedOption((prevSelected) =>
    //         prevSelected.includes(option)
    //             ? prevSelected.filter((o) => o !== option)
    //             : [...prevSelected, option]
    //     );
    // };
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    };

    const handleTestUnlock = (index: number) => {
        setClinicalTests((prevTests) =>
            prevTests.map((test, i) =>
                i === index ? { ...test, isUnlocked: true } : test
            )
        );
    };





    const quesData = {
        "message": "Question of the Day created successfully",
        "question": {
            "questionId": "qotd_f8a72e15-9c3f-4b0a-af87-65d82c7a4d91",
            "complaintDescription": "Sudden chest pain and shortness of breath arrives at ER",
            "gender": "Male",
            "age": "45 years",
            "info": "Patient presents with sudden onset of sharp chest pain that worsens with deep breathing. Pain radiates to the left shoulder.",
            "vitals": {
                "bp": "138/85",
                "heartRate": "110 bpm",
                "temp": "37.2°C",
                "spo2": "94%"
            },
            "clinicalEvidence": "# Laboratory Findings\n- **D-dimer:** 1580 ng/mL (elevated)\n- **CBC:** WBC 11.2 × 10^9/L, slightly elevated\n- **ABG:** pH 7.45, PaO2 68 mmHg, PaCO2 30 mmHg\n\n# Physical Examination\n- **Respiratory:** Decreased breath sounds over right lower lobe\n- **Cardiovascular:** Tachycardia, regular rhythm\n- **General:** Acute respiratory distress with increased work of breathing\n\n# Patient History\n- Nonproductive cough for 2 days\n- Recent long-haul flight from Tokyo to New York (14 hours) completed 3 days ago\n- No prior history of cardiac or pulmonary disease\n- No leg pain or swelling reported",
            "xRays": [
                {
                    "name": "Chest X-Ray",
                    "url": "https://acme-medical-images.s3.amazonaws.com/chest-xray-45m.jpg",
                    "points": 5
                },
                {
                    "name": "CT Pulmonary Angiogram",
                    "url": "https://acme-medical-images.s3.amazonaws.com/ct-angiogram-45m.jpg",
                    "points": 10
                },
                {
                    "name": "ECG",
                    "url": "https://acme-medical-images.s3.amazonaws.com/ecg-45m.jpg",
                    "points": 3
                }
            ],
            "options": [
                "Pneumonia",
                "Pulmonary Embolism",
                "Myocardial Infarction",
                "Pneumothorax",
                "Aortic Dissection"
            ],
            "correctOption": "Pulmonary Embolism",
            "topic": "Respiratory",
            "difficulty": "Intermediate",
            "activeDate": "2025-04-30",
            "points": 25,
            "createdAt": "2025-04-29T15:23:47.189Z",
            "status": "SCHEDULED"
        }
    }

    const diagnoses: DiagnosisOption[] = quesData.question.options;

    return (
        <div className="flex flex-col items-center justify-center
        w-full h-full text-white  bg-[url(/bg-blue.svg)] bg-center ">
            <ScrollArea className="h-full max-w-md w-full p-6">
                <div className="w-full max-w-md max-ms:max-w-sm py-6 px-2">
                    <div className="flex justify-between mb-4 max-sm:mb-2 text-sm text-gray-300">
                        <div className="space-x-1"><span className="text-base font-semibold">Case of the day :</span>
                            <span className="text-base text-emerald-500 font-semibold dark:text-emerald-500">Headache</span></div>
                        <span className="text-amber-400 flex items-center gap-1 font-semibold text-xs px-2 rounded-full border border-amber-400/30">
                            <Image
                                src={stopwatch}
                                alt="stopwatch"
                                height={15}
                                width={15}
                                className="w-4 h-4"
                            />
                            <p> {formatTime(seconds)}</p>
                        </span>

                    </div>

                    <Progress value={progressPercentage} className="h-1 mb-3 bg-amber-300  dark:bg-amber-300" />

                    <Accordion type="multiple" className="w-full max-w-md border-none">
                        <AccordionItem value="item-1" className="border-none ">
                            <AccordionTrigger>
                                <p className="text-xl font-[600]">Complaint</p>

                            </AccordionTrigger>
                            <AccordionContent className="w-full max-w-md py-0">

                                <div className="bg-[#143A3A] p-6 max-sm:p-4 rounded-lg ">

                                    <div className="mb-4">
                                        <div className="text-xl font-semibold mb-4">
                                            {quesData.question.complaintDescription}
                                        </div>
                                        <p className="text-emerald-400 font-semibold mb-2">PATIENT</p>

                                        <div className="text-base text-white grid grid-cols-2 space-y-2 h-full items-center w-full">
                                            <span className="col-span-1 flex items-center gap-2">  <Image
                                                src={halfHeart}
                                                alt="img"
                                                width={15}
                                                height={15}
                                                className="w-5 h-5 object-contain"
                                            />Gender: {quesData.question.gender}</span>
                                            <span className="col-span-1 flex items-center gap-2">  <Image
                                                src={thermo}
                                                alt="img"
                                                width={15}
                                                height={15}
                                                className="w-5 h-5 object-contain"
                                            />Age: {quesData.question.age} years</span>
                                            <span className="col-span-2 flex items-center justify-start  gap-2 ">  <Image
                                                src={heart}
                                                alt="img"
                                                width={15}
                                                height={15}
                                                className="w-5 h-5 object-contain "
                                            />{quesData.question.info}</span>
                                        </div>

                                    </div>
                                </div>

                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2" className="border-none">
                            <AccordionTrigger>  <p className="text-xl font-[600]">Vitals</p></AccordionTrigger>
                            <AccordionContent className="w-full max-w-md py-0">

                                <div className="bg-[#143A3A] p-6 max-sm:p-4 rounded-lg mb-2">

                                    <div className="mb-4">

                                        <p className="text-emerald-400 font-semibold mb-2">Vital Signs</p>

                                        <div className="text-sm text-white grid grid-cols-2 space-y-1 h-full items-center w-full">
                                            <div className="col-span-1 "> <span className="font-medium flex items-center gap-2">
                                                <Image
                                                    src={halfHeart}
                                                    alt="img"
                                                    width={15}
                                                    height={15}
                                                    className="w-5 h-5 object-contain"
                                                />
                                                BP :  {quesData.question.vitals.bp}</span></div>
                                            <div className="col-span-1 "> <span className="font-medium  flex items-center gap-2">
                                                <Image
                                                    src={thermo}
                                                    alt="img"
                                                    width={15}
                                                    height={15}
                                                    className="w-5 h-5 object-contain"
                                                />
                                                Temp: {quesData.question.vitals.temp}</span></div>
                                            <div className="col-span-1 "> <span className="font-medium col-span-1 flex items-center gap-2">
                                                <Image
                                                    src={heart}
                                                    alt="img"
                                                    width={15}
                                                    height={15}
                                                    className="w-5 h-5 object-contain"
                                                />
                                                HR :  {quesData.question.vitals.heartRate}</span></div>
                                            <div className="col-span-1 "> <span className="font-medium col-span-1 flex items-center gap-2">
                                                <Image
                                                    src={heart}
                                                    alt="img"
                                                    width={15}
                                                    height={15}
                                                    className="w-5 h-5 object-contain"
                                                />
                                                SpO₂ :  {quesData.question.vitals.spo2}</span></div>
                                        </div>

                                    </div>
                                </div>

                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3" className="border-none">
                            <AccordionTrigger>  <p className="text-xl font-[600]">Clinical Evidence</p></AccordionTrigger>
                            <AccordionContent className="w-full max-w-md py-0">
                                <div className="bg-[#143A3A] p-6 max-sm:p-4 rounded-lg mb-2">
                                    <div className="mb-4">
                                        <h3 className="font-semibold text-emerald-400 mb-2">Physical Explanation</h3>
                                        <p className="text-white text-base">
                                            {quesData.question.clinicalEvidence}
                                        </p>
                                    </div>

                                    {/* <div className="mb-4">
                                        <h3 className="font-semibold text-emerald-400 mb-2">Patient History</h3>
                                        <p className="text-white text-base">
                                            Patient reports progressively worsening cough with yellow-emerald sputum for 3 days.
                                            Associated with fever, chills, and right-sided chest pain worse on inspiration.
                                            Recent upper respiratory infection 1 week ago.
                                        </p>
                                    </div> */}

                                    <div>
                                        <h3 className="font-semibold text-emerald-400 mb-2">Clinical Tests Hints</h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className=" bg-[#225959] p-3 w-full col-span-1 rounded-lg space-y-2" key={0}>
                                                <div className="flex items-center w-full gap-4">
                                                    <Image
                                                        src={chest}

                                                        alt="img"
                                                        height={15}

                                                        width={15}
                                                    />
                                                    <h2>{quesData.question.xRays[0].name}</h2>
                                                </div>


                                                {
                                                    imageview.img1 ?
                                                        <Image alt="image" src={quesData.question.xRays[0].url}
                                                            height={30} width={30} className="w-full h-20 object-contain"
                                                        /> :

                                                        <Button

                                                            variant="default"
                                                            className={cn(
                                                                "text-sm w-full truncate ",
                                                                clinicalTests[0].isUnlocked
                                                                    ? "  bg-[#047857] text-white hover:bg-emerald-700"
                                                                    : " text-emerald-500 bg-white  "
                                                            )}
                                                            onClick={() => setImageView((prev) => ({ ...prev, img1: true }))}
                                                        >
                                                            <Image
                                                                src={lock}

                                                                alt="img"
                                                                height={15}
                                                                className="w-4 h-4 object-contain"
                                                                width={15}
                                                            />    <p className="text-xs">{quesData.question.xRays[0].name}</p>
                                                        </Button>

                                                }
                                            </div>
                                            <div className=" bg-[#225959] p-3 w-full col-span-1 rounded-lg space-y-2" key={0}>
                                                <div className="flex items-center w-full gap-4 " onClick={() => {

                                                }}>
                                                    <Image
                                                        src={chest}

                                                        alt="img"
                                                        height={15}

                                                        width={15}
                                                    />
                                                    <h2>Chest  X-Ray</h2>
                                                </div>
                                                {
                                                    imageview.img2 ?
                                                        <Image alt="image" src={quesData.question.xRays[1].url}
                                                            height={30} width={30} className="w-full h-20 object-contain"
                                                        /> :

                                                        <Button

                                                            variant="default"
                                                            className={cn(
                                                                "text-sm w-full truncate ",
                                                                clinicalTests[0].isUnlocked
                                                                    ? "  bg-[#047857] text-white hover:bg-emerald-700"
                                                                    : " text-emerald-500 bg-white  "
                                                            )}
                                                            onClick={() => setImageView((prev) => ({ ...prev, img2: true }))}
                                                        >
                                                            <Image
                                                                src={lock}

                                                                alt="img"
                                                                height={15}
                                                                className="w-4 h-4 object-contain"
                                                                width={15}
                                                            />    <p className="text-xs">{quesData.question.xRays[1].name}</p>
                                                        </Button>

                                                }
                                            </div>


                                            <div className=" bg-[#225959] p-3 w-full  col-span-2 rounded-lg space-y-2" key={0}>
                                                <div className="flex items-center w-full gap-4">
                                                    <Image
                                                        src={chest}

                                                        alt="img"
                                                        height={15}
                                                        className="w-4 h-4 object-contain"
                                                        width={15}
                                                    />
                                                    <h2>Chest  X-Ray</h2>
                                                </div>
                                                {
                                                    imageview.img3 ?
                                                        <Image alt="image" src={quesData.question.xRays[2].url}
                                                            height={30} width={30} className="w-full h-20 object-contain"
                                                        /> :

                                                        <Button

                                                            variant="default"
                                                            className={cn(
                                                                "text-sm w-full truncate ",
                                                                clinicalTests[0].isUnlocked
                                                                    ? "  bg-[#047857] text-white hover:bg-emerald-700"
                                                                    : " text-emerald-500 bg-white  "
                                                            )}
                                                            onClick={() => setImageView((prev) => ({ ...prev, img3: true }))}
                                                        >
                                                            <Image
                                                                src={lock}

                                                                alt="img"
                                                                height={15}
                                                                className="w-4 h-4 object-contain"
                                                                width={15}
                                                            />    <p className="text-xs">{quesData.question.xRays[2].name}</p>
                                                        </Button>

                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4" className="border-none">
                            <AccordionTrigger className="no-underline border-0">
                                <p className="text-xl font-[600]">Select Your Diagnosis</p>

                            </AccordionTrigger>
                            <AccordionContent className="w-full max-w-md py-0">


                                {/* Options */}
                                <div className="flex flex-col gap-4 mb-2">
                                    <label
                                        key={"A"}
                                        className={`flex items-center bg-[#143A3A] px-4 py-3 max-sm:py-2 max-sm:px-2 text-sm rounded-xl cursor-pointer transition-all ${selectOption === "A"
                                            ? "border border-emerald-400"
                                            : "border border-gray-700"
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            name="singleSelect" // <-- important! all radios must have same name
                                            value={diagnoses[0]}
                                            checked={selectOption === diagnoses[0]}
                                            onChange={() => setSelectOption(diagnoses[0])}
                                            className="form-radio h-5 w-5 text-emerald-600 dark:text-emerald-600 mr-4 bg-transparent bg-slate-900
                                            text-sm max-sm:text-xs checked:accent-emerald-500 accent-slate-900 dark:accent-slate-900"
                                        />
                                        <span>{diagnoses[0]}</span>
                                    </label>


                                    <label
                                        key={"B"}
                                        className={`flex items-center bg-[#143A3A] px-4 py-3 max-sm:py-2 max-sm:px-2 text-sm rounded-xl cursor-pointer transition-all ${selectOption === "B"
                                            ? "border border-emerald-400"
                                            : "border border-gray-700"
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            name="singleSelect" // <-- important! all radios must have same name
                                            value={diagnoses[1]}
                                            checked={selectOption === diagnoses[1]}
                                            onChange={() => setSelectOption(diagnoses[1])}
                                            className="form-radio h-5 w-5 text-emerald-600 dark:text-emerald-600 mr-4 bg-transparent text-sm max-sm:text-xs checked:accent-emerald-500 accent-slate-900"
                                        />
                                        <span>{diagnoses[1]}</span>
                                    </label>



                                    <label
                                        key={"C"}
                                        className={`flex items-center bg-[#143A3A] px-4 py-3 max-sm:py-2 max-sm:px-2 text-sm rounded-xl cursor-pointer transition-all ${selectOption === "C"
                                            ? "border border-emerald-400"
                                            : "border border-gray-700"
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            name="singleSelect" // <-- important! all radios must have same name
                                            value={diagnoses[2]}
                                            checked={selectOption === diagnoses[2]}
                                            onChange={() => setSelectOption(diagnoses[2])}
                                            className="form-radio h-5 w-5 text-emerald-600 mr-4 dark:text-emerald-600 bg-transparent text-sm max-sm:text-xs checked:accent-emerald-500 accent-slate-900"
                                        />
                                        <span>{diagnoses[2]}</span>
                                    </label>


                                    <label
                                        key={"D"}
                                        className={`flex items-center bg-[#143A3A] px-4 py-3 max-sm:py-2 max-sm:px-2 text-sm rounded-xl cursor-pointer transition-all ${selectOption === "D"
                                            ? "border border-emerald-400"
                                            : "border border-gray-700"
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            name="singleSelect" // <-- important! all radios must have same name
                                            value={diagnoses[3]}
                                            checked={selectOption === diagnoses[3]}
                                            onChange={() => setSelectOption(diagnoses[3])}
                                            className="form-radio h-5 w-5 text-emerald-600 dark:text-emerald-600 mr-4 bg-transparent text-sm max-sm:text-xs checked:accent-emerald-500 accent-slate-900"
                                        />
                                        <span>{diagnoses[3]}</span>
                                    </label>

                                </div>

                                {/* Submit Button */}


                                <Button disabled={selectOption === ""} className="bg-emerald-400 dark:bg-emerald-400 hover:bg-emerald-500 font-bold w-full text-black text-lg mb-5  py-6 px-6 rounded-lg shadow-md transition-all duration-300"
                                    onClick={async () => {
                                        //store the answer in local storage , user id , option , question id
                                        localStorage.setItem("Dod_Q",
                                            JSON.stringify({
                                                q_id: quesData.question.questionId,
                                                q_ans: selectOption,
                                                userId: userId
                                            })
                                        )
                                        // await submitAnswer()

                                        if (selectOption === quesData.question.correctOption) {
                                            next(true)
                                        } else {
                                            next(false)
                                        }
                                    }

                                    }
                                >
                                    Submit
                                </Button>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>






                </div>
            </ScrollArea>

        </div>
    );
};

export default CaseQuestion;
