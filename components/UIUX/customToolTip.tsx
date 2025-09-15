"use client"
// import { Video } from "lucide-react";
import { useSettings } from "@/context/store";
import { TooltipRenderProps } from "react-joyride";
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button";

export default function CustomTooltip({ closeProps, index, step, primaryProps, size,
    backProps,
    skipProps,

}: TooltipRenderProps) {
    const { setDashBoardNavigation, setTodoNavigation, setSideBarNavigation, setHeaderNavigation,
        setPdfSidebarNavigation, setPdfHeaderNavigation, setToolBarNavigation
    } = useSettings();
    const route = useRouter();
    const pathName = usePathname().split('/')[1];
    const currentPath = usePathname()
    console.log("size::", index + 1, size, pathName, currentPath)

    const dashNavDone = localStorage.getItem("aco-dash-nav") === "true"
    const pdfNavDone = localStorage.getItem("aco-pdf-nav") === "true"
    const dashNavNotDone = localStorage.getItem("aco-dash-nav") === "false"
    const pdfNavNotDone = localStorage.getItem("aco-pdf-nav") === "false"

    const progressPercent = ((index + 1) / size) * 100;

    return (
        <div className="custom-tooltip bg-[#ffffff]  border border-[#ffffff]  rounded-3xl max-w-xs min-w-72 p-4" >
            <div className="w-full justify-between flex">
                <Button {...skipProps} variant={"link"} className="skip-tutorial  text-right underline text-xs dark:text-violet-800 text-violet-800 "
                >
                    Skip
                </Button>

                <Button
                    {...closeProps}
                    variant={"destructive"}
                    size={"sm"}
                    className="next-btn rounded-full bg-rose-600 h-6 w-5 tracking-wider  text-xs"
                >
                    X
                </Button>


            </div>
            <div className="tooltip-content px-4 pt-2 pb-4">


                <div className="w-full bg-gray-200 h-2 rounded-full my-4 overflow-hidden ">
                    <div
                        className="h-full bg-blue-600 transition-all duration-300 bg-[#2e30c7]"
                        style={{ width: `${progressPercent}%` }}
                    ></div>
                </div>
                <div>
                    <h2 className="tooltip-title text-[#2e30c7] font-bold text-lg ">{step.title}</h2>
                    <p className="tooltip-text text-[#2025c7] w-full leading-4 text-wrap tracking-wide text-sm py-2 min-h-10">{step.content}</p>
                </div>
            </div>
            <div className="tooltip-footer flex justify-between ">

                {index > 0 && (
                    <Button
                        {...backProps}
                        className="next-btn dark:bg-[#5f5cff] bg-[#5f5cff] p-3 dark:hover:bg-[#3330ff]
                 dark:text-white text-white hover:bg-[#3330ff] tracking-wider text-base"
                    >
                        Back
                    </Button>
                )}


                <Button {...primaryProps} className="next-btn dark:bg-[#5f5cff] bg-[#5f5cff] p-3 dark:hover:bg-[#3330ff]
                 dark:text-white text-white hover:bg-[#3330ff] tracking-wider text-base">
                    {(dashNavDone && pathName === "dashboard") ? index + 1 === size ? <p onClick={() => {
                        setDashBoardNavigation(false)
                        setTodoNavigation(false)
                        setSideBarNavigation(false)
                        setHeaderNavigation(false)
                        setPdfSidebarNavigation(false)
                        setPdfHeaderNavigation(false)
                        setToolBarNavigation(false)
                    }}>Finish</p> : "Next" : ""}

                    {(pdfNavDone && pathName === "workspace") ? index + 1 === size ? <p onClick={() => {
                        setDashBoardNavigation(false)
                        setTodoNavigation(false)
                        setSideBarNavigation(false)
                        setHeaderNavigation(false)
                        setPdfSidebarNavigation(false)
                        setPdfHeaderNavigation(false)
                        setToolBarNavigation(false)
                    }}>Finish</p> : "Next" : ""}

                    {(step.target === "#chat" && dashNavNotDone) ? <p onClick={() => {
                        localStorage.setItem("aco-dash-nav", "true")
                    }}>Finish</p> :
                        (dashNavNotDone && step.target === "#collaborate-study" && pathName === "dashboard") ?
                            <p onClick={() => route.push("/dashboard/pdf/")} >To My PDF</p>
                            : (dashNavNotDone && step.target === "#pdf-subject" && pathName === "dashboard") ?
                                <p onClick={() => route.push("/dashboard/notes/")} >To My Notes</p>
                                : (dashNavNotDone && pathName === "dashboard") ?
                                    "Next" : ""}

                    {(step.target === "#train-pdf" && pdfNavNotDone) ? <p onClick={() => {
                        localStorage.setItem("aco-pdf-nav", "true")
                    }}>Finish</p> :
                        (pdfNavNotDone && pathName === "workspace") ?
                            "Next" : ""}
                </Button>
            </div>
        </div>
    );
};