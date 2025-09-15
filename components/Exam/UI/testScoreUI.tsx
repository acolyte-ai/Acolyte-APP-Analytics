"use client"
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import folderIcon from "@/public/folderIcon.svg";

interface Props {
    name: string;
    subject: string;
    date: string;
    score: string;
    id: string,
    q_id: string,
    subjectName: string;
}

const subjectIconMap = {
    Anatomy: "/newIcons/human.svg",
    Physiology: "/newIcons/lungs.svg",
    Oncology: "/newIcons/oncology.svg",
    Pathology: "/newIcons/germs.svg",
    Cardiology: "/newIcons/cardio.svg",
    Pediatrics: "/newIcons/pediatrician.svg",
    "Obstetrics & GyG": "/newIcons/obstetrics.svg",
    Orthopedics: "/newIcons/bones.svg",
    Dermatology: "/newIcons/hair.svg",
    "Emergency Medicine": "/newIcons/emergency.svg",
    Psychiatry: "/newIcons/psychiatry.svg",
    Pharmacology: "/newIcons/pills.svg",
    "Micro Biology": "/newIcons/biology.svg",
    Biochemistry: "/newIcons/biochemistry.svg",
    Radiology: "/newIcons/x-ray.svg",
    "Unknown Subject": "@/public/folderIcon.svg"

}
export default function TestScoreUI({ name, subject, date, score, id, q_id, subjectName }: Props) {
    const router = useRouter()
    return (
        <div className="  my-2 w-full md:gap-4 px-[35px] py-[5px]
         max-md:p-[35px] 2xl:py-[7px] 2xl:px-[45px] flex items-center max-md:items-start max-md:gap-5">
            <div className=" items-start flex justify-start uppercase text-[35px] 2xl:text-[33px] dark:text-[#36AF8D] text-wrap
                 w-auto text-[#36AF8D] font-bold dark:bg-[#1D2527] bg-[#AADACD] py-[9px] px-[14px] 2xl:py-[11px] 2xl:px-[18px] rounded-xl">
                {/* <p className=""> */}

                <Image
                    src={subjectIconMap[subjectName ?? "Anatomy"]}
                    height={50}
                    width={50}
                    className="h-[45px] w-[54px] "
                    alt={"folder"}
                />
                {/* </p> */}
            </div>
            <div className="  flex items-center 2xl:gap-[63px] gap-[10px] w-full  justify-between max-md:flex-col max-md:items-start">
                <div className="flex flex-col w-full max-md:w-full">
                    <p className="font-causten-semibold mb-1 dark:text-white text-[#184C3D] tracking-normal text-[19px] 2xl:text-[18px] font-pt-sans"> {subject}</p>
                    <div className="flex justify-between text-black dark:text-[#C6C6C6] 2xl:text-[14px] items-center  text-[16px] w-full max-md:w-full">
                        <p>{date}</p>
                        <p>{score}%</p>
                    </div>
                    <div className=" bg-[#C1C1C1] dark:bg-[#1D2527] h-2 rounded-full my-2 overflow-hidden w-full max-md:w-full">
                        <div
                            className="h-full bg-blue-600 transition-all duration-300 dark:bg-[#36AF8D] bg-[#36AF8D]"
                            style={{ width: `${score}%` }}
                        ></div>
                    </div>
                </div>

                <div className="md:hidden flex items-center justify-start gap-4 max-sm:gap-2 my-4 md:flex-col font-causten-sem-bold">

                    {id && <Button variant={"default"} className="py-3 px-7 dark:bg-[#36AF8D] hover:dark:bg-[#36AF8D]/70 hover:bg-[#36AF8D]/70 bg-[#36AF8D] text-white  dark:text-black hover:text-black hover:dark:text-white text-base" onClick={() => router.push("/assesment/dash/" + q_id + "/" + id)} > Review</Button>}
                    <Button variant={"default"} className="py-3 px-7 dark:bg-[#36AF8D] hover:dark:bg-[#36AF8D]/70 hover:bg-[#36AF8D]/70 bg-[#36AF8D] text-white  dark:text-black hover:text-black hover:dark:text-white  text-base" onClick={() => router.push("/assesment/dailyTest/" + q_id)} >  {id ? "Retake" : "Take Test"} </Button>
                </div>

                <div className="max-md:hidden md:flex-col flex items-end w-full  justify-end gap-4  ">
                    {id && <Button variant={"default"} className="py-3 px-7 dark:bg-[#36AF8D] hover:dark:bg-[#36AF8D]/70 hover:bg-[#36AF8D]/70 bg-[#36AF8D] text-white  dark:text-gra-300 hover:text-black hover:dark:text-white w-full  max-w-[200px] 2xl:max-w-[230px] tracking-normal font-causten-bold text-[16px]" onClick={() => router.push("/assesment/dash/" + q_id + "/" + id)} > Review</Button>}
                    <Button variant={"default"} className="py-3 px-7 dark:bg-[#36AF8D] font-causten-bold hover:dark:bg-[#36AF8D]/70 hover:bg-[#36AF8D]/70 bg-[#36AF8D] text-white  dark:text-gray-200 hover:text-black hover:dark:text-white w-full  max-w-[200px] 2xl:max-w-[230px] tracking-normal  text-[16px]" onClick={() => router.push("/assesment/dailyTest/" + q_id)} >  {id ? "Retake" : "Take Test"} </Button>
                </div>
            </div >
        </div >


    )
}