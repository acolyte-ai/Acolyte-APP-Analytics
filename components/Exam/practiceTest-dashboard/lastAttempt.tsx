interface Props {
    percentage: string;
    score: string;
}

export default function LastAttempt({ score, percentage }: Props) {
    return (
        <div className="space-y-4 px-[35px] py-[21px] 2xl:px-[23px] 2xl:py-[21px] font-causten-semibold flex flex-col items-start justify-center w-full h-full">
            <p className="text-xl 2xl:text-[24px] text-[#184C3D] dark:text-white font-medium">Last Attempt</p>

            <div className="space-y-3 w-full">
                <div className="flex justify-between items-center">
                    <p className="sm:text-base lg:text-[20px] text-[#184C3D] dark:text-white">Score</p>
                    <p className="sm:text-base lg:text-[20px] text-[#184C3D] dark:text-white font-semibold">{score}</p>
                </div>

                <div className="flex justify-between items-center">
                    <p className="sm:text-base lg:text-[20px] text-[#184C3D] dark:text-white">Time Spent</p>
                    <p className="sm:text-base lg:text-[20px] text-[#184C3D] dark:text-white font-semibold">{percentage}</p>
                </div>

                <div className="w-full dark:bg-[#2A2D32] bg-[#C1C1C1] h-3 rounded-full overflow-hidden">
                    <div
                        className="h-full transition-all duration-300 bg-[#18AA71]"
                        style={{ width: `${parseInt(score.replace('%', ''))}%` }}
                    ></div>
                </div>
            </div>
        </div>
    )
}