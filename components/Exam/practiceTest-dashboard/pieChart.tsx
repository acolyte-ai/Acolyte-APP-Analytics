import { useState } from 'react';

export default function PieChart({ percentage = 75, color = 'teal-400' }) {
    const [isSelected, setIsSelected] = useState(false);
    
    const colorMap = {
        'teal-400': '#2dd4bf',
        'emerald-400': '#34d399',
        'green-400': '#4ade80',
    };

    const actualColor = colorMap[color] || colorMap['teal-400'];
    
    const handleClick = () => {
        setIsSelected(!isSelected);
    };

    return (
        <div 
            className="bg-gray-900 w-fit cursor-pointer" 
            onClick={handleClick}
            style={{
                filter: isSelected ? "brightness(1.2)" : "brightness(1)",
            }}
        >
            <svg 
                className="w-16 h-16" 
                viewBox="0 0 36 36"
                style={{
                    stroke: isSelected ? "#ffffff" : "none",
                    strokeWidth: isSelected ? "1" : "0",
                }}
            >
                <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    stroke={actualColor}
                    strokeWidth="4"
                />
                <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    stroke={actualColor}
                    strokeWidth="4"
                    strokeDasharray={`${percentage}, 200`}
                    strokeDashoffset="25"
                />
                {isSelected && (
                    <circle
                        cx="18"
                        cy="18"
                        r="17"
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="1"
                    />
                )}
            </svg>
        </div>
    );
};