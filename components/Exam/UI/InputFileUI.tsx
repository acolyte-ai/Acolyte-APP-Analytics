
"use client";
import download from "@/public/assets/images/download.svg"
import Image from 'next/image';



const FileUploadUI: React.FC = () => {



    return (
        <div
            className={`  upload-container
2xl:px-[26px]  px-[23px] py-6 border-[#6A6E73] dark:border-muted
    border-2 border-dashed rounded-lg text-center cursor-pointer
    flex flex-col items-center justify-center  min-h-[91px]
    transition-all duration-200 ease-in-out 2xl:space-y-4

  `}
        >


            <Image src={download} height={50} width={50} alt={"download"} className="
                           dark:brightness-100 object-contain w-5 h-5
                          " />
            <div>
                <p className='m-0 text-[11px] 2xl:text-[13px] text-[#6A6E73] font-bold font-pt-sans' >
                    Click to browse or<br />

                </p>
                <p className='m-0 text-[11px] 2xl:text-[13px]  font-medium font-pt-sans text-[#36AF8D]' >

                    drag and upload your files
                </p>
                {/* {maxSize && (
                    <p className='m-0 text-sm max-lg:text-xs text-zinc-500'>
                        Maximum file size: {formatFileSize(maxSize)}
                    </p>
                )} */}
            </div>
        </div>
    );
};

export default FileUploadUI;