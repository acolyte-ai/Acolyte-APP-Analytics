"use client"
import Image from "next/image";
import acolyte from "@/public/owl_logo.svg"
import notify from "@/public/newIcons/notification_new.svg"
import person from "@/public/newIcons/myProfile.svg";
// import HeaderButtonUI from "../UIUX/headerButton";
import ToggleButton from "@/components/UIUX/theme_toggle";
// import SideBarSheet from "../UIUX/sideBarSheet";
import { useRouter } from "next/navigation"
import SideBarSheet from "@/components/sidebar/sideBarSheet";
import HeaderButtonUI from "../Exam/UI/headerButton";


export default function AssessmentHeader() {
    const router = useRouter()
    return (
        <div className="flex flex-1 items-center justify-between  mb-5 md:hidden
         px-4 w-full font-[futureHeadline]">
            <Image src={acolyte} height={30} width={30} alt="acolyte" />
            <div className="flex gap-5 max-md:gap-4 items-center justify-center">

                <HeaderButtonUI>
                    <Image src={notify} height={30} width={30} alt="notify" />
                </HeaderButtonUI>

                <HeaderButtonUI>
                    {/* <Image src={sun} height={30} width={30} alt="sun" /> */}
                    <ToggleButton />
                </HeaderButtonUI>

                <HeaderButtonUI>
                    <Image src={person} height={30} width={30} alt="person" onClick={() => { router.push("/student-profile") }} />
                </HeaderButtonUI>

                {/* <HeaderButtonUI> */}
                <SideBarSheet />
                {/* </HeaderButtonUI> */}


            </div>
        </div>
    )
}