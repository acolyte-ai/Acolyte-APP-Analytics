import AssessmentHeader from "@/components/sidebar/header";

export default function ChatHeaderFooter() {
    return (
        <>
            <div className="absolute top-0 left-0 right-0">
                <div className="relative h-20">
                    <div className="absolute top-0 left-0 right-0 max-md:min-h-20 h-20 max-md:py-3 bg-[#181A1D] z-10">
                        <div className="md:hidden flex items-center h-full w-full">
                            <AssessmentHeader />
                        </div>
                    </div>
                    <div className="absolute max-md:top-[60px] top-10 left-0 right-0 max-md:h-5 h-10 dark:bg-[#0F1012] bg-[#EBEBF5] shadow-[inset_0_8px_8px_-8px_#EFEFEF40,inset_8px_0_8px_-8px_#EFEFEF40,inset_-8px_0_8px_-8px_#EFEFEF40] rounded-t-[31px] z-20"></div>
                </div>
            </div>



            <div className="absolute bottom-0 left-0 right-0">
                <div className="relative h-20">
                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-[#181A1D] z-10" />
                    <div className="absolute bottom-10 left-0 right-0 h-10 dark:bg-[#0F1012] bg-[#EBEBF5] shadow-[inset_8px_0_8px_-8px_#EFEFEF40,inset_-8px_0_8px_-8px_#EFEFEF40,inset_0_-8px_8px_-8px_#EFEFEF40] rounded-b-[31px] z-20" />
                </div>
            </div>
        </>



    )
}