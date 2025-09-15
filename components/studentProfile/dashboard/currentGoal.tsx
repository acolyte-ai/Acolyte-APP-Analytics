"use client"
import React, { useState } from 'react';
import { Check } from 'lucide-react';
import goals from "@/public/newIcons/goals.svg"
import Image from 'next/image';
import { CardStudent } from '../UI/studentCardUI';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CurrentGoal } from '@/components/Dashboards/student-profile/profileTypes';

type Task = {
    id: number;
    label: string;
    completed: boolean;
};

const initialTasks: Task[] = [
    { id: 1, label: 'Complete Pathology by Apr 23', completed: true },
    { id: 2, label: 'Revise Pharm flashcards (Set B)', completed: true },
    { id: 3, label: 'Attempt 3 NEET mock tests', completed: true },
    { id: 4, label: 'Sync with study buddy group', completed: true },
    { id: 5, label: 'Daily streak: 8/10', completed: true },
    { id: 3, label: 'Attempt 3 NEET mock tests', completed: true },
    { id: 4, label: 'Sync with study buddy group', completed: true },
    { id: 5, label: 'Daily streak: 8/10', completed: true },
    { id: 3, label: 'Attempt 3 NEET mock tests', completed: true },
    { id: 4, label: 'Sync with study buddy group', completed: true },
    { id: 5, label: 'Daily streak: 8/10', completed: true },
    { id: 3, label: 'Attempt 3 NEET mock tests', completed: true },
    { id: 4, label: 'Sync with study buddy group', completed: true },
    { id: 5, label: 'Daily streak: 8/10', completed: true },
];

export default function CurrentGoals({ data }: { data: CurrentGoal[] }) {
    const [tasks, setTasks] = useState(initialTasks);

    const toggleTask = (id: number) => {
        setTasks(prev =>
            prev.map(task =>
                task.id === id ? { ...task, completed: !task.completed } : task
            )
        );
    };

    return (
        <>
            {data.length > 0 ? <CardStudent className='dark:bg-[#181A1D] bg-[#F3F4F9] h-[229px] max-lg:h-[274px] xl:h-[226px] w-full px-[13px] py-[21px] max-xl:p-[26px] xl:px-[16px] xl:py-[26px]
           dark:shadow-[inset_0_0_8px_#B8B8B82B] dark:border-none border border-[#B8B8B8] shadow-md  ' title='Current Goals' description=''>
                <ScrollArea className='h-full w-full
            font-pt-sans
            flex flex-col items-center justify-center '>

                    {data.map(task => (
                        <label
                            key={task.id}
                            className="flex items-start  cursor-pointer group mb-[33px] max-xl:mb-[33px] xl:mb-[24px]"
                        >
                            <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => toggleTask(task.id)}
                                className="dark:accent-emerald-800 accent-white sr-only "
                            />
                            <div className="flex-shrink-0 relative mr-[13px]">
                                <span className={`
                    flex items-center justify-center
                    dark:text-emerald-400 text-white dark:bg-[#1D2527] bg-[#36AF8D]
                    rounded-sm border-none dark:border dark:border-emerald-900
                    transition-colors
                     ${task.completed ? 'dark:bg-[#1D2527] bg-[#36AF8D]' : 'dark:bg-[#1D2527] bg-[#36AF8D] dark:group-hover:bg-emerald-950/80 group-hover:bg-emerald-950/80'}
                  `}>
                                    {task.completed && (
                                        <Check
                                            className="w-[18px] h-[18px] max-lg:h-5 max-lg:w-5 xl:w-6 xl:h-6"
                                            strokeWidth={3}

                                        />
                                    )}
                                    {!task.completed && (
                                        <div
                                            className="w-[18px] h-[18px] max-lg:h-5 max-lg:w-5 xl:w-6 xl:h-6"


                                        />
                                    )}
                                </span>
                            </div>
                            <span className={`

                  dark:text-white text-black leading-5 text-[15px] lg:text-[17px] max-lg:text-[13px]
                  ${task.completed ? 'line-through opacity-80' : ''}
                `}>
                                {task.label}
                            </span>
                        </label>
                    ))}

                </ScrollArea>

            </CardStudent> :

                <CardStudent className='dark:bg-[#181A1D] bg-[#F3F4F9] h-[229px] max-lg:h-[274px] xl:h-[226px] w-full px-[13px] py-[21px] max-lg:p-[26px] lg:px-[16px] lg:py-[26px]
           dark:shadow-[inset_0_0_8px_#B8B8B82B] dark:border-none border border-[#B8B8B8] shadow-md  flex  items-center justify-center text-center' title='Current Goals' description=''>
                    <div className='flex items-center justify-between gap-5'>
                        <Image src={goals}

                            alt={"goals"}
                            height={50}
                            width={50}
                            className='h-[38px] w-[38px]'
                        >

                        </Image>
                        <div className='text-left tracking-wide '>
                            <p className='text-[#36AF8D] text-[16px]'>No Goals yet</p>
                            <p className='text-[16px]'>Plant the first seed of Progress today!</p>
                        </div>
                    </div>

                </CardStudent>

            }





        </>

    );
}