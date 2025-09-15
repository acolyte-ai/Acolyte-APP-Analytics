"use client"
import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Check } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const PersonalityQuestion = ({
    data,
    currentQuestion,
    onAutoAdvance
}: {
    data: { id: number, text: string },
    currentQuestion: number,
    onAutoAdvance: (questionId: number) => void
}) => {
    console.log("cureee==>", currentQuestion, data)
    const { control } = useFormContext();

    const options = [
        { value: "1", label: "", color: " h-[44px] w-[44px] data-[state=checked]:bg-[#9A5A3C] data-[state=checked]:border-[#9A5A3C]", bgColor: "#9A5A3C" },
        { value: "2", label: "", color: " h-[34px] w-[34px] data-[state=checked]:bg-[#9A5A3C] data-[state=checked]:border-[#9A5A3C]", bgColor: "#9A5A3C" },
        { value: "3", label: "", color: " h-[27px] w-[27px] data-[state=checked]:bg-[#9A5A3C] data-[state=checked]:border-[#9A5A3C]", bgColor: "#9A5A3C" },
        { value: "4", label: "", color: " h-[21px] w-[21px] data-[state=checked]:bg-[#367966] data-[state=checked]:border-[#367966]", bgColor: "#367966" },
        { value: "5", label: "", color: " h-[27px] w-[27px] data-[state=checked]:bg-[#367966] data-[state=checked]:border-[#367966]", bgColor: "#367966" },
        { value: "6", label: "", color: " h-[34px] w-[34px] data-[state=checked]:bg-[#367966] data-[state=checked]:border-[#367966]", bgColor: "#367966" },
        { value: "7", label: "", color: " h-[44px] w-[44px] data-[state=checked]:bg-[#367966] data-[state=checked]:border-[#367966]", bgColor: "#367966" }
    ];

    const handleValueChange = (value: string, onChange: (value: string) => void) => {
        // Update the form field
        onChange(value);

        // Auto-advance to next question with a small delay for better UX
        setTimeout(() => {
            onAutoAdvance(data.id);
        }, 500); // 500ms delay to show the selection
    };

    return (
        <div className={`w-full px-6  flex items-center flex-col font-[hartwellAlt] justify-center ${currentQuestion + 1 !== data.id ? "opacity-55 pointer-events-none" : "cursor-pointer"} `}>
            <div className="mx-auto text-center">
                {/* Question Text */}
                <h2 className="text-[20px] font-medium text-[#D8D8D8] mb-[31px] leading-relaxed">
                    {data.text}
                </h2>

                {/* Radio Group with React Hook Form */}
                <Controller
                    name={`question_${data.id}`}
                    control={control}
                    rules={{ required: "Please select an answer" }}
                    render={({ field, fieldState: { error } }) => (
                        <div>
                            <RadioGroup
                                value={field.value}
                                id={"#" + data.id}
                                onValueChange={(value) => handleValueChange(value, field.onChange)}
                                className="flex items-center justify-center gap-6 p-0"
                            >
                                <p className='text-[20px] text-[#9A5A3C] font-medium'>disagree</p>
                                {options.map((option, index) => (
                                    <div key={option.value} className="flex flex-col items-center gap-3">
                                        <div className="relative">
                                            <RadioGroupItem
                                                value={option.value}
                                                id={`question_${data.id}_option_${option.value}`}
                                                className={`${option.color}  ${option.value <= "3" ? "border-[#9A5A3C] dark:border-[#9A5A3C]" : option.value <= "4" ? "border-[#9A5A3C] dark:border-[#9A5A3C]" : "border-[#367966] dark:border-[#367966]"} bg-transparent rounded-full flex items-center justify-center`}
                                                style={{
                                                    backgroundColor: field.value === option.value ? option.bgColor : 'transparent'
                                                }}
                                            />
                                            {/* Check mark overlay */}
                                            {field.value === option.value && (
                                                <div className={`absolute inset-0 ${option.value <= "3" ? "bg-[#9A5A3C]" : option.value <= "4" ? "bg-[#9A5A3C]" : "bg-[#367966]"} w-full h-full  rounded-full  flex items-center justify-center pointer-events-none`}>
                                                    <Check
                                                        className="text-white"
                                                        size={option.value <= "3" ? 20 : option.value <= "5" ? 16 : 20}
                                                    />
                                                </div>
                                            )}
                                            <Label
                                                htmlFor={`question_${data.id}_option_${option.value}`}
                                                className="absolute inset-0 cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                ))}
                                <p className='text-[20px] text-[#367966] font-medium'>agree</p>
                            </RadioGroup>
                            {error && (
                                <p className="text-red-500 text-sm mt-2">{error.message}</p>
                            )}
                        </div>
                    )}
                />
            </div>
            <Separator className='my-[74px] max-w-4xl border-[#36AF8D]/40 dark:border-[#36AF8D]/40 border' />
        </div>
    );
};

export default PersonalityQuestion;