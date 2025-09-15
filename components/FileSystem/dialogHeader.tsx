import {
    AlertTriangle,
} from "lucide-react";


export default function DialogHeader() {
    {/* Dialog Header */ }
    return (


        < div className="p-6 border-b" >
            <div className="flex items-center mb-2">
                <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                <h2 className="text-lg font-semibold">Duplicate File</h2>
            </div>
            <p className="text-sm text-gray-500">
                A file with the same name already exists. What would you like
                to do?
            </p>
        </div >

    )
}