import React from "react";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { useCreateNote } from "@/hooks/useCreateNote";
import { createOrUpdateItem, FileSystemItem } from "@/lib/fileSystemUtils";
import useUserId from "@/hooks/useUserId";
import { v4 as uuidV4 } from "uuid";
import { useRouter } from "next/navigation";
import { useViewCombination } from "@/hooks/useViewCombination.ts";


// userId: string;
//   id: string;
//   name: string;
//   type: "file" | "folder";
//   fileType?: "pdf" | "note";
//   parentId: string | null;
//   timestamp?: string;

export default function MedicalNavigation() {
  const medicalSubjects = [
    {
      imageSrc: "/newIcons/human.svg",
      label: "Anatomy",
    },
    {
      imageSrc: "/newIcons/lungs.svg",
      label: "Physiology",
    },
    {
      imageSrc: "/newIcons/oncology.svg",
      label: "Oncology",
    },
    {
      imageSrc: "/newIcons/germs.svg",
      label: "Pathology",
    },
    {
      imageSrc: "/newIcons/cardio.svg",
      label: "Cardiology",
    },
    {
      imageSrc: "/newIcons/pediatrician.svg",
      label: "Pediatrics",
    },
    {
      imageSrc: "/newIcons/obstetrics.svg",
      label: "Obstetrics & GyG",
    },
    {
      imageSrc: "/newIcons/bones.svg",
      label: "Orthopedics",
    },
    {
      imageSrc: "/newIcons/hair.svg",
      label: "Dermatology",
    },
    {
      imageSrc: "/newIcons/emergency.svg",
      label: "Emergency Medicine",
    },
    {
      imageSrc: "/newIcons/psychiatry.svg",
      label: "Psychiatry",
    },
    {
      imageSrc: "/newIcons/pills.svg",
      label: "Pharmacology",
    },
    {
      imageSrc: "/newIcons/biology.svg",
      label: "Micro Biology",
    },
    {
      imageSrc: "/newIcons/biochemistry.svg",
      label: "Biochemistry",
    },
    {
      imageSrc: "/newIcons/x-ray.svg",
      label: "Radiology",
    },
  ];

  const userId = useUserId();
  const router = useRouter()
  const { updateViewCombination } = useViewCombination()

  // Function to convert label to folder name format
  const createFolderName = (label) => {
    return `folder-${label
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/&/g, "and")}`;
  };

  const handleCreateFolder = async (label) => {
    const folderName = createFolderName(label);
    if (!userId) return;
    const id = uuidV4()

    const folder: FileSystemItem = {
      userId: userId,
      id: id,
      name: `note-${id}`,
      type: "file",
      fileType: "note",
      parentId: folderName, // assuming folderName holds the ID of the parent folder
      timestamp: new Date().toISOString(),
    };

    try {
      updateViewCombination("notes")
      router.push(`/workspace/${id}`);
      await createOrUpdateItem(folder);

      console.log(`Created folder: ${folderName}`);
    } catch (error) {
      console.error("Error creating folder:", error);
    }
  };

  return (
    <div
      className="px-[20.814px] pt-[21px] pb-5 dark:bg-[#181A1D] bg-[#F3F4F9]
            rounded-[7px] dark:shadow-[inset_0_0_8px_#B8B8B82B] dark:border-none border border-[#B8B8B8] shadow-md"
    >
      <div className="grid max-sm:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-[13px]">
        {medicalSubjects.map((item, index) => {
          return (
            <Card
              key={index}
              onClick={() => handleCreateFolder(item.label)}
              className="w-full dark:shadow-[inset_0_0_8px_#B8B8B82B] dark:border-none border border-[#B8B8B8] shadow-md rounded-[7px] cursor-pointer hover:opacity-80 dark:bg-[#181A1D] bg-[#F3F4F9]
                              transition-opacity flex-1 flex flex-col justify-center items-center gap-[18px] px-4 py-[15px]"
            >
              <div className="flex flex-col items-center gap-[18px] w-full">
                <Image
                  src={item.imageSrc}
                  alt={item.label}
                  width={24}
                  height={24}
                  className="h-[22px] w-[22px] flex-shrink-0"
                />
                <p className="lg:text-[16px] sm:text-[14px] text-[12px] font-normal text-center font-causten-semibold leading-tight dark:text-[#B8B8B8] text-black w-full truncate px-1">
                  {item.label}
                </p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
