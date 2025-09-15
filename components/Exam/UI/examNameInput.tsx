
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getExamNameVariations } from '@/lib/utils';
import { useSettings } from '@/context/store';


const SimpleExamNameInput = ({ examName, setExamName }: { examName: string, setExamName: (val: string) => void }) => {
    // Generate default exam name with current date and time
    const { selectedFile } = useSettings()

    console.log("examNAme!!!=>", examName)

    return (
        <div className="w-full  space-y-2 font-pt-sans">
            <Label htmlFor="examName" className="md:text-lg text-sm font-semibold text-zinc-700">
                Exam Name:
            </Label>

            <Input
                id="examName"
                value={examName.length > 0 ? examName : getExamNameVariations(selectedFile?.fileName)}
                onChange={(e) => setExamName(e.target.value)}
                className="w-full border border-zinc-100"
                placeholder="Enter exam name..."
            />


        </div>
    );
};

export default SimpleExamNameInput