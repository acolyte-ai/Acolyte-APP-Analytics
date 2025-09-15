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
    seeWhy: boolean;
    handleCheckboxChange: (val: string, checked: boolean) => void;
}

export default function Mcq({ form, options, selectedOptions, seeWhy, handleCheckboxChange, isStage1Locked }: Props) {

    return (
        <div className={` 2xl:mb-[52px] ${isStage1Locked ? "pointer-events-none opacity-70" : ""} `} >

            <FormField
                control={form.control}
                name="selectedOptions"
                render={() => (
                    <FormItem>
                        <div className="space-y-7 2xl:space-y-9">
                            {options.map((opt) => {
                                const isSelected = selectedOptions === opt.text;
                                return (
                                    <FormField
                                        key={opt.id}
                                        control={form.control}
                                        name="selectedOptions"
                                        render={({ field }) => (
                                            <FormItem
                                                className={`flex items-center justify-start border px-5 py-2 2xl:p-4 rounded-md
                                      cursor-pointer transition font-pt-sans text-sm space-y-0 dark:bg-[#181A1D] bg-[#F3F4F9]
                                      ${isSelected
                                                        ? "bg-[#152D26]/10 border-[#36AF8D] bg-[#36AF8D] dark:bg-[#152D26] dark:border-[#36AF8D]"
                                                        : " dark:shadow-[inset_0_0_8px_#B8B8B82B] h-[38px] bg-[#F3F4F9] border-[#B8B8B8] dark:border-none shadow hover:border-[#157459] dark:hover:border-[#36AF8D] "
                                                    } ${seeWhy ? "cursor-not-allowed" : "cursor-pointer"}`}

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
                                                    handleCheckboxChange(opt.text, !isSelected);
                                                }}

                                            >
                                                <FormControl className="w-full h-full">
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onCheckedChange={(checked: boolean) => {
                                                            // Only allow checking, not unchecking
                                                            // if (checked || !isSelected) {
                                                            handleCheckboxChange(opt.text, checked as boolean);
                                                            // }
                                                        }}
                                                        disabled={seeWhy}
                                                        className={`w-6 h-6 2xl:w-7 2xl:h-7 mr-3  ${isSelected
                                                            ? "bg-white  border-[#157459] dark:border-none  data-[state=checked]:bg-white data-[state=checked]:text-[#157459] dark:data-[state=checked]:bg-[#36AF8D] dark:data-[state=checked]:text-black accent-[#157459] data-[state=checked]:p-0"
                                                            : "dark:bg-[#2A2A2A] bg-white dark:border-none border-[#B8B8B8]"
                                                            }`}
                                                    />
                                                </FormControl>
                                                <FormLabel className={`2xl:text-[16px] text-[13px] ${isSelected ? "text-white dark:text-white " : "dark:text-white text-black"}  cursor-pointer font-normal`}>
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
        </div >
    )
}