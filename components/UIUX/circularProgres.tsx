
import React, { useState } from "react";
import { Pie, Cell } from "recharts";

import dynamic from "next/dynamic";
const PieChart = dynamic(() => import("recharts").then((mod) => mod.PieChart), {
    ssr: false,
});


export default function CircularProgress() {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    
    const data = [
        { name: "Completed", value: 75 }, // Progress value
        { name: "Remaining", value: 25 }, // Remaining value
    ];

    const colors = ["#10b981", "#f3f4f6"]; // Green and gray

    const handlePieClick = (data: any, index: number) => {
        setSelectedIndex(selectedIndex === index ? null : index);
    };

    return (
        <div style={{ transform: "rotate(-90deg)" }} className="relative">
            <PieChart width={100} height={100} >
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={38}
                    startAngle={90}
                    endAngle={450}
                    paddingAngle={0}
                    cornerRadius={10}
                    dataKey="value"
                    className="focus:outline-none"
                    onClick={handlePieClick}
                >
                    {data.map((entry, index) => (
                        <Cell 
                            key={`cell-${index}`} 
                            fill={colors[index]}
                            stroke={selectedIndex === index ? "#ffffff" : "none"}
                            strokeWidth={selectedIndex === index ? 2 : 0}
                            style={{
                                filter: selectedIndex === index ? "brightness(1.2)" : "brightness(1)",
                                cursor: "pointer"
                            }}
                        />
                    ))}
                </Pie>
            </PieChart>
            {/* Percentage Text */}
            <div
                style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%) rotate(90deg)",
                    fontSize: "14px",
                    fontWeight: "bold",
                    color: "#111827", // Dark gray
                }}
            >
                <span className="dark:text-white">{`75%`} </span>
            </div>
        </div>
    );
};