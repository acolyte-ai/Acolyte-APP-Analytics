interface Props {
    duplicateFileInfo: any
}

export default function DialogBody({ duplicateFileInfo }: Props) {

    {/* Dialog Body */ }
    return (

        <div className="p-6">
            <p className="text-sm">
                File name:{" "}
                <span className="font-medium">
                    {duplicateFileInfo?.fileName}
                </span>
            </p>
        </div>
    )
}