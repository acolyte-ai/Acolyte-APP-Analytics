"use client"

import { ScrollArea } from '@/components/ui/scroll-area';
import React, { useState, KeyboardEvent, ChangeEvent, useEffect } from 'react';
import { AllTopicCombobox } from '../UI/all-topic-comboBox';

interface TopicSearchProps {
    onAddTopic: (topic: string) => void;
    onRemoveTopic: (topic: string) => void;
    placeholder?: string;
    initialTopics?: string[];
    height?: number | 24
}

const TopicSearch: React.FC<TopicSearchProps> = ({
    onAddTopic,
    onRemoveTopic,
    topicDropDown,
    placeholder = 'Additional topics',
    initialTopics = [], height
}) => {
    const [searchText, setSearchText] = useState<string>('');
    const [topics, setTopics] = useState<string[]>([]);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && searchText.trim()) {
            e.preventDefault();
            addTopic(searchText.trim());
        }
    };

    const addTopic = (topic: string) => {
        console.log("topics:::", topics.includes(topic))
        if (!topics.includes(topic)) {
            const newTopics = [...topics, topic];
            setTopics(newTopics);
            onAddTopic(topic);
            setSearchText('');
        }
    };

    const removeTopic = (topicToRemove: string) => {
        const newTopics = topics.filter(topic => topic !== topicToRemove);
        setTopics(newTopics);
        onRemoveTopic(topicToRemove);
    };
    useEffect(() => { setTopics(initialTopics) }, [initialTopics])



    return (
        <div
            className="flex items-center p-[14px] px-[15px] rounded-[11px] border border-[#C7C7C7] dark:border-none
             dark:bg-[#282A2E] bg-[#F3F4F9] max-md:bg-transparent 2xl:justify-between
            md:w-full md:max-w-[1000px] 2xl:gap-[21px] gap-[14px] flex-wrap 2xl:p-[10px]"
        >
            <div className='flex items-center max-ms:items-start  max-md:bg-[#282A2E] w-full pr-3
             max-md:py-[10px] max-md:px-[15px] max-md:rounded-[11px] gap-4'>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >

                    <svg
                        viewBox="0 0 24 24"
                        width="24"
                        height="24"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ color: '#9ca3af' }}
                    >
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </div>
                <div className='w-full justify-between flex items-center max-md:items-start max-md:flex-col gap-2'>
                    <div className="flex relative">
                        {/* <p className="bg-transparent border-none outline-none text-white text-[15px] 2xl:text-[17px]
                max-lg:py-0 flex-1 min-w-[100px]  font-pt-sans font-medium bg-[#282A2E] ">{placeholder}</p> */}
                        <div className="col-span-full">
                            {topicDropDown.length > 0 && (
                                <AllTopicCombobox
                                    allTopics={topicDropDown}
                                    addTopic={onAddTopic}
                                />
                            )}
                        </div>

                        {/* <input
                            type="text"
                            value={searchText}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            placeholder={placeholder}
                            className="bg-transparent border-none outline-none text-white text-[15px] 2xl:text-[17px]
                max-lg:py-0 flex-1 min-w-[100px]  font-pt-sans font-medium bg-[#282A2E] "
                        /> */}
                        <p className="text-red text-lg ml-2">*</p>
                    </div>


                    <div className='text-[#565656] dark:text-white'>Added topic : {topics.length}</div>
                </div>

            </div>

            <ScrollArea className={` h-40 w-full rounded-md  p-4`}>
                <div className='grid grid-cols-2 max-lg:grid-cols-1 items-start gap-4'>
                    {topics.map((topic, index) => (
                        <div
                            key={index}
                            className="flex items-center  border border-[#B8B8B8] dark:bg-[#3D3E42] bg-[#E8EAF3] dark:border-none rounded-full py-2
                 px-3 2xl:p-[10px] 2xl:px-[12px] gap-1.5 w-full text-wrap"
                        >
                            <button
                                onClick={() => removeTopic(topic)}
                                className="flex items-center  rounded-full py-1 px-3 gap-1.5"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    width="16"
                                    height="16"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    style={{ color: '#9ca3af' }}
                                >
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                            <span className='text-[15px] 2xl:text-[17px] dark:text-white text-[#505050] font-pt-sans'>
                                {topic}
                            </span>
                        </div>
                    ))}
                </div>
            </ScrollArea>

        </div>
    );
};


export default TopicSearch;