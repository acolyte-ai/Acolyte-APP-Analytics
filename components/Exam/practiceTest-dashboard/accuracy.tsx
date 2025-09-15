import Image from "next/image";
import uparrow from "@/public/Arrowup.svg";
import zigzag from "@/public/zigzagup.svg"

interface Props {
    percentage: string;
    score: string;
    arrow: string;
}

export default function Accuracy({ percentage, score, arrow }: Props) {
    return (
        <div className="grid grid-cols-2 w-full font-causten-semibold px-[30px] py-[15px] 2xl:px-[23px] 2xl:py-[21px] ">
            <p className="text-[50px] 2xl:text-[46px] col-span-1 font-causten-bold text-[#184C3D] dark:text-white">{percentage}</p>
            <div className="col-span-1  w-full items-center justify-end flex">
                <Image src={zigzag} height={30} width={30} alt={"arrow"} className="dark:brightness-100 brightness-75 object-contain w-[33px] h-[20px] 2xl:w-[36px] 2xl:h-[26px]" />
            </div>

            <p className="col-span-1 text-xl 2xl:text-[22px] text-[#184C3D] dark:text-white font-causten-semibold font-medium">Accuracy</p>
            <div className="flex items-center justify-end col-span-1 gap-3">
                <p className="dark:text-[#18AA71] text-[#36AF8D] tracking-wide text-xl 2xl:text-[18px] font-medium">{score}</p>
                <div className="">

                    <Image src={uparrow} height={30} width={30} alt={"arrow"} className={`h-6 dark:brightness-100 brightness-75 w-[61px] 2xl:w-[16px] ${arrow === "up" ? "" : "rotate-180"} `} />


                </div>
            </div>
            <div className="w-full col-span-2 bg-[#C1C1C1] dark:bg-[#2A2D32] h-2 rounded-full my-4 overflow-hidden ">
                <div
                    className="h-full bg-blue-600 transition-all duration-300 bg-[#18AA71]"
                    style={{ width: `${score}` }}
                ></div>
            </div>
        </div>
    )
}