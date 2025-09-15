
import { Separator } from "@/components/ui/separator";
import SearchUI from "../Exam/UI/searchUI";

export default function HeaderSearchBar() {
    return (
        <div className="w-full">
            <SearchUI />
            <Separator
                className="max-md:hidden my-0 py-0 h-[2px] bg-transparent dark:bg-transparent "
            />

        </div>
    )
}