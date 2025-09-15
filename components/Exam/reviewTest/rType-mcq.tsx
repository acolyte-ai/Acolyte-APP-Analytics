import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { questionSchema } from "./questions";

type QuestionFormValues = z.infer<typeof questionSchema>;

interface Props {
    form: UseFormReturn<QuestionFormValues>,
    options: {
        id: string;
        text: string;
        matching?: string;
    }[],
    isStage1Locked?: boolean,
    selectedOptions: string | undefined;
    correctAnswer?: string; // Added correct answer prop
    seeWhy: boolean;
    handleCheckboxChange: (val: string, checked: boolean) => void;
}

export default function Mcq({
    form,
    options,
    selectedOptions,
    correctAnswer,
    seeWhy,
    handleCheckboxChange,
    isStage1Locked
}: Props) {

    const getOptionStatus = (optionId: string) => {
        const isSelected = selectedOptions === optionId;
        const isCorrect = correctAnswer === optionId;

        if (seeWhy && correctAnswer) {
            if (selectedOptions === correctAnswer) {
                // User got it right - show only the selected option in green
                return {
                    shouldShow: isSelected,
                    isCorrect: isSelected && isCorrect, // Only mark as correct if it's both selected AND correct
                    isIncorrect: false
                };
            } else {
                // User got it wrong - show both selected (red) and correct (green)
                return {
                    shouldShow: isSelected || isCorrect,
                    isCorrect: isCorrect && !isSelected, // Correct but not selected
                    isIncorrect: isSelected && !isCorrect // Selected but incorrect
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

    const getOptionStyling = (optionId: string) => {
        const status = getOptionStatus(optionId);

        if (seeWhy && correctAnswer) {
            if (status.isCorrect) {
                // Correct answer styling (green)
                return {
                    containerClass: "bg-[#22c55e]/10 border-[#22c55e] dark:bg-[#22c55e]/20 dark:border-[#22c55e]",
                    checkboxClass: "bg-white border-[#22c55e] dark:border-none data-[state=checked]:bg-white data-[state=checked]:text-[#22c55e] dark:data-[state=checked]:bg-[#22c55e] dark:data-[state=checked]:text-black",
                    labelClass: "text-[#22c55e] dark:text-[#22c55e]"
                };
            } else if (status.isIncorrect) {
                // Incorrect answer styling (red)
                return {
                    containerClass: "bg-[#ef4444]/10 border-[#ef4444] dark:bg-[#ef4444]/20 dark:border-[#ef4444]",
                    checkboxClass: "bg-white border-[#ef4444] dark:border-none data-[state=checked]:bg-white data-[state=checked]:text-[#ef4444] dark:data-[state=checked]:bg-[#ef4444] dark:data-[state=checked]:text-white",
                    labelClass: "text-[#ef4444] dark:text-[#ef4444]"
                };
            }
        } else if (status.shouldShow) {
            // Normal selected styling (original blue/green)
            return {
                containerClass: "bg-[#152D26]/10 border-[#36AF8D] bg-[#36AF8D] dark:bg-[#152D26] dark:border-[#36AF8D]",
                checkboxClass: "bg-white border-[#157459] dark:border-none data-[state=checked]:bg-white data-[state=checked]:text-[#157459] dark:data-[state=checked]:bg-[#36AF8D] dark:data-[state=checked]:text-black accent-[#157459] data-[state=checked]:p-0",
                labelClass: "text-white dark:text-white"
            };
        }

        // Default unselected styling
        return {
            containerClass: "dark:shadow-[inset_0_0_8px_#B8B8B82B] h-[38px] bg-[#F3F4F9] border-[#B8B8B8] dark:border-none shadow hover:border-[#157459] dark:hover:border-[#36AF8D]",
            checkboxClass: "dark:bg-[#2A2A2A] bg-white dark:border-none border-[#B8B8B8]",
            labelClass: "dark:text-white text-black"
        };
    };

    return (
        <div className={`2xl:mb-[52px] ${isStage1Locked ? "pointer-events-none opacity-70" : ""}`}>
            <FormField
                control={form.control}
                name="selectedOptions"
                render={() => (
                    <FormItem>
                        <div className="space-y-7 2xl:space-y-9">
                            {options.map((opt) => {
                                const status = getOptionStatus(opt.id);
                                const styling = getOptionStyling(opt.id);

                                return (
                                    <FormField
                                        key={opt.id}
                                        control={form.control}
                                        name="selectedOptions"
                                        render={({ field }) => (
                                            <FormItem
                                                className={`flex items-center justify-start border px-5 py-2 2xl:p-4 rounded-md
                                                    cursor-pointer transition font-pt-sans text-sm space-y-0 dark:bg-[#181A1D] bg-[#F3F4F9]
                                                    ${styling.containerClass}
                                                    ${seeWhy ? "cursor-not-allowed" : "cursor-pointer"}`}
                                                onClick={(e) => {
                                                    // Prevent interaction if seeWhy is true
                                                    if (seeWhy) {
                                                        e.preventDefault();
                                                        return;
                                                    }
                                                    // Prevent double-firing when clicking on checkbox
                                                    if (e.target.closest('[role="checkbox"]') || e.target.closest('label')) {
                                                        return;
                                                    }
                                                    // Allow both checking and unchecking
                                                    handleCheckboxChange(opt.text, !status.shouldShow);
                                                }}
                                            >
                                                <FormControl className="w-full h-full">
                                                    <Checkbox
                                                        checked={status.shouldShow}
                                                        onCheckedChange={(checked: boolean) => {
                                                            if (!seeWhy) {
                                                                handleCheckboxChange(opt.text, checked as boolean);
                                                            }
                                                        }}
                                                        disabled={seeWhy}
                                                        className={`w-6 h-6 2xl:w-7 2xl:h-7 mr-3 ${styling.checkboxClass}`}
                                                    />
                                                </FormControl>
                                                <FormLabel className={`2xl:text-[16px] text-[13px] ${styling.labelClass} cursor-pointer font-normal`}>
                                                    {opt.matching ? opt.matching : opt.text}
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