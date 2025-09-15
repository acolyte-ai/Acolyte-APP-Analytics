"use client"
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import GoogleButtonDoD from '@/components/auth/googleDoD';
import { useRouter } from "next/navigation";


interface Props {
    next: () => void;
}

const SecureSpot: React.FC = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const router = useRouter();
    const [checkedItems, setCheckedItems] = useState({
        saveRank: true,
        competeVoucher: true,
        trackXP: true,
    });

    return (
        <div className=" flex items-center h-full w-full justify-center font-pt-sans  bg-[#0E0F10]  ">
            <div className=" p-8 max-w-sm w-full flex items-start justify-center flex-col text-left h-full text-white bg-[url(/bg-blue.svg)] bg-center">

                <h2 className="text-4xl font-bold text-emerald-400 mb-6">Secure your spot</h2>
                <p className="text-[22px] mb-10 text-white">
                    You&apos;re crushing it. Make it official. <br />
                    Your future self will thank you.
                </p>

                <div className="flex flex-col items-start gap-4 mb-10">
                    <label className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={checkedItems.saveRank}
                            onChange={(e) => setCheckedItems({ ...checkedItems, saveRank: e.target.checked })}
                            className="form-checkbox h-4 w-4  accent-emerald-800/30 bg-gray-800 text-emerald-400 rounded"
                        />
                        <span className='text-base'>Save your rank and streak</span>
                    </label>

                    <label className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={checkedItems.competeVoucher}
                            onChange={(e) => setCheckedItems({ ...checkedItems, competeVoucher: e.target.checked })}
                            className="form-checkbox h-4 w-4 accent-emerald-800/30 text-emerald-400 bg-gray-800 rounded"
                        />
                        <span className='text-base'>Win exciting rewards</span>
                    </label>

                    <label className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={checkedItems.trackXP}
                            onChange={(e) => setCheckedItems({ ...checkedItems, trackXP: e.target.checked })}
                            className="form-checkbox h-4 w-4 accent-emerald-800/30 text-emerald-400 bg-gray-800 rounded"
                        />
                        <span className='text-base'>Track XP across devices</span>
                    </label>
                </div>

                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full mb-3 px-3 py-2 text-base rounded-md bg-transparent border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full mb-10 px-3 py-2 text-base rounded-md bg-transparent border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />

                <Button
                    disabled={username.length === 0 || email.length === 0}
                    className="w-full bg-emerald-400 hover:bg-emerald-500 text-black font-extrabold py-3 rounded-lg transition"
                    onClick={() => {
                        localStorage.setItem("dod_uname", username)
                        localStorage.setItem("dod_email", email)
                        router.push("/auth/signup")
                    }}
                >
                    Secure My Spot
                </Button>
                <div className="w-full flex items-center justify-center">
                    <Button variant={"ghost"} className="mt-2  text-white text-base hover:underline"
                        onClick={() => router.push("/games/m")}>
                        Skip for Now
                    </Button>
                </div>

                <div className='w-full flex justify-center items-center gap-3 text-zinc-600 mb-4'>
                    <Separator className='w-1/2  bg-zinc-600 ' /> or <Separator className='w-1/2 bg-zinc-600 ' />
                </div>

                <GoogleButtonDoD />

            </div>


        </div>
    );
};

export default SecureSpot;
