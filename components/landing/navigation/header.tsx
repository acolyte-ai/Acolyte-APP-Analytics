import Image from "next/image";
import { HeaderMenubar } from "../UI/UI-header";
import logo from "@/public/bigOwl.svg"

export default function HeaderLanding() {
    return (
        <div className="px-9 py-[17px]  bg-gradient-to-l  from-[#141414] to-[#191F1D]  flex items-center justify-between w-full ">
            <Image
                src={logo}
                alt="logo"
                height={
                    30
                }
                width={30}
            />
            <HeaderMenubar />
        </div>
    )
}


