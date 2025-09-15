"use client"

import Achievement from "@/components/studentProfile/dashboard/achievement";
import AchievementDialog from "@/components/studentProfile/dashboard/allAchivement";
import ContactInfo from "@/components/studentProfile/dashboard/contactInfo";
import CurrentGoals from "@/components/studentProfile/dashboard/currentGoal";
import ProfileCard from "@/components/studentProfile/dashboard/introCard";
import MyLearning from "@/components/studentProfile/dashboard/progressCard";
import Statistics from "@/components/studentProfile/dashboard/score";
import { parseCookies } from "nookies";
import { useEffect, useState } from "react";
import { ContactData, CurrentGoal, LearningData, ProfileData, ProfileResponse, StatisticData, Achievements } from "./profileTypes";
import axios from "axios";
import useUserId from "@/hooks/useUserId";

export default function StudentProfile() {
    const [cookies, setCookies] = useState<{ userName: string, userEmail: string }>({});
    // State variables for all profile data
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [contactData, setContactData] = useState<ContactData | null>(null);
    const [currentGoals, setCurrentGoals] = useState<CurrentGoal[]>([]);
    const [myLearning, setMyLearning] = useState<LearningData[]>([]);
    const [statistics, setStatistics] = useState<StatisticData[]>([]);
    const [achievements, setAchievements] = useState<Achievements[]>([]);
    const userId = useUserId()

    // Loading and error states
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // API function to fetch profile data
    const fetchProfileData = async (userId: string) => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get<ProfileResponse>(
                process.env.NEXT_PUBLIC_PROFILE_BASE_URL + `/dev/v1/profile/${userId}`
            );

            const data = response.data;

            // Update all state variables
            setProfileData(data.profile);
            setContactData(data.contact);
            setCurrentGoals(data.currentGoals);
            setMyLearning(data.myLearning);
            setStatistics(data.statistics);
            setAchievements(data.achievements);

            setLoading(false);
            return data;
        } catch (err) {
            console.error('Error fetching profile data:', err);
            setError(err?.message || 'Failed to fetch profile data');
            setLoading(false);
            throw err;
        }
    };

    useEffect(() => {
        if (userId) {
            fetchProfileData(userId)
            // Read cookies only on the client side
            setCookies(parseCookies());
        }

    }, [userId]);



    return (
        <div className="min-h-screen lg:p-6 p-5 dark:bg-[#0F1012] bg-[#EBEBF5]">
            <div className="w-full max-h-screen overflow-y-auto no-scrollbar pb-40" >
                <div className="grid grid-cols-1 sm:grid-cols-11 gap-5 xl:gap-6 pb-6">
                    {/* Profile Card - Always full width */}
                    <div className="col-span-1 sm:col-span-11">
                        <ProfileCard data={profileData} />
                    </div>

                    {/* Contact Information */}
                    <div className="col-span-1 sm:col-span-11 lg:col-span-3 h-fit flex flex-col space-y-3 max-lg:space-y-[15px]">
                        <h2 className="dark:text-white text-[#228367] font-[futureHeadlineBold] font-thin tracking-wide leading-tight xl:text-[23px] text-[20px] max-lg:text-[20px]">
                            Contact Information
                        </h2>
                        <div className="flex-1 h-auto">
                            <ContactInfo data={contactData} />
                        </div>
                    </div>

                    {/* My Learning */}
                    <div className="col-span-1 sm:col-span-11 lg:col-span-4 flex flex-col space-y-3 max-lg:space-y-[15px]">
                        <h2 className="dark:text-white text-[#228367] font-[futureHeadlineBold] font-thin tracking-wide leading-tight xl:text-[23px] text-[20px] max-lg:text-[20px]">
                            My Learning
                        </h2>
                        <div className="flex-1 h-auto">
                            <MyLearning data={myLearning} />
                        </div>
                    </div>

                    {/* Current Goals */}
                    <div className="col-span-1 sm:col-span-11 lg:col-span-4 flex flex-col space-y-3 max-lg:space-y-[15px]">
                        <h2 className="dark:text-white text-[#228367] text-[20px] xl:text-[23px] max-lg:text-[20px] font-[futureHeadlineBold] font-thin tracking-wide leading-tight">
                            Current Goals
                        </h2>
                        <div className="flex-1 h-auto">
                            <CurrentGoals data={currentGoals} />
                        </div>
                    </div>

                    {/* Statistics */}
                    <div className="col-span-1 sm:col-span-11 lg:col-span-4 xl:col-span-3 flex flex-col space-y-3 max-lg:space-y-[15px]">
                        <h2 className="dark:text-white text-[#228367] font-[futureHeadlineBold] font-thin tracking-wide xl:text-[23px] leading-tight text-[20px] max-lg:text-[20px]">
                            Statistics
                        </h2>
                        <div className="flex-1 h-auto">
                            <Statistics data={statistics} />
                        </div>
                    </div>

                    {/* Achievements */}
                    <div className="col-span-1 sm:col-span-11 lg:col-span-7 xl:col-span-8 flex flex-col space-y-3 max-lg:space-y-[15px]">
                        <div className="flex justify-between items-center">
                            <h2 className="dark:text-white text-[#228367] font-[futureHeadlineBold] font-thin tracking-wide leading-tight xl:text-[23px] text-[20px] max-lg:text-[20px]">
                                Achievements
                            </h2>
                            <AchievementDialog data={achievements} />
                        </div>
                        <div className="flex-1 h-auto">
                            <Achievement data={achievements} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}