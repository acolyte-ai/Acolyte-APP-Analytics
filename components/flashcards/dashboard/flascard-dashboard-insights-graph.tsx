import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { CardElementFlashcard } from '../UI/element-flashcard-card';

const LearningInsights = () => {
    const data = [
        { month: 'Jan', value1: 15, value2: 10 },
        { month: 'Feb', value1: 18, value2: 12 },
        { month: 'Mar', value1: 12, value2: 20 },
        { month: 'Apr', value1: 25, value2: 8 },
        { month: 'May', value1: 30, value2: 15 },
        { month: 'Jun', value1: 20, value2: 18 },
        { month: 'Jul', value1: 28, value2: 25 }
    ];

    return (
        <CardElementFlashcard loading={false} backgroundHidden={false} classes={""} title={"Learning Insights"} >
            <div className='rounded-[7px]  w-full px-5 py-[26px] xl:py-[17px] xl:px-[33px]'>
                <div className=' w-full h-[134px] xl:h-[148px]'>
                    <ResponsiveContainer width="100%" height="100%" className="w-full m-0 p-0 ">
                        <LineChart data={data} margin={{ right: 30, left: -20 }}>
                            <XAxis
                                dataKey="month"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'white', fontSize: 12 }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'white', fontSize: 12 }}
                                domain={[0, 35]}
                                ticks={[0, 10, 20, 30]}
                            />
                            <Line
                                type="monotone"
                                dataKey="value1"
                                stroke="#FFA500"
                                strokeWidth={2}
                                dot={false}
                                strokeDasharray="0"
                            />
                            <Line
                                type="monotone"
                                dataKey="value2"
                                stroke="#00FF7F"
                                strokeWidth={2}
                                dot={false}
                                strokeDasharray="5 5"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

        </CardElementFlashcard>
    );
};

export default LearningInsights;