"use client";

import {
    Card,
    CardContent,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";


export default function WeakTopicsTableCard({ data }) {
    return (
        <Card className=" text-white h-full w-full bg-transparent dark:bg-transparent p-0 border-none">
            <h3 className=" font-normal tracking-normal text-[22px] font-[futureHeadlineBold] mb-6 text-[#228367] dark:text-white">Identified Weak Topics</h3>
            <CardContent className="p-0 rounded-xl font-pt-sans
                dark:bg-[#181A1D] bg-[#F3F4F9]  dark:shadow-[inset_0_0_8px_#B8B8B82B] dark:border-none border border-[#B8B8B8] shadow-md px-[26px] py-5">

                <div className="h-[300px] border-[#DADADA] overflow-y-auto no-scroll  dark:border-[#303336]  border rounded-t-xl" >
                    <Table className="w-full text-base ">
                        <TableHeader className="rounded-t-xl">
                            <TableRow className="bg-[#DADADA] dark:bg-[#303336] rounded-t-xl">
                                <TableHead className="dark:text-white text-black font-medium rounded-tl-xl">TOPIC</TableHead>
                                <TableHead className="dark:text-white text-black font-medium">ACCURACY</TableHead>
                                <TableHead className="dark:text-white text-black font-medium">REVISITS</TableHead>
                                <TableHead className="dark:text-white text-black font-medium">CHANGES</TableHead>
                                {/* <TableHead className="dark:text-white text-black font-medium rounded-tr-xl">ACTION</TableHead> */}
                            </TableRow>
                        </TableHeader>

                        <TableBody>

                            {data && data.length > 0 ? (
                                data.map((item, index) => (

                                    <TableRow className="border-t font-medium dark:text-white text-black  text-lg dark:border-[#303336] border-[#DADADA]" key={index}>
                                        <TableCell>{item.topic ?? "null"}</TableCell>
                                        <TableCell>{item.accuracy ?? 0}</TableCell>
                                        <TableCell>{item.revisits ?? 0}</TableCell>
                                        <TableCell>{item.changes ?? 0}</TableCell>
                                        {/* <TableCell className="place-items-end w-full flex items-center  justify-center">
                                            <Button className="bg-[#36AF8D] hover:bg-[#2c8f73] dark:bg-[#36AF8D] dark:hover:bg-[#2c8f73] w-full text-white dark:text-black text-xs px-[14px] py-[13px]">
                                                Review Now
                                            </Button>
                                        </TableCell> */}
                                    </TableRow>

                                ))
                            ) : (
                                // Empty state - show placeholder rows
                                Array.from({ length: 5 }).map((_, index) => (
                                    <TableRow key={`empty-${index}`} className="border-t font-medium dark:text-white text-black dark:border-[#303336] border-[#DADADA]">
                                        <TableCell className="text-gray-400">
                                            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                                        </TableCell>
                                        <TableCell className="text-gray-400">
                                            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-16"></div>
                                        </TableCell>
                                        <TableCell className="text-gray-400">
                                            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-12"></div>
                                        </TableCell>
                                        <TableCell className="text-gray-400">
                                            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-12"></div>
                                        </TableCell>
                                        <TableCell className="place-items-end w-full flex items-center justify-center">
                                            <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-full"></div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}

                            {/* Alternative simpler empty state - uncomment this and comment the above if you prefer */}
                            {/*
            {(!data || data.length === 0) && (
                <TableRow className="border-t">
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        No data available
                    </TableCell>
                </TableRow>
            )}
            */}
                        </TableBody>

                    </Table>
                </div>


                <div className=" text-sm p-5 space-y-4 font-medium font-pt-sans border-b border-x rounded-b-xl -mt-2 dark:border-x-[#303336] border-x-[#DADADA] dark:border-b-[#303336] border-b-[#DADADA]">
                    <p className="text-[#36AF8D]  max-md:text-base text-lg">Weak Topics Analysis</p>
                    <p className="text-[#BDBDBD] max-md:text-sm text-base">
                        These topics show both low accuracy and high uncertainty (multiple revisits/changes).
                        Genetic Disorders shows the lowest performance (62% accuracy, 10 revisits).
                    </p>
                </div>
            </CardContent>
        </Card >
    );
}
