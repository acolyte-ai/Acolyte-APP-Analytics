import React from 'react';



interface HeartMurmurComparisonProps {
    listA: { id: string, text: string }[],
    listB: { id: string, text: string }[]
}

const HeartMurmurComparison: React.FC<HeartMurmurComparisonProps> = ({ listA, listB }) => {
    return (
        <div className="w-full">
            <div className="font-pt-sans">
                {/* Headers */}
                <div className="grid grid-cols-2 gap-[72px] max-md:gap-[29px] mb-7">
                    <div className="bg-[#36AF8D] dark:bg-[#184C3D] text-white  text-center px-5 py-2 rounded-[7px] text-sm font-medium">
                        List A
                    </div>
                    <div className="bg-[#36AF8D] dark:bg-[#184C3D] text-white  text-center px-5 py-2 rounded-[7px] text-sm font-medium">
                        List B
                    </div>
                </div>

                {/* Content rows - each pair in same grid row */}
                <div className="space-y-7">
                    {Array.from({ length: Math.max(listA.length, listB.length) }).map((_, index) => (
                        <div key={index} className="grid grid-cols-2 gap-[72px] max-md:gap-[29px] items-stretch">
                            {/* List A item */}
                            <div className="dark:bg-[#181A1D] bg-[#F3F4F9] dark:shadow-[inset_0_0_8px_#B8B8B82B] border-[#B8B8B8] shadow max-md:text-center w-full max-md:items-center max-md:flex max-md:justify-center dark:text-white text-black max-sm:min-h-[77px] min-h-[38px] 2xl:min-h-[47px] px-5 py-2 2xl:p-4 rounded-[7px] xl:text-sm text-[13px] flex items-center">
                                {listA[index]?.text || ''}
                            </div>

                            {/* List B item */}
                            <div className="dark:bg-[#181A1D] bg-[#F3F4F9] max-md:text-center border-[#B8B8B8] shadow max-md:items-center w-full max-md:flex max-md:justify-center dark:shadow-[inset_0_0_8px_#B8B8B82B] dark:text-white text-black min-h-[38px] max-sm:min-h-[77px] 2xl:min-h-[47px] px-5 py-2 2xl:p-4 rounded-[7px] text-sm xl:text-sm text-[13px] flex items-center">
                                {listB[index]?.text || ''}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HeartMurmurComparison;