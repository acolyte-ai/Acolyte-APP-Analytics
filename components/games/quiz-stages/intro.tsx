
import DiagnosisOfTheDay from "./gamesMobile";
import owl from "@/public/bigOwl.svg"
import doctor from "@/public/doctor.svg"
import Image from "next/image"
import lungs from "@/public/greenLungs.svg"
import meter from "@/public/meter.svg"

export default function IntroGamePage() {

    return (
        <div className="w-full h-full flex bg-gradient-to-r from-[#181A1D] to-[#011F16] items-center justify-center">
            <div className="h-full w-auto   text-white p-6
         grid grid-cols-2 gap-10 ">
                {/* Left Panel */}
                <div className="col-span-1 w-full max-w-2xl h-full p-8 relative space-y-7">
                    <div className="flex items-center justify-start w-full gap-5">
                        <Image
                            src={owl}
                            alt="alt"
                            height={30}
                            width={30}
                            className="w-14 h-14 object-contain"

                        />
                        <h2 className="text-3xl font-semibold tracking-wide">Acolyte AI</h2>
                    </div>
                    <div className="w-full  space-y-2 ">
                        <h1 className="text-4xl font-bold text-emerald-400">Diagnosis of the day</h1>
                        <p className="text-gray-400 text-sm">Crack a case everyday. Stay sharp. Stay on top.</p>
                    </div>

                    <div className="w-full h-full ">
                        <div className="dark:bg-[#0F1012] bg-[#EBEBF5] rounded-xl p-8 w-72 h-fit shadow-lg border border-[#1B352F]">
                            <div className="mb-4 space-y-4">
                                <p className="text-emerald-400 text-xl font-semibold">Todays Focus</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-lg">        <Image
                                        src={lungs}
                                        alt="alt"
                                        height={30}
                                        width={30}
                                        className="w-10 h-10 object-contain"

                                    /></span>
                                    <span className="text-lg">Respiratory Disorder</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-yellow-400 text-xl font-semibold">Difficulty</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-lg">        <Image
                                        src={meter}
                                        alt="alt"
                                        height={30}
                                        width={30}
                                        className="w-10 h-10 object-contain"

                                    /></span>
                                    <span className="text-lg">Intermediate</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 absolute bottom-0 left-40 max-lg:left-10 w-full flex justify-start">
                        <Image
                            src={doctor}
                            alt="doctor"
                            height={70}
                            width={70}
                            className="w-56 h-72 max-lg:w-96 max-lg:h-96 object-contain"
                        />
                    </div>
                </div>

                {/* Right Panel */}
                <div className="col-span-1 w-[450px] h-full  flex justify-center items-start p-8">
                    <div className="max-w-md w-full h-[80vh] max-lg:h-[75vh] bg-[#0E0F10] rounded-3xl font-[futureHeadline]">      <DiagnosisOfTheDay /></div>

                </div>
            </div>
        </div>



    )
}