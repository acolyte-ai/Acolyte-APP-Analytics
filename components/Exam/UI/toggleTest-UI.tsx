import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import VibrantButtonUI from "./buttonUI";

export default function ToggleGroupTest({ selectedMode, handleSelectMode }) {
    return (
        <ToggleGroup
            type="single"
            value={selectedMode}
            onValueChange={(value) => value && handleSelectMode(value)}
            className="w-fit  flex justify-start items-end dark:bg-[#1F2323] bg-[#E6E7EB] p-0.5
                        rounded-lg dark:border-none border border-[#B8B8B8] dark:shadow-[inset_0_0_8px_#B8B8B82B]"
        >
            <ToggleGroupItem
                value="practice"
                className="dark:bg-[#1F2323] bg-[#E6E7EB] p-0"
            >

                <VibrantButtonUI
                    size={"default"}
                    active={selectedMode === "practice"}
                    font=" p-0 py-1 px-2 m-0 mx-0 dark:text-white text-[#184C3D]"
                >
                    <p className="2xl:text-[14px] text-xs">Practice test</p>
                </VibrantButtonUI>
            </ToggleGroupItem>

            <ToggleGroupItem
                value="simulated"
                className="dark:bg-[#1F2323] bg-[#E6E7EB] p-0"
            >

                <VibrantButtonUI
                    size={"default"}
                    active={selectedMode === "simulated"}
                    font=" p-0 py-1 px-2 m-0 mx-0 dark:text-white text-[#184C3D]"
                >
                    <p className="2xl:text-[14px] text-xs">
                        Simulated test
                    </p>
                </VibrantButtonUI>
            </ToggleGroupItem>
        </ToggleGroup>
    )
}