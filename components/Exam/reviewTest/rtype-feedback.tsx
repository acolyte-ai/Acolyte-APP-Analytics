import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { questionSchema } from "./questions";

type QuestionFormValues = z.infer<typeof questionSchema>;

interface Props {
    form: UseFormReturn<QuestionFormValues>,
    options: {
        value: string;
        text: string;
    }[],
    selectedOptions: string | undefined;
    correctAnswer?: string; // Added missing correct answer prop
    seeWhy: boolean;
    handleCheckboxChange?: (val: string, checked: boolean) => void;
}

export default function FeedBack({ form, options, selectedOptions, correctAnswer, seeWhy, handleCheckboxChange }: Props) {

    const getOptionStatus = (optionValue: string) => {
        console.log("==2==>", optionValue, selectedOptions, correctAnswer)
        const isSelected = String(selectedOptions) === String(optionValue);
        const isCorrect = String(correctAnswer) === String(optionValue);



        if (seeWhy && correctAnswer) {
            if (selectedOptions !== undefined && String(selectedOptions) == String(correctAnswer)) {
                // User got it right - show only selected option in green
                return {
                    shouldShow: isSelected,
                    isCorrect: isSelected && isCorrect,
                    isIncorrect: false
                };
            } else {
                // User got it wrong - show selected in red and correct in green
                return {
                    shouldShow: isSelected || isCorrect,
                    isCorrect: isCorrect && !isSelected,
                    isIncorrect: isSelected && !isCorrect
                };
            }
        }

        // Normal mode - show only selected
        return {
            shouldShow: isSelected,
            isCorrect: false,
            isIncorrect: false
        };
    };

    const getOptionStyling = (optionValue: string) => {
        const status = getOptionStatus(optionValue);
        console.log("===>", status)

        if (seeWhy && correctAnswer) {
            if (status.isCorrect) {
                // Correct answer styling (green)
                return {
                    containerClass: "bg-[#22c55e]/20 border-2 border-[#22c55e] transform scale-110 dark:bg-[#22c55e]/20 dark:border-[#22c55e]",
                    emojiClass: "bg-[#22c55e] bg-opacity-20",
                    labelClass: "text-[#22c55e] font-medium dark:text-[#22c55e]"
                };
            } else if (status.isIncorrect) {
                // Incorrect answer styling (red)
                return {
                    containerClass: "bg-[#ef4444]/20 border-2 border-[#ef4444] transform scale-110 dark:bg-[#ef4444]/20 dark:border-[#ef4444]",
                    emojiClass: "bg-[#ef4444] bg-opacity-20",
                    labelClass: "text-[#ef4444] font-medium dark:text-[#ef4444]"
                };
            }
        } else if (status.shouldShow) {
            // Normal selected styling (original teal)
            return {
                containerClass: "bg-[#36AF8D]/30 border-2 border-[#36AF8D] transform scale-110 dark:bg-[#152D26] dark:border-[#36AF8D]",
                emojiClass: "bg-[#36AF8D] bg-opacity-20",
                labelClass: "text-[#36AF8D] font-medium dark:text-[#36AF8D]"
            };
        }

        // Default unselected styling
        return {
            containerClass: "hover:bg-zinc-100 dark:hover:bg-[#2A2A2A] border-2 border-transparent bg-white dark:bg-zinc-800",
            emojiClass: "hover:bg-zinc-100 dark:hover:bg-[#2A2A2A]",
            labelClass: "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
        };
    };

    return (
        <div className="2xl:mb-[52px] mt-6">
            <FormField
                control={form.control}
                name="selectedOptions"
                render={() => (
                    <FormItem>
                        <div className="flex justify-around max-auto">
                            {options.map((opt, index) => {
                                const emojis = ['😞', '😕', '😐', '🙂', '😊'];
                                const status = getOptionStatus(opt.value);
                                const styling = getOptionStyling(opt.value);

                                return (
                                    <FormField
                                        key={opt.value}
                                        control={form.control}
                                        name="selectedOptions"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col items-center space-y-0">
                                                <FormControl>
                                                    <div
                                                        className={`flex flex-col items-center cursor-pointer transition-all duration-200 p-2 rounded-lg
                                                        ${styling.containerClass}
                                                        ${seeWhy ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                                                        onClick={() => {
                                                            if (!seeWhy) {
                                                                handleCheckboxChange?.(opt.value, !status.shouldShow);
                                                            }
                                                        }}
                                                    >
                                                        {/* Emoji Button */}
                                                        <div className={`text-3xl 2xl:text-4xl p-2 rounded-full transition-all duration-200 ${styling.emojiClass}`}>
                                                            {emojis[index] || '😐'}
                                                        </div>

                                                        {/* Hidden Checkbox for form compatibility */}
                                                        <Checkbox
                                                            checked={status.shouldShow}
                                                            onCheckedChange={(checked: boolean) => {
                                                                if (!seeWhy) {
                                                                    handleCheckboxChange?.(opt.value, checked as boolean);
                                                                }
                                                            }}
                                                            disabled={seeWhy}
                                                            className="sr-only"
                                                        />
                                                    </div>
                                                </FormControl>

                                                {/* Label */}
                                                <FormLabel className={`2xl:text-[14px] text-[11px] cursor-pointer font-normal text-center max-w-20 leading-tight py-5 transition-colors duration-200
                                                ${styling.labelClass}
                                                ${seeWhy ? "cursor-not-allowed" : "cursor-pointer"}`}
                                                    onClick={() => {
                                                        if (!seeWhy) {
                                                            handleCheckboxChange?.(opt.value, !status.shouldShow);
                                                        }
                                                    }}
                                                >
                                                    {opt.text}
                                                </FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                );
                            })}
                        </div>
                    </FormItem>
                )}
            />
        </div>
    );
}