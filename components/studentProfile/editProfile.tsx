"use client"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { RiCloseLine } from "react-icons/ri";
import { useState, useRef, useEffect } from 'react';
import {
    useRouter
} from "next/navigation";
import { parseCookies } from "nookies";
import { deleteAllTodosFromDB } from "@/db/Todo";
import { clearCanvasData } from "@/db/pdf/pdfAnnotations";
import { clearPdfData } from "@/db/pdf/pdfFiles";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Camera, Trash2 } from "lucide-react";
import { formSchema, FormData } from "./utility/zodValidation";
import axios from "axios";
import { PersonalInformation, ProfileEditResponse, ProfilePicture, UserProfile } from "./dataTypes";
import useUserId from "@/hooks/useUserId";
import { examOptions, subjectOptions, colleges } from "@/constants";


export default function EditProfileForm() {
    const router = useRouter();
    const [profilePicture, setProfilePicture] = useState<ProfilePicture | null>(null);
    const [personalInformation, setPersonalInformation] = useState<PersonalInformation | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const userId = useUserId();

    // Loading and error states
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Profile image state
    const [profileImage, setProfileImage] = useState("/avatar.jpg");
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Get cookies directly
    const cookies = parseCookies();


    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: "",
            phoneNumber: "",
            email: "",
            confirmEmail: "",
            degree: "",
            examTarget: "",
            location: "",
            year: "",
            institution: "",
            specialization: "",
        },
    });

    // Update form values when data is loaded

    useEffect(() => {
        if (personalInformation) {
            console.log("persoall", personalInformation)
            const formData = {
                fullName: cookies?.userName || personalInformation.fullName || "",
                phoneNumber: personalInformation.phoneNumber || "",
                email: cookies?.userEmail || personalInformation.emailAddress || "",
                confirmEmail: cookies?.userEmail || personalInformation.emailConfirmation || "",
                degree: personalInformation.degree || "",
                examTarget: personalInformation.examTarget[0],
                location: personalInformation.location || "",
                year: personalInformation.year,
                institution: personalInformation.institution,
                specialization: personalInformation.specializationInterest,
            };

            console.log("formdata::::", formData)

            // Use reset first
            form.reset(formData);

            console.log("formdata::11::", form.getValues())

        }
    }, [personalInformation]);

    // Fetch profile data when userId is available
    useEffect(() => {
        if (userId) {
            fetchProfileEditData(userId);
        }
    }, [userId]);

    // Update profile image when profile picture data is loaded
    useEffect(() => {
        if (profilePicture?.url) {
            setProfileImage(profilePicture.url);
        }
    }, [profilePicture]);

    const fetchProfileEditData = async (userId: string) => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get<ProfileEditResponse>(
                `${process.env.NEXT_PUBLIC_PROFILE_BASE_URL}/dev/v1/profile/edit/${userId}`
            );

            const data = response.data;
            console.log("data:::", data)

            // Update all state variables
            setUserProfile(data.userProfile);
            setProfilePicture(data.userProfile.profilePicture);
            setPersonalInformation(data.userProfile.personalInformation);
            setProfileImage(data.userProfile.profilePicture.avatarUrl)

        } catch (err: any) {
            console.error('Error fetching profile edit data:', err);
            setError(err?.response?.data?.message || err?.message || 'Failed to fetch profile edit data');
        } finally {
            setLoading(false);
        }
    };

    // Function to handle file selection
    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        console.log("file size====>", file?.size)
        if (file) {
            // Validate file size (e.g., max 5MB)
            if (file.size > 1 * 1024 * 1024) {
                setError("File size must be less than 1MB");
                return;
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                setError("Please select a valid image file");
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                setProfileImage(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Function to trigger file input
    const handleChangeClick = () => {
        setError("");
        fileInputRef.current?.click();
    };

    // Function to remove profile picture
    const handleRemoveProfilePicture = () => {
        setProfileImage("/avatar.jpg");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const onSubmit = async (data: FormData) => {
        if (!userId) {
            setError("User ID not found");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Prepare the data for submission
            const submitData = {
                ...data,
                profilePicture: profileImage !== "/avatar.jpg" ? profileImage : null,
            };

            console.log("Submitting data:", submitData);

            // Make API call to update profile
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_PROFILE_BASE_URL}/dev/v1/profile/edit/${userId}`,
                submitData
            );

            console.log("Profile updated successfully:", response.data);

            // Optionally redirect back to profile page
            router.push("/student-profile");

        } catch (err: any) {
            console.error('Error updating profile:', err);
            setError(err?.response?.data?.message || err?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            // Clear storage
            sessionStorage.clear();
            localStorage.clear();

            // Clear database data
            await Promise.all([
                deleteAllTodosFromDB(),
                clearPdfData(),
                clearCanvasData(),
            ]);

            console.log("Logout successful");
            router.push("/dashboard");
        } catch (error) {
            console.error("Error during logout:", error);
            // Still redirect even if cleanup fails
            router.push("/dashboard");
        }
    };

    // Show loading state
    if (loading && !userProfile) {
        return (
            <div className="2xl:py-[20px] 2xl:px-[46px] px-8 py-4 border-0 bg-transparent max-h-[80vh] h-full w-full">
                <div className="w-full h-full flex items-center justify-center">
                    <div className="text-lg dark:text-white text-[#184C3D]">Loading profile data...</div>
                </div>
            </div>
        );
    }



    console.log("formData===>", form.getValues("year"))

    return (
        <div className="2xl:py-[20px] 2xl:px-[46px] px-8 py-4 border-0 bg-transparent max-h-[80vh]  h-full w-full">
            <div className="w-full h-full no-scrollbar overflow-y-auto font-[futureHeadline] ">
                {/* Main content */}
                <div className="w-auto h-auto flex flex-col justify-center max-md:mb-28">
                    <div className="w-full flex justify-between items-center mb-[30px] bg-transparent">
                        <h2 className="font-bold text-lg 2xl:text-xl dark:text-white text-[#184C3D]">Edit Profile</h2>
                        <button
                            onClick={() => router.push("/student-profile")}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                        >
                            <RiCloseLine size={30} className="dark:text-white text-[#184C3D]" />
                        </button>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-7 2xl:gap-8 w-full h-full" autoComplete="off">
                            {/* Personal Information Card */}
                            <div className="flex justify-between max-md:flex-col max-md:justify-center w-full h-full gap-7 2xl:gap-8">
                                <Card className="dark:bg-[#181A1D] bg-[#F3F4F9] dark:shadow-[inset_0_0_8px_#B8B8B82B] dark:border-none border border-[#B8B8B8] shadow-md max-md:px-[31px] max-md:py-[29px] w-full py-[26px] px-[19px] 2xl:px-[34px]  2xl:py-8">
                                    <CardContent className="w-full h-full p-0 flex flex-col">
                                        {/* Profile Image Section */}
                                        <div className="flex max-lg:flex-col max-lg:items-start items-end gap-7 w-full mb-[30px]">
                                            <Avatar className="w-[90px] h-[90px] 2xl:w-[108px] 2xl:h-[108px] dark:shadow-[inset_0_0_8px_#B8B8B82B]
                                             dark:border-none border border-[#B8B8B8] shadow-md">
                                                <AvatarImage src={profileImage} alt="Profile" className="max-md:rounded-md object-cover" />
                                                <AvatarFallback className="max-md:rounded-md">
                                                    {cookies?.userName
                                                        ? cookies.userName.substring(0, 2).toUpperCase()
                                                        : "U"}
                                                </AvatarFallback>
                                            </Avatar>

                                            {/* Hidden file input */}
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleImageChange}
                                                accept="image/*"
                                                style={{ display: 'none' }}
                                            />

                                            <Button
                                                type="button"
                                                variant="default"
                                                size="sm"
                                                className="text-white dark:text-white bg-[#303338] dark:bg-[#303338] hover:bg-[#404348] dark:hover:bg-[#404348] text-[15px] xl:text-[16px] font-medium h-10 px-6 mb-2"
                                                onClick={handleChangeClick}
                                                disabled={loading}
                                            >
                                                <Camera className="mr-2 h-4 w-4" />
                                                Upload New
                                            </Button>

                                            <Button
                                                type="button"
                                                variant="default"
                                                size="sm"
                                                className="text-white dark:text-white bg-[#303338] dark:bg-[#303338] hover:bg-[#404348] dark:hover:bg-[#404348] text-[15px] xl:text-[16px] font-medium h-10 px-6 mb-2"
                                                onClick={handleRemoveProfilePicture}
                                                disabled={loading}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Remove Profile photo
                                            </Button>
                                        </div>

                                        {/* Form Grid */}
                                        <div className="grid grid-cols-2 max-md:grid-cols-1 font-pt-sans gap-y-[21px] gap-x-[26px] 2xl:gap-y-[32px] 2xl:gap-x-[29px] w-full">
                                            <div className="2xl:space-y-[14px] space-y-3">
                                                <FormField
                                                    control={form.control}
                                                    name="fullName"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="dark:text-white text-black text-lg 2xl:text-xl font-medium">Full Name</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    {...field}
                                                                    placeholder="Type name here"
                                                                    disabled={loading}
                                                                    className="text-[#838383] font-medium text-[15px] 2xl:text-[17px] mt-1 dark:bg-[#2A2D32] bg-[#EBEBF5] dark:border-none border border-[#B8B8B8] h-11 py-[7px] px-6 rounded-[9px] gap-[10px]"
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="2xl:space-y-[14px] space-y-3">
                                                <FormField
                                                    control={form.control}
                                                    name="phoneNumber"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="dark:text-white text-black text-lg 2xl:text-xl font-medium">Phone Number</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    {...field}
                                                                    placeholder="Type phone number here"
                                                                    disabled={loading}
                                                                    className="text-[#838383] font-medium text-[15px] 2xl:text-[17px] mt-1 dark:bg-[#2A2D32] bg-[#EBEBF5] dark:border-none border border-[#B8B8B8] h-11 py-[7px] px-6 rounded-[9px] gap-[10px]"
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="2xl:space-y-[14px] space-y-3">
                                                <FormField
                                                    control={form.control}
                                                    name="email"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="dark:text-white text-black text-lg 2xl:text-xl font-medium">Email Address</FormLabel>
                                                            <FormControl>
                                                                <div className="relative">
                                                                    <Input
                                                                        {...field}
                                                                        placeholder="Type email here"
                                                                        disabled={loading}
                                                                        type="email"
                                                                        className="text-[#838383] font-medium text-[15px] 2xl:text-[17px] mt-1 dark:bg-[#2A2D32] bg-[#EBEBF5] dark:border-none border border-[#B8B8B8] h-11 py-[7px] px-6 rounded-[9px] gap-[10px] pr-20"
                                                                    />
                                                                    {cookies?.emailVerified && (
                                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#36AF8D] text-xs">
                                                                            Verified
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="2xl:space-y-[14px] space-y-3">
                                                <FormField
                                                    control={form.control}
                                                    name="confirmEmail"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="dark:text-white text-black text-lg 2xl:text-xl font-medium">
                                                                Confirm Email Address
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    {...field}
                                                                    placeholder="Confirm email address"
                                                                    disabled={loading}
                                                                    type="email"
                                                                    className="text-[#838383] font-medium text-[15px] 2xl:text-[17px] mt-1 dark:bg-[#2A2D32] bg-[#EBEBF5] dark:border-none border border-[#B8B8B8] h-11 py-[7px] px-6 rounded-[9px] gap-[10px]"
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="2xl:space-y-[14px] space-y-3">
                                                <FormField
                                                    control={form.control}
                                                    name="degree"
                                                    render={({ field }) => (

                                                        <FormItem>
                                                            <FormLabel className="dark:text-white text-black text-lg 2xl:text-xl font-medium">
                                                                Degree
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Select onValueChange={field.onChange}
                                                                    value={field?.value ? field?.value : personalInformation?.degree}
                                                                    disabled={loading}>
                                                                    <SelectTrigger className="text-[#838383] dark:bg-[#2A2D32] bg-[#EBEBF5] font-medium text-[15px] 2xl:text-[17px] mt-1 h-11 py-[7px] px-6 rounded-[9px] gap-[10px]">
                                                                        <SelectValue placeholder="Select a degree" />
                                                                    </SelectTrigger>
                                                                    <SelectContent className="text-[#838383] font-medium text-[15px] 2xl:text-[17px] mt-1 dark:bg-[#2A2D32] bg-[#EBEBF5] dark:border-none border border-[#B8B8B8] py-[7px] px-6 rounded-[9px] gap-[10px]">
                                                                        <SelectItem value="MBBS" className="dark:bg-[#2A2D32] bg-[#EBEBF5]">
                                                                            MBBS
                                                                        </SelectItem>
                                                                        <SelectItem value="BDS" className="dark:bg-[#2A2D32] bg-[#EBEBF5]">
                                                                            BDS
                                                                        </SelectItem>
                                                                        <SelectItem value="MD" className="dark:bg-[#2A2D32] bg-[#EBEBF5]">
                                                                            MD
                                                                        </SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="2xl:space-y-[14px] space-y-3">
                                                <FormField
                                                    control={form.control}
                                                    name="examTarget"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="dark:text-white text-black text-lg 2xl:text-xl font-medium">Exam Target</FormLabel>
                                                            <FormControl>
                                                                <Select
                                                                    onValueChange={field.onChange}
                                                                    value={field?.value ? field?.value : personalInformation?.examTarget[0]}
                                                                    disabled={loading}>
                                                                    <SelectTrigger className="text-[#838383] dark:bg-[#2A2D32] bg-[#EBEBF5] font-medium text-[15px] 2xl:text-[17px] mt-1 h-11 py-[7px] px-6 rounded-[9px] gap-[10px]">
                                                                        <SelectValue placeholder="Select exam target" />
                                                                    </SelectTrigger>
                                                                    <SelectContent className="text-[#838383] font-medium text-[15px] 2xl:text-[17px] mt-1 dark:bg-[#2A2D32] bg-[#EBEBF5] dark:border-none border border-[#B8B8B8] py-[7px] px-6 rounded-[9px] gap-[10px]">
                                                                        {examOptions.map((item) => <SelectItem key={item.value} value={item.value} className="dark:bg-[#2A2D32] bg-[#EBEBF5]">
                                                                            {item.value}
                                                                        </SelectItem>)}


                                                                    </SelectContent>
                                                                </Select>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="2xl:space-y-[14px] space-y-3">
                                                <FormField
                                                    control={form.control}
                                                    name="location"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="dark:text-white text-black text-lg 2xl:text-xl font-medium">Location</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    {...field}
                                                                    placeholder="Type location here"
                                                                    disabled={loading}
                                                                    className="text-[#838383] font-medium text-[15px] 2xl:text-[17px] mt-1 dark:bg-[#2A2D32] bg-[#EBEBF5] dark:border-none border border-[#B8B8B8] h-11 py-[7px] px-6 rounded-[9px] gap-[10px]"
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="2xl:space-y-[14px] space-y-3">
                                                <FormField
                                                    control={form.control}
                                                    name="year"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="dark:text-white text-black text-lg 2xl:text-xl font-medium">Year</FormLabel>
                                                            <FormControl>
                                                                <Select
                                                                    onValueChange={field.onChange}
                                                                    // defaultValue={personalInformation?.year}
                                                                    value={field?.value ? field?.value : personalInformation?.year}
                                                                    disabled={loading}
                                                                >
                                                                    <SelectTrigger className="text-[#838383] dark:bg-[#2A2D32] bg-[#EBEBF5] font-medium text-[15px] 2xl:text-[17px] mt-1 h-11 py-[7px] px-6 rounded-[9px] gap-[10px]">
                                                                        <SelectValue placeholder="Select a year" />
                                                                    </SelectTrigger>
                                                                    <SelectContent className="text-[#838383] font-medium text-[15px] 2xl:text-[17px] mt-1 dark:bg-[#2A2D32] bg-[#EBEBF5] dark:border-none border border-[#B8B8B8] py-[7px] px-6 rounded-[9px] gap-[10px]">
                                                                        <SelectItem value="1st" className="dark:bg-[#2A2D32] bg-[#EBEBF5]">
                                                                            1st Year
                                                                        </SelectItem>
                                                                        <SelectItem value="2nd" className="dark:bg-[#2A2D32] bg-[#EBEBF5]">
                                                                            2nd Year
                                                                        </SelectItem>
                                                                        <SelectItem value="3rd" className="dark:bg-[#2A2D32] bg-[#EBEBF5]">
                                                                            3rd Year
                                                                        </SelectItem>
                                                                        <SelectItem value="4th" className="dark:bg-[#2A2D32] bg-[#EBEBF5]">
                                                                            4th Year
                                                                        </SelectItem>
                                                                        <SelectItem value="5th" className="dark:bg-[#2A2D32] bg-[#EBEBF5]">
                                                                            5th Year
                                                                        </SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="2xl:space-y-[14px] space-y-3">
                                                <FormField
                                                    control={form.control}
                                                    name="institution"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="dark:text-white text-black text-lg 2xl:text-xl font-medium">Institution</FormLabel>
                                                            {/* <FormControl>
                                                                <Input
                                                                    {...field}
                                                                    placeholder="Type institution here"
                                                                    disabled={loading}
                                                                    className="text-[#838383] font-medium text-[15px] 2xl:text-[17px] mt-1 dark:bg-[#2A2D32] bg-[#EBEBF5] dark:border-none border border-[#B8B8B8] h-11 py-[7px] px-6 rounded-[9px] gap-[10px]"
                                                                />
                                                            </FormControl>
                                                            <FormMessage /> */}

                                                            <FormControl>
                                                                <Select
                                                                    onValueChange={field.onChange}
                                                                    value={field?.value ? field?.value : personalInformation?.institution}
                                                                    disabled={loading}>
                                                                    <SelectTrigger className="text-[#838383] dark:bg-[#2A2D32] bg-[#EBEBF5] font-medium text-[15px] 2xl:text-[17px] mt-1 h-11 py-[7px] px-6 rounded-[9px] gap-[10px]">
                                                                        <SelectValue placeholder="Type institution here" />
                                                                    </SelectTrigger>
                                                                    <SelectContent className="text-[#838383] font-medium text-[15px] 2xl:text-[17px] mt-1 dark:bg-[#2A2D32] bg-[#EBEBF5] dark:border-none border border-[#B8B8B8] py-[7px] px-6 rounded-[9px] gap-[10px]">
                                                                        {colleges.map((item) => <SelectItem key={item} value={item} className="dark:bg-[#2A2D32] bg-[#EBEBF5]">
                                                                            {item}
                                                                        </SelectItem>)}


                                                                    </SelectContent>
                                                                </Select>
                                                            </FormControl>

                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="2xl:space-y-[14px] space-y-3">
                                                <FormField
                                                    control={form.control}
                                                    name="specialization"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="dark:text-white text-black text-lg 2xl:text-xl font-medium">Specialization Interest</FormLabel>
                                                            <FormControl>
                                                                <Select
                                                                    onValueChange={field.onChange}
                                                                    value={field?.value ? field?.value : personalInformation?.specializationInterest}
                                                                    disabled={loading}
                                                                >
                                                                    <SelectTrigger className="text-[#838383] dark:bg-[#2A2D32] bg-[#EBEBF5] font-medium text-[15px] 2xl:text-[17px] mt-1 h-11 py-[7px] px-6 rounded-[9px] gap-[10px]">
                                                                        <SelectValue placeholder="Select specialization" />
                                                                    </SelectTrigger>
                                                                    <SelectContent className="text-[#838383] font-medium text-[15px] 2xl:text-[17px] mt-1 dark:bg-[#2A2D32] bg-[#EBEBF5] dark:border-none border border-[#B8B8B8] py-[7px] px-6 rounded-[9px] gap-[10px]">
                                                                        {subjectOptions.map((item) => <SelectItem key={item.label} value={item.label} className="dark:bg-[#2A2D32] bg-[#EBEBF5]">
                                                                            {item.label}
                                                                        </SelectItem>)}


                                                                    </SelectContent>
                                                                </Select>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>

                                        {/* Bottom Action Buttons */}
                                        <div className="flex items-center justify-end gap-[39px] 2xl:gap-6 mt-10 pt-6 text-xs font-pt-sans font-medium">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="dark:text-white text-black max-md:text-xs md:text-base justify-center tracking-wide hover:text-[#d01d1d]  dark:hover:text-[#d01d1d]  transition-colors"
                                                onClick={() => router.push("/student-profile/password")}
                                                disabled={loading}
                                            >
                                                Change Password
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="dark:text-white text-black max-md:text-xs md:text-base justify-center tracking-wide hover:text-[#d01d1d]  dark:hover:text-[#d01d1d]  transition-colors"
                                                onClick={() => router.push("/student-profile/password")}
                                                disabled={loading}
                                            >
                                                Forgot Password
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="dark:text-white text-black max-md:text-xs md:text-base tracking-wide justify-center hover:text-[#d01d1d]  dark:hover:text-[#d01d1d]  transition-colors"
                                                onClick={handleLogout}
                                                disabled={loading}
                                            >
                                                {loading ? "Logging out..." : "Log out"}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    size="lg"
                                    disabled={loading}
                                    className="bg-[#36AF8D] dark:bg-[#36AF8D] text-black dark:text-black hover:bg-[#2bc280] dark:hover:bg-[#2bc280] 2xl:py-[9px] 2xl:px-[15px] text-base disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {loading ? "Saving..." : "Save Changes"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    );
}