import Image from "next/image";
import MedicalTopicsUI from "./chatSuggestions";
import bigOwl from "@/public/bigOwl.svg";

export default function WelcomeScreen({
    handleSendMessage,
    setInputMessage
}: {
    handleSendMessage: (val: string) => void;
    setInputMessage: (val: string) => void;
}) {

    function handleMessage(val: string) {
        console.log("Sending message:", val);
        setInputMessage(val)
    }

    return (
        <div className="w-full max-w-4xl mx-auto px-4 py-8 flex max-lg:mt-10 flex-col items-center justify-center min-h-[60vh]">
            {/* Logo and Title */}
            <div className="text-center mb-12">
                <div className="mb-6">
                    <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Image
                            src={bigOwl}
                            alt="Acolyte"
                            height={32}
                            width={32}
                            className="w-8 h-8"
                        />
                    </div>
                </div>

                <h1 className="text-3xl font-medium text-gray-900 dark:text-white mb-2">
                    Hello
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                    I'm Acolyte, your AI assistant. How can I help you today?
                </p>
            </div>

            {/* Suggestions */}
            <div className="w-full max-w-2xl">
                <MedicalTopicsUI handleSendMessage={handleMessage} />
            </div>
        </div>
    )
}