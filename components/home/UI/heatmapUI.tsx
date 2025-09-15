import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";

interface Props {
    heatmapData: {
        subject: string;
        topics: {
            topicName: string;
            subject: string;
            masteryScore: number;
            breakdown: {
                flashcardPerformance: number;
                completionRate: number;
                timeEfficiency: number;
            };
            masteryLevel: string;
        }[];
        averageMastery: number;
    }[];
    getSpecialtyHeaderColor: (val: string) => void;
    getColorForScore: (val: number, valOther: boolean) => void;
    setHoveredCell: (val: string) => void;
    getTextColorForScore: (val: number, valOther: boolean) => void;
}

export default function HeatmapUI({ heatmapData, getSpecialtyHeaderColor, getColorForScore, setHoveredCell, getTextColorForScore }: Props) {
    const [isVisible, setIsVisible] = useState(false);
    const [animatedCells, setAnimatedCells] = useState(new Set());

    useEffect(() => {
        // Start entrance animation
        setIsVisible(true);

        // Animate cells in waves
        if (heatmapData && heatmapData.length > 0) {
            let delay = 0;
            heatmapData.forEach((specialty, colIndex) => {
                specialty.subjects.forEach((subject, rowIndex) => {
                    setTimeout(() => {
                        setAnimatedCells(prev => new Set([...prev, `${colIndex}-${rowIndex}`]));
                    }, delay);
                    delay += 100; // Stagger by 100ms
                });
            });
        }
    }, [heatmapData]);

    return (
        <div className="h-[330px] w-full relative">
            {/* Fixed Headers */}
            <div className={`sticky top-0 z-10 bg-white dark:bg-zinc-900 grid grid-cols-4 max-xl:grid-cols-3 gap-3 w-full font-causten-semibold 2xl:gap-4  transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                {heatmapData.map((specialty, colIndex) => (
                    <div
                        key={`header-${colIndex}`}
                        className={`transition-all duration-700 ease-out ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                        style={{ transitionDelay: `${colIndex * 150}ms` }}
                    >
                        <div
                            className={`text-[16px] text-center px-3 py-2 text-black dark:text-white truncate capitalize transition-all duration-500 ease-out transform hover:shadow-lg
                                ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}
                            `}
                            style={{ transitionDelay: `${colIndex * 100}ms` }}
                        >
                            {specialty.specialty}
                        </div>
                    </div>
                ))}
            </div>

            {/* Scrollable Content */}
            <div className="h-[340px] w-full no-scrollbar remove-scrollbar overflow-y-auto">
                <div className={`grid grid-cols-4 max-xl:grid-cols-3 gap-3 w-full font-causten-semibold 2xl:gap-4 transition-all duration-1000 ease-out min-h-full ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    {heatmapData.map((specialty, colIndex) => (
                        <div
                            key={colIndex}
                            className={`flex flex-col gap-2 transition-all duration-700 ease-out ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                            style={{ transitionDelay: `${colIndex * 150}ms` }}
                        >
                            {/* Subjects Grid */}
                            <div className="flex flex-col gap-3">
                                {specialty.subjects.map((subject, rowIndex) => {
                                    const cellKey = `${colIndex}-${rowIndex}`;
                                    const isAnimated = animatedCells.has(cellKey);

                                    return (
                                        <div
                                            key={cellKey}
                                            className={`flex items-center justify-center w-full flex-col gap-2 overflow-hidden transition-all duration-600 ease-out transform ${isAnimated ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-8 scale-90'}`}
                                        >
                                            {/* Subject/Topic Name */}
                                            <div className={`text-[14px] font-causten-semibold text-center w-full dark:text-[#BDBDBD] text-zinc-900 truncate tracking-normal line-clamp-2 capitalize transition-all duration-300 ${isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                                                {subject.name || ""}
                                            </div>

                                            {/* Mastery Score Cell - simplified to match reference */}
                                            <div
                                                className={`overflow-hidden relative py-1.5 w-full text-center
                                                        transition-all duration-500 cursor-pointer rounded-full transform hover:scale-95
                                                        ${getColorForScore(
                                                    subject.value,
                                                    subject.value > 0
                                                )}
                                                         hover:z-10 hover:shadow-2xl hover:shadow-blue/20
                                                         ${isAnimated ? 'animate-pulse' : ''}
                                                    `}
                                                onMouseEnter={() => {
                                                    setHoveredCell(subject);
                                                }}
                                                onMouseLeave={() => setHoveredCell(null)}
                                                style={{
                                                    animationDelay: `${(colIndex + rowIndex) * 100}ms`,
                                                    animationDuration: '2s',
                                                    animationIterationCount: '1'
                                                }}
                                            >
                                                <div
                                                    className={`w-full overflow-hidden h-full flex flex-col items-center justify-center px-2 text-center transition-all duration-300 hover:scale-105
                                                        ${getTextColorForScore(
                                                        subject.value,
                                                        subject.value > 0
                                                    )}
                                                    `}
                                                >
                                                    <div className={`text-xs font-bold transition-all duration-700 ease-out ${isAnimated ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-150 rotate-180'}`}>
                                                        {subject.value === 0 ||
                                                            subject.value === null ||
                                                            subject.value === undefined
                                                            ? subject.name.length > 0 ? "0%" : ""
                                                            : `${subject.value}%`}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}