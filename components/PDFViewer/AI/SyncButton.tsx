"use client";
import Image from "next/image";
import sync1 from "@/public/header/sync.svg";
import { useSyncLogic } from "./SyncLogic"; // Import the hook from our logic file

export const SyncButton = () => {
  const { syncStatus, syncAll } = useSyncLogic();

  return (
    <div
      className="  cursor-pointer "
      onClick={syncAll}
    >
      <span className="relative" id="header-sync">
        <Image
          loading="lazy"
          height={50}
          width={50}
          src={sync1}
          alt="Sync"
          className={`object-contain p-1 shrink-0 aspect-square ${syncStatus === "syncing" ? "animate-spin" : ""
            }`}
        />
        {syncStatus === "success" && (
          <img
            src="/synccheck.svg"
            alt="Check"
            className="absolute bottom-0 right-0 w-3 h-3 min-w-2 min-h-2"
          />
        )}
        {/* {syncStatus === "error" && (
          <img
            src="/syncerror.svg"
            alt="Error"
            className="absolute bottom-0 right-0 w-4 h-4 min-w-4 min-h-4"
          />
        )} */}
      </span>
      {/* <span className="font-medium text-sm whitespace-nowrap max-lg:text-xs">
        Sync is {syncStatus === "syncing" ? "in progress" : "on"}
      </span> */}
    </div>
  );
};