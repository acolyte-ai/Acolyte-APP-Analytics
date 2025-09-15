import React from 'react';
import { CardElementFlashcard } from '../UI/element-flashcard-card';

const AISuggestions = () => {
    return (
        <CardElementFlashcard loading={false} backgroundHidden={false} classes={"relative h-[200px] max-xl:h-[170px]"} title={" AI Suggestions"} >

            <div className='px-5 py-[30px] w-full  lg:py-[17px] xl:px-[33px] absolute bottom-[30px] lg:bottom-[17px]
                 flex flex-col items-center justify-center align-bottom  rounded-[7px] lg:space-y-7 space-y-5 '>

                <h3 className="text-[#CF8A25] text-lg xl:text-[22px] font-medium text-start w-full">
                    Did you know?
                </h3>
                <p className="text-[#36AF8D] text-lg xl:text-[22px] max-md:text-start w-full ">
                    The olfactory nerve is the only cranial nerve that regenerates.
                </p>
            </div>

        </CardElementFlashcard>
    );
};

export default AISuggestions;