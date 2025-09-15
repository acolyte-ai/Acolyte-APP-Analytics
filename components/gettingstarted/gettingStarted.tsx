import Image from "next/image";
import handHi from "../../public/handHi.svg"

export default function GettingStarted() {
    return (
        <div className="flex justify-center items-center bg-white p-4 lg:w-[57rem] lg:h-[27rem] md:w-[37rem] md:h-[27rem] mx-auto gap-4">
            <div className="text-left space-y-10 max-sm:space-y-5">
                <h1 className="text-6xl font-semibold text-[#412B7D] max-sm:text-2xl">GET STARTED</h1>
                <p className="text-[#412B7D] mt-2 ml-2 text-3xl max-sm:text-xl">
                    With <span className="text-green-600 font-medium bg-gradient-to-r text-transparent from-[#553C9A] to-[#047857] bg-clip-text ">Acolyte</span>
                </p>
            </div>
            <div className="ml-4 animate-waving-hand w-32 h-32 max-sm:w-20 max-sm:h-20 mt-3">
                <Image

                    src={handHi}
                    height={150}
                    width={150}
                    alt="waving hand"
                />
            </div>
        </div>


    )
}