import { Button } from "@/components/ui/button";


interface Props {
    title: string;
    name: string;
}

export default function AiSuggestionItems({ title, name }: Props) {
    return (
        <div className="w-full px-[35px] py-[21px] 2xl:py-[30px] 2xl:px-[45px]">
            <p className=" mb-4 font-pt-sans font-medium text-[18px] 2xl:text-[16px]">{title}</p>
            <Button className="dark:bg-[#36AF8D] bg-[#36AF8D] text-white hover:text-black hover:dark:text-white hover:bg-transparent
             dark:text-black text-[15px] 2xl:text-[13px] w-full font-medium">{name}</Button>
        </div>
    )
}