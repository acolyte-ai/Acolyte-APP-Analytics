import pieChart from "@/public/piechart.svg"
import Image from "next/image";
import { useEffect, useState } from "react";

interface Props {
    percentage: string;
    score: string;
}

function parseTimeString(timeString) {
    if (!timeString) return null;

    // Regular expression to match number + unit patterns
    const timeRegex = /(\d+)(hr|min|sec)/gi;
    const matches = [...timeString.matchAll(timeRegex)];

    const components = matches.map(match => ({
        value: parseInt(match[1]),
        unit: match[2].toLowerCase()
    }));

    return components;
}

function getPrimaryTimeComponent(timeString) {
    const components = parseTimeString(timeString);
    if (!components || components.length === 0) return { value: 0, unit: 'sec' };

    // Find first non-zero component, or return the first component if all are zero
    const primaryComponent = components.find(comp => comp.value > 0) || components[0];

    return {
        value: primaryComponent.value,
        unit: primaryComponent.unit
    };
}

// Format unit for display (plural/singular handling)
function formatUnit(unit, value) {
    const unitMap = {
        'hr': value === 1 ? 'hr' : 'hrs',
        'min': value === 1 ? 'min' : 'mins',
        'sec': value === 1 ? 'sec' : 'secs'
    };

    return unitMap[unit] || unit;

}


function TimeDisplay({ score }) {
    const primary = getPrimaryTimeComponent(score);
    const formattedUnit = formatUnit(primary.unit, primary.value);

    return (
        <>
            <p className="text-[50px] 2xl:text-[46px] text-[#184C3D] dark:text-white font-causten-semibold">
                {primary.value}
            </p>
            <p className="text-[30px] 2xl:text-[26px] text-[#184C3D] dark:text-white mx-1 font-causten-semibold">
                {formattedUnit}
            </p></>


    );
}

export default function AvgTime({ score }: Props) {

    return (
        <div className=" w-full h-full py-[27px] px-[35px]  2xl:px-[23px] 2xl:py-[21px]  flex items-center justify-center">
            <div className="flex flex-1 flex-col  w-full ">
                <div className="flex w-full">
                    <p className="font-medium w-full font-causten-semibold text-xl 2xl:text-[22px] text-[#184C3D] dark:text-white text-nowrap truncate">Avg time</p>
                    <div className="col-span-1 w-full  flex justify-end items-start">
                        <Image src={pieChart} width={50} height={50} alt="pieChart" className="h-[40px] w-[40px] 2xl:w-[51px] 2xl:h-[51px] dark:brightness-100 brightness-75" />
                    </div>
                </div>

                <div className="  w-full   flex items-baseline justify-start">
                    {/* <p className="text-[50px] 2xl:text-[46px] font-medium font-pt-sans">{score.includes(["sec", "min", "hr"])}</p>
                    <p className="text-xl 2xl:text-[18px] mx-1 font-pt-sans">sec</p> */}
                    <TimeDisplay score={score} />
                </div>

            </div>





        </div>
    )
}