import Image from "next/image"
interface Props {
  icon: string;
  title: string;
  content: string
}

export default function CardOptionEmpty({ icon, title, content }: Props) {
  return (
    <div
      className="w-full h-full flex items-center justify-between dark:bg-[#1C2626] bg-[#F3F4F9] cursor-pointer font-causten-semibold
          rounded-xl xl:py-4 max-md:py-2 py-4 border border-[#B8B8B8] shadow-md dark:shadow-none dark:border-none"
    >
      <div className="grid grid-cols-12 grid-rows-2 gap-2 max-sm:gap-1 max-md:gap-1 text-wrap h-full w-full px-4 xl:px-6 items-stretch"
      >
        <div className="col-span-3 row-span-2 max-md:col-span-1 max-sm:col-span-2 max-xl:row-span-2 max-md:row-span-2 flex items-start justify-start md:items-start w-full  h-full">
          <Image
            src={icon}
            height={45}
            width={45}
            alt={icon}
            className="brightness-75 dark:brightness-100 object-contain contrast-150 dark:contrast-100 dark:hue-rotate-0 hue-rotate-0 h-auto p-2"
          />
        </div>
        <p className="col-span-9 row-span-1 flex items-start justify-start text-left text-[18px] 2xl:text-[22px] w-full text-wrap font-causten-semibold
              text-[#184C3D] dark:text-white font-medium leading-tight">
          {title}
        </p>
        <p className="col-span-9 row-span-1 justify-start max-xl:col-span-9 flex items-start text-[13px] xl:text-[14px] font-causten-semibold
             w-full text-wrap break-words text-[#747474] dark:text-[#C6C6C6] font-medium leading-relaxed">
          {content}
        </p>
      </div>
    </div>
  )
}