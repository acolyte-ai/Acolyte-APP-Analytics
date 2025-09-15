
interface Props {
    percentage: string;
    score: string;
}

export default function RankEst({ score }: Props) {
    return (
        <div className="space-y-5 px-[35px] py-[21px] 2xl:px-[23px] 2xl:py-[21px]  font-pt-sans flex flex-col items-start justify-center w-full h-full">
            <p className="mb-2 text-xl 2xl:text-[18px]  font-medium">Rank estimated</p>
            <p className="text-3xl 2xl:text-[27px] font-medium"> {score}</p>
            <div className="w-full dark:bg-[#2A2D32] bg-[#C1C1C1] h-2 rounded-full my-4 overflow-hidden ">
                <div
                    className="h-full bg-blue-600 transition-all duration-300 bg-[#18AA71]"
                    style={{ width: `${score.replace("Top", "")}` }}
                ></div>
            </div>
        </div>
    )
}