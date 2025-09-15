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
    seeWhy: boolean;
    handleCheckboxChange?: (val: string, checked: boolean) => void;
}

export default function FeedBack({ form, options, selectedOptions, seeWhy, handleCheckboxChange }: Props) {


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
                                // Fixed: Compare with opt.value for consistency
                                const isSelected = selectedOptions === opt.value;

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
                                                        ${isSelected
                                                                ? "bg-[#36AF8D]/30 border-2 border-[#36AF8D] transform scale-110 dark:bg-[#152D26] dark:border-[#36AF8D]"
                                                                : "hover:bg-zinc-100 dark:hover:bg-[#2A2A2A] border-2 border-transparent bg-white dark:bg-zinc-800"
                                                            }
                                                        ${seeWhy ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                                                        onClick={() => {
                                                            if (!seeWhy) {
                                                                // Fixed: Pass opt.value instead of opt.text for consistency
                                                                handleCheckboxChange?.(opt.value, !isSelected);
                                                            }
                                                        }}
                                                    >
                                                        {/* Emoji Button */}
                                                        <div className={`text-3xl 2xl:text-4xl p-2 rounded-full transition-all duration-200
                                                        ${isSelected
                                                                ? 'bg-[#36AF8D] bg-opacity-20'
                                                                : 'hover:bg-zinc-100 dark:hover:bg-[#2A2A2A]'
                                                            }`}>
                                                            {emojis[index] || '😐'}
                                                        </div>

                                                        {/* Hidden Checkbox for form compatibility */}
                                                        <Checkbox
                                                            checked={isSelected}
                                                            onCheckedChange={(checked: boolean) =>
                                                                // Fixed: Pass opt.value instead of opt.text for consistency
                                                                handleCheckboxChange?.(opt.value, checked as boolean)
                                                            }
                                                            disabled={seeWhy}
                                                            className="sr-only"
                                                        />
                                                    </div>
                                                </FormControl>

                                                {/* Label */}
                                                <FormLabel className={`2xl:text-[14px] text-[11px] cursor-pointer font-normal text-center max-w-20 leading-tight py-5 transition-colors duration-200
                                                ${isSelected
                                                        ? "text-[#36AF8D] font-medium dark:text-[#36AF8D]"
                                                        : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
                                                    }
                                                ${seeWhy ? "cursor-not-allowed" : "cursor-pointer"}`}
                                                    onClick={() => {
                                                        if (!seeWhy) {
                                                            // Fixed: Pass opt.value instead of opt.text for consistency
                                                            handleCheckboxChange?.(opt.value, !isSelected);
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