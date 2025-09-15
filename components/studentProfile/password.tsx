
"use client"
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Check, ShieldHalf, ShieldCheck } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { Mail } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { destroyCookie, parseCookies } from "nookies";
import {
    changePassword,
} from "@/components/auth/SignIn";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from '@/components/ui/scroll-area';
import { RiCloseLine } from 'react-icons/ri';
import { useRouter } from 'next/navigation';
import { toast } from "react-toastify"
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../ui/input-otp';
import { DialogClose } from '@radix-ui/react-dialog';
import { Label } from '../ui/label';
import { cn } from '@/lib/utils';


// Define the schema for password validation
const passwordSchema = z.object({
    oldPassword: z.string().min(1, "Old password is required"),
    newPassword: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[!@#$%^&*()]/, "Password must contain at least one symbol")
        .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;


// Define the schema for email validation
const forgotPasswordSchema = z.object({
    email: z.string().email('Please enter a valid email address')
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;


// Define security questions
const securityQuestions = [
    "What was your childhood nickname?",
    "What is the name of your first pet?",
    "What was your first car?",
    "What elementary school did you attend?",
    "What is the name of the town where you were born?",
    "What was your favorite food as a child?",
    "What is your mother's maiden name?",
    "What is the name of your first grade teacher?",
];

// Define the form validation schema
const accountRecoverySchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    securityQuestion: z.string({ required_error: 'Please select a security question' }),
    answer: z.string().min(1, 'Please provide an answer')
});

interface SecurityRecommendationsProps {
    onTwoFactorChange?: (enabled: boolean) => void;
    defaultEnabled?: boolean;
}



const PasswordChangeForm: React.FC<SecurityRecommendationsProps> = ({ onTwoFactorChange,
    defaultEnabled = false, }) => {
    const [showOldPassword, setShowOldPassword] = React.useState(false);
    const [showNewPassword, setShowNewPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
    const [passwordStrength, setPasswordStrength] = React.useState(0);
    const router = useRouter()
    const [cookies, setCookies] = React.useState<{ userName: string, userEmail: string, accessToken: string, }>({});
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isSubmitted, setIsSubmitted] = React.useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [otp, setOtp] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);


    const [isSubmittingRecovery, setIsSubmittingRecovery] = React.useState(false);
    const [isSubmittedRecovery, setIsSubmittedRecovery] = React.useState(false);
    const [twoFactorEnabled, setTwoFactorEnabled] = React.useState(defaultEnabled);
    const [currentStep, setCurrentStep] = useState('otp'); // 'otp' or 'password'

    // Password step states
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);


    const handleTwoFactorToggle = (checked: boolean) => {
        setTwoFactorEnabled(checked);

        // Call the callback if provided
        if (onTwoFactorChange) {
            onTwoFactorChange(checked);
        }
    };

    const formRecovery = useForm<AccountRecoveryFormValues>({
        resolver: zodResolver(accountRecoverySchema),
        defaultValues: {
            email: "",
            securityQuestion: "",
            answer: "",
        },
    });

    const form = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            oldPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });


    const formForgotPassword = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    });

    // Calculate password strength
    const calculatePasswordStrength = (password: string) => {
        let strength = 0;

        if (password.length >= 8) strength += 25;
        if (/[A-Z]/.test(password)) strength += 25;
        if (/[0-9]/.test(password)) strength += 25;
        if (/[!@#$%^&*()]/.test(password)) strength += 25;

        setPasswordStrength(strength);
    };

    // Watch for password changes to calculate strength
    React.useEffect(() => {
        const subscription = form.watch((value, { name }) => {
            if (name === 'newPassword' || name === undefined) {
                calculatePasswordStrength(value.newPassword || '');
            }
        });

        return () => subscription.unsubscribe();
    }, [form.watch]);

    useEffect(() => {
        // Read cookies only on the client side
        const parsed = parseCookies();
        setCookies({
            userName: parsed.userName || "",
            userEmail: parsed.userEmail || "",
            accessToken: parsed.accessToken || ""
        });
    }, []);


    // Form submission handler

    // Create a color class based on password strength
    const getStrengthColorClass = () => {
        if (passwordStrength <= 25) return "bg-red";
        if (passwordStrength <= 50) return "bg-amber-600";
        if (passwordStrength <= 75) return " bg-amber-400";
        return "bg-emerald-500";
    };

    // Create a label based on password strength
    const getStrengthLabel = () => {
        if (passwordStrength <= 25) return "Weak";
        if (passwordStrength <= 50) return "Fair";
        if (passwordStrength <= 75) return "Good";
        return "Strong";
    };

    type AccountRecoveryFormValues = z.infer<typeof accountRecoverySchema>;

    // Form submission handler
    const onSubmitPassword = async () => {
        setIsSubmitting(true);
        console.log("===>", cookies?.userName)
        try {
            // Here you would typically call an API to verify security question and initiate recovery
            const url = process.env.NEXT_PUBLIC_PASSWORD_BASE_URL + "/dev/init-forgot-password"

            const response = await axios.post(url, {
                "identifier": cookies?.userName
            });

            if (response.data) {
                setIsDialogOpen(true); // Open dialog only on success
            } else {
                alert('Failed to send mail. Please try again.');
            }
            setIsSubmitting(false);
        } catch (error) {
            console.error("Error processing recovery request:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const onSubmitRecovery = async (data: ForgotPasswordFormValues) => {
        setIsSubmitting(true);

        try {
            // Here you would typically call an API to send a password reset email
            console.log("Reset email requested for:", data.email);

            await changePassword(
                cookies?.accessToken,
                form.getValues("oldPassword"),
                form.getValues("newPassword"),
            );

            toast.success("Password submitted successfully! 🎉", {
                position: "bottom-right",
            });


            setIsSubmitted(true);
        } catch (error) {
            console.error("Error sending reset email:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const doPasswordsMatch =
        newPassword === confirmPassword && confirmPassword !== "";

    // Form submission handler
    const onSubmit = async (data: PasswordFormValues) => {

        // Basic validation
        if (!data.oldPassword) {
            alert('Please enter your current password');
            return;
        }

        if (data.newPassword.length < 8) {
            alert('New password must be at least 8 characters long');
            return;
        }


        if (data.oldPassword === data.newPassword) {
            alert('New password must be different from current password');
            return;
        }

        setIsChangingPassword(true);

        try {
            // Get access token (adjust this based on how you store the token)
            if (!cookies.accessToken) {
                alert('Access token not found. Please login again.');
                setIsChangingPassword(false);
                return;
            }

            console.log('Changing password with data:', {
                accessToken: cookies.accessToken.substring(0, 10) + '...', // Log partial token for debugging
                oldPassword: '***', // Don't log actual passwords
                newPassword: '***'
            });

            // API call to change password using axios
            const response = await axios.post(
                process.env.NEXT_PUBLIC_PASSWORD_BASE_URL + '/dev/changePassword',
                {
                    accessToken: cookies.accessToken,
                    oldPassword: data.oldPassword,
                    newPassword: data.newPassword
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },

                }
            );

            console.log('Password change response:', response.data);

            // Success response
            alert('Password changed successfully!');
            handleDialogClose();

        } catch (error) {
            console.error('Password change error:', error);

            let errorMessage = 'Error changing password';

            if (error.response) {
                // Server responded with error status
                const status = error.response.status;
                const data = error.response.data;

                if (status === 400) {
                    errorMessage = data.message || 'Invalid request. Please check your input.';
                } else if (status === 401) {
                    errorMessage = 'Unauthorized. Please login again.';
                } else if (status === 403) {
                    errorMessage = 'Current password is incorrect.';
                } else if (status === 500) {
                    errorMessage = 'Server error. Please try again later.';
                } else {
                    errorMessage = data.message || `Server error (${status})`;
                }
            } else if (error.request) {
                errorMessage = 'Network error. Please check your connection.';
            } else {
                errorMessage = error.message || 'Unknown error occurred';
            }

            alert(errorMessage);
        } finally {
            setIsChangingPassword(false);
        }

    };

    const handleOtpSubmit = async () => {
        if (otp.length !== 6) {
            alert('Please enter a 6-digit OTP');
            return;
        }

        setIsVerifying(true);

        try {
            // Simulate OTP verification
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Move to password step on success
            setCurrentStep('password');

        } catch (error) {
            alert('Error verifying OTP');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleOtpChange = (e) => {
        const value = e.target.value.replace(/\D/g, ''); // Only numbers
        if (value.length <= 6) {
            setOtp(value);
        }
    };

    const handleDialogClose = () => {
        if (!isVerifying && !isChangingPassword) {
            setIsDialogOpen(false);
            // Reset all states
            setCurrentStep('otp');
            setOtp('');
            setNewPassword('');
            setConfirmPassword('');
        }
    };

    const goBackToOtp = () => {
        setCurrentStep('otp');
        setNewPassword('');
        setConfirmPassword('');
    };


    const handlePasswordSubmit = async () => {
        // Basic validation
        if (newPassword.length < 8) {
            alert('Password must be at least 8 characters long');
            return;
        }

        if (newPassword !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }



        setIsChangingPassword(true);

        try {
            // Simulate password change
            const url = process.env.NEXT_PUBLIC_PASSWORD_BASE_URL + "/dev/confirm-forgot-password"

            const response = await axios.post(url, {
                "identifier": cookies?.userName,
                "confirmationCode": otp,
                "password": newPassword
            });

            alert('Password changed successfully!');
            handleDialogClose();

        } catch (error) {
            alert('Error changing password');
        } finally {
            setIsChangingPassword(false);
        }
    };




    return (
        <div className='w-full h-full mb-10 '>
            <ScrollArea className='w-full h-full flex flex-col  px-8 pb-10 '>

                <Card className="w-full  border-0 shadow-none  bg-transparent dark:bg-transparent">
                    <CardHeader className='px-0'>
                        <CardTitle className="dark:text-white text-[#184C3D] text-xl 2xl:text-lg font-pt-sans font-semibold flex items-center justify-between">
                            <p className=''>Change Password</p>

                            <RiCloseLine size={30} onClick={() => router.push("/student-profile")} className='dark:text-white text-black' />
                        </CardTitle>

                    </CardHeader>
                    <CardContent className='bg-[#F3F4F9] dark:bg-[#181A1D]  dark:shadow-[inset_0_0_8px_#B8B8B82B] dark:border-none border border-[#B8B8B8] shadow-md  max-md:px-[30px] max-md:py-[24px]  2xl:px-[30px] 2xl:py-[28px] px-[19px] py-[16px] rounded-[9px] '>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 2xl:space-y-[21px] max-md:space-y-3 font-pt-sans w-full" autoComplete='off' >
                                {/* Old Password */}
                                <FormField
                                    control={form.control}
                                    name="oldPassword"
                                    render={({ field }) => (
                                        <FormItem className='space-y-3'>
                                            <FormLabel className="dark:text-white text-black font-semibold text-lg">Old Password</FormLabel>
                                            <FormControl>
                                                <div className="relative ">
                                                    <Input
                                                        placeholder="••••••••"
                                                        type={showOldPassword ? "text" : "password"}
                                                        className="dark:bg-[#2A2D32] bg-[#EBEBF5]  dark:shadow-[inset_0_0_8px_#B8B8B82B] dark:border-none border border-[#B8B8B8] shadow-md  text-[15px]  text-[#838383] py-[7px] px-[24px]"
                                                        {...field}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#838383]"
                                                        onClick={() => setShowOldPassword(!showOldPassword)}
                                                    >
                                                        {showOldPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                                                    </button>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* New Password */}
                                <FormField
                                    control={form.control}
                                    name="newPassword"
                                    render={({ field }) => (
                                        <FormItem className='space-y-3'>
                                            <FormLabel className="dark:text-white text-black font-semibold text-lg">New Password</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        placeholder="••••••••"
                                                        type={showNewPassword ? "text" : "password"}
                                                        className=" dark:bg-[#2A2D32] bg-[#EBEBF5] text-[15px]  dark:shadow-[inset_0_0_8px_#B8B8B82B] dark:border-none border border-[#B8B8B8] shadow-md text-[#838383] py-[7px] px-[24px]"
                                                        {...field}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#838383]"
                                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                                    >
                                                        {showNewPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                                                    </button>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Confirm New Password */}
                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem className='space-y-3'>
                                            <FormLabel className="dark:text-white text-black font-semibold text-lg">Confirm New Password</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        placeholder="••••••••"
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        className="dark:bg-[#2A2D32] bg-[#EBEBF5] text-[15px]  dark:shadow-[inset_0_0_8px_#B8B8B82B] dark:border-none border border-[#B8B8B8] shadow-md text-[#838383] py-[7px] px-[24px]"
                                                        {...field}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#838383]"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    >
                                                        {showConfirmPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                                                    </button>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Password Strength Indicator */}
                                {form.watch('newPassword') && (
                                    // <div className="space-y-2 w-full">{passwordStrength}
                                    //     {/* <Progress
                                    //         value={passwordStrength}
                                    //         className={`h-2 ${getStrengthColorClass()} dark:${getStrengthColorClass()}`}
                                    //     /> */}
                                    //     <div
                                    //         className={` rounded-full transition-all duration-300 h-2 ease-out w-[${passwordStrength}%] ${getStrengthColorClass()}`}
                                    //     // style={{
                                    //     //     width: `${passwordStrength}%`,
                                    //     //     backgroundColor: getStrengthColorClass()
                                    //     // }}
                                    //     />
                                    //     <p className={`text-[15px] ${passwordStrength >= 80 ? 'text-[#36AF8D] dark:text-[#36AF8D]' : passwordStrength >= 65 ? "text-amber-600" : 'text-red'}`}>
                                    //         {getStrengthLabel()}
                                    //     </p>
                                    // </div>


                                    <div className="space-y-2 w-full">


                                        {/* Background container */}
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                            {/* Foreground progress bar */}
                                            <div
                                                className={`h-full rounded-full transition-all duration-300 ease-out ${getStrengthColorClass()}`}
                                                style={{ width: `${passwordStrength}%` }}
                                            />
                                        </div>

                                        <p className={`text-[15px] ${passwordStrength >= 80 ? 'text-[#36AF8D] dark:text-[#36AF8D]' : passwordStrength >= 65 ? "text-amber-600" : 'text-red-500'}`}>
                                            {getStrengthLabel()}
                                        </p>
                                    </div>
                                )}

                                {/* Password Requirements Checklist */}
                                <div className=" flex justify-start max-md:flex-col items-start gap-16 max-md:gap-2">
                                    <div className='flex flex-col items-start justify-start space-y-2 2xl:pace-y-4'>
                                        <div className="flex items-center text-[15px]  font-medium text-[#838383]">
                                            <Check size={16} className={`mr-2 ${/[A-Z]/.test(form.watch('newPassword') || '') ? 'text-[#36AF8D]' : 'text-gray-600'}`} />
                                            At least one uppercase letter
                                        </div>
                                        <div className="flex items-center text-[15px] font-medium text-[#838383]">
                                            <Check size={16} className={`mr-2 ${/[!@#$%^&*()]/.test(form.watch('newPassword') || '') ? 'text-[#36AF8D]' : 'text-gray-600'}`} />
                                            At least one symbol (e.g. ! @ # $ % ^ & *)
                                        </div>
                                    </div>
                                    <div className='flex flex-col items-start justify-start space-y-2'>
                                        <div className="flex items-center text-[15px] font-medium text-[#838383]">
                                            <Check size={16} className={`mr-2 ${(form.watch('newPassword') || '').length >= 8 ? 'text-[#36AF8D]' : 'text-gray-600'}`} />
                                            At least 8 characters
                                        </div>
                                        <div className="flex items-center text-[15px] font-medium text-[#838383]">
                                            <Check size={16} className={`mr-2 ${/[0-9]/.test(form.watch('newPassword') || '') ? 'text-[#36AF8D]' : 'text-gray-600'}`} />
                                            At least one number 0-9
                                        </div>
                                    </div>

                                </div>

                                {/* Submit Button */}
                                <div className='w-full flex justify-end'>
                                    <Button
                                        type="submit"
                                        className="w-[200px] h-[30px] rounded-[7px] bg-[#36AF8D] hover:bg-emerald-600 dark:bg-[#36AF8D] dark:hover:bg-emerald-600 text-black font-medium"
                                    >
                                        Change Password
                                    </Button>
                                </div>

                            </form>
                        </Form>
                    </CardContent>

                </Card>

                <Card className="w-full  border-0 shadow-none  bg-transparent dark:bg-transparent">
                    <CardHeader className='px-0'>
                        <CardTitle className="dark:text-white text-[#184C3D] text-xl font-pt-sans font-semibold ">Forgot Password</CardTitle>
                    </CardHeader>
                    <CardContent className='bg-[#F3F4F9] dark:bg-[#181A1D] px-[19px] py-[16px] max-md:px-[30px] max-md:py-[24px]   dark:shadow-[inset_0_0_8px_#B8B8B82B] dark:border-none border border-[#B8B8B8] shadow-md
                       2xl:py-[24px] 2xl:px-[30px] rounded-[9px]' >
                        {isSubmitted ? (
                            <div className="flex flex-col items-center justify-center py-4 space-y-4">
                                <div className="dark:bg-[#2A2D32] bg-[#EBEBF5]  py-[7px] px-6 rounded-[9px
                                ]">
                                    <Mail className="h-6 w-6 text-emerald-500" />
                                </div>
                                <p className="dark:text-white text-black  text-center">Check your inbox! We&apos;ve sent a password reset link to your email.</p>
                                <div className='w-full flex justify-end'>
                                    <Button
                                        className="w-[200px] h-[30px] rounded-[7px] bg-[#36AF8D] hover:bg-emerald-600 dark:bg-[#36AF8D] dark:hover:bg-emerald-600 text-black font-medium"
                                        onClick={() => {
                                            setIsSubmitted(false);
                                            formForgotPassword.reset();
                                        }}
                                    >
                                        Send another email
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <Form {...formForgotPassword}>
                                <form onSubmit={formForgotPassword.handleSubmit(onSubmitPassword)} className="space-y-4 2xl:space-y-5">
                                    <FormField
                                        control={formForgotPassword.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input
                                                        placeholder="example@mail.com"
                                                        type="email"
                                                        className="dark:bg-[#2A2D32] bg-[#EBEBF5]  py-[7px] px-6 rounded-[9px] text-[#838383]"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-red-400" />
                                            </FormItem>
                                        )}
                                    />

                                    <div className='w-full flex justify-end'>
                                        <Button
                                            type="submit"
                                            className="w-[200px] h-[30px] rounded-[7px] bg-[#36AF8D] hover:bg-emerald-600 dark:bg-[#36AF8D]
                                             dark:hover:bg-emerald-600 text-lg text-black font-medium"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? "Sending..." : "Send Mail"}
                                        </Button>

                                        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
                                            <DialogContent className="sm:max-w-2xl rounded-lg dark:bg-[#0F1012] bg-[#F3F4F9] border-none px-[102px]">
                                                <DialogHeader>
                                                    <DialogTitle className="text-center text-xl font-semibold">
                                                        <div className="flex flex-col items-center justify-center mb-4">
                                                            <p className="w-full font-bold text-center text-white  text-[28px] font-[futureHeadline]">   {currentStep === 'otp' ? 'Verify OTP' : 'Set New Password'}</p>
                                                            <p className="w-full font-medium text-center text-[#B3B3B3] font-pt-sans  text-sm mt-3 ">
                                                                {currentStep === 'otp' ? "we sent a reset link to your email enter 6 digit code that is mentioned in the email" : "Create a new password. Ensure it differs from previous ones for security"}
                                                            </p>
                                                            {/* <p className="text-[#087A5A] hover:text-[#087A5A] w-full text-center text-xs underline mb-[46px] mt-3" onClick={() => router.push("/auth/signup")}>Signup</p> */}
                                                        </div>
                                                    </DialogTitle>
                                                </DialogHeader>
                                                <DialogClose onClick={handleDialogClose}></DialogClose>

                                                <div className="flex flex-col items-center space-y-4 py-4">
                                                    {currentStep === 'otp' ? (
                                                        // OTP Verification Step
                                                        <>


                                                            <div className="flex flex-col items-center space-y-4 w-full">


                                                                <div className="mb-5">
                                                                    <InputOTP
                                                                        value={otp}
                                                                        onChange={setOtp}
                                                                        maxLength={6}
                                                                        disabled={isVerifying}
                                                                    >
                                                                        <div className="flex gap-5 items-center justify-center w-full">
                                                                            <InputOTPGroup className="flex gap-5">
                                                                                <InputOTPSlot
                                                                                    className={`relative flex h-9 w-9 items-center justify-center border text-sm shadow-sm transition-all rounded-md border-neutral-800  active:ring-[#36AF8D]
                   ${otp[0]
                                                                                            ? 'border-[#36AF8D] bg-[#36AF8D]/5'
                                                                                            : 'border-neutral-200 focus:border-[#36AF8D] '
                                                                                        }`}
                                                                                    index={0}
                                                                                />
                                                                                <InputOTPSlot
                                                                                    className={`relative flex h-9 w-9 items-center justify-center border text-sm shadow-sm transition-all rounded-md border-neutral-800  active:ring-[#36AF8D]
                   ${otp[1]
                                                                                            ? 'border-[#36AF8D] bg-[#36AF8D]/5'
                                                                                            : 'border-neutral-200 focus:border-[#36AF8D]'
                                                                                        }`}
                                                                                    index={1}
                                                                                />
                                                                                <InputOTPSlot
                                                                                    className={`relative flex h-9 w-9 items-center justify-center border text-sm shadow-sm transition-all rounded-md border-neutral-800  active:ring-[#36AF8D]
                   ${otp[2]
                                                                                            ? 'border-[#36AF8D] bg-[#36AF8D]/5'
                                                                                            : 'border-neutral-200 focus:border-[#36AF8D]'
                                                                                        }`}
                                                                                    index={2}
                                                                                />
                                                                            </InputOTPGroup>

                                                                            <InputOTPGroup className="flex gap-5">
                                                                                <InputOTPSlot
                                                                                    className={`relative flex h-9 w-9 items-center justify-center border text-sm shadow-sm transition-all rounded-md border-neutral-800  active:ring-[#36AF8D]
                   ${otp[3]
                                                                                            ? 'border-[#36AF8D] bg-[#36AF8D]/5'
                                                                                            : 'border-neutral-200 focus:border-[#36AF8D]'
                                                                                        }`}
                                                                                    index={3}
                                                                                />
                                                                                <InputOTPSlot
                                                                                    className={`relative flex h-9 w-9 items-center justify-center border text-sm shadow-sm transition-all rounded-md border-neutral-800  active:ring-[#36AF8D]
                   ${otp[4]
                                                                                            ? 'border-[#36AF8D] bg-[#36AF8D]/5'
                                                                                            : 'border-neutral-200 focus:border-[#36AF8D]'
                                                                                        }`}
                                                                                    index={4}
                                                                                />
                                                                                <InputOTPSlot
                                                                                    className={`relative flex h-9 w-9 items-center justify-center border text-sm shadow-sm transition-all rounded-md border-neutral-800  active:ring-[#36AF8D]
                   ${otp[5]
                                                                                            ? 'border-[#36AF8D] bg-[#36AF8D]/5'
                                                                                            : 'border-neutral-200 focus:border-[#36AF8D]'
                                                                                        }`}
                                                                                    index={5}
                                                                                />
                                                                            </InputOTPGroup>
                                                                        </div>
                                                                    </InputOTP>

                                                                </div>

                                                                <div className="flex space-x-3 w-full flex-col space-y-3">

                                                                    <Button
                                                                        onClick={handleOtpSubmit}
                                                                        disabled={isVerifying || otp.length !== 6}
                                                                        className="py-6 relative overflow-hidden group transition-all bg-[#36AF8D]  hover:bg-[#2b8c70]  dark:bg-[#087A5A] dark:hover:bg-[#087a5ada] text-white dark:text-white font-medium cursor-pointer w-full"
                                                                    >
                                                                        {isVerifying ? "Verifying..." : "Verify"}
                                                                    </Button>

                                                                    <Button
                                                                        variant="link"
                                                                        className=" text-zinc-300 hover:text-[#087A5A] w-full"
                                                                    // onClick={handleResendOTP}
                                                                    // disabled={isResendDisabled || isVerified}
                                                                    >
                                                                        Resend Code
                                                                    </Button>

                                                                    {/* <Button
                                                                        variant="link"
                                                                        className='text-zinc-300 hover:text-[#087A5A] w-full'
                                                                        onClick={handleDialogClose}
                                                                        disabled={isVerifying}
                                                                    >
                                                                        Cancel
                                                                    </Button> */}
                                                                </div>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        // Password Input Step
                                                        <>


                                                            <div className="flex flex-col space-y-4 w-full">









                                                                <div className="space-y-4">
                                                                    <Label htmlFor="newPassword" className="text-[#BABABA] ">
                                                                        New Password
                                                                    </Label>
                                                                    <div className="relative">
                                                                        <Input
                                                                            id="newPassword"
                                                                            type={!showPassword ? "text" : "password"}
                                                                            placeholder="Create new password"
                                                                            className="py-5"
                                                                            value={newPassword}
                                                                            onChange={(e) => setNewPassword(e.target.value)}
                                                                            disabled={isChangingPassword}
                                                                        />
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            disabled={isChangingPassword}
                                                                            size="sm"
                                                                            className="absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2 px-0"
                                                                            onClick={() => setShowPassword(!showPassword)}
                                                                        >
                                                                            {showPassword ? (
                                                                                <svg
                                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                                    viewBox="0 0 24 24"
                                                                                    fill="none"
                                                                                    stroke="currentColor"
                                                                                    strokeWidth="2"
                                                                                    strokeLinecap="round"
                                                                                    strokeLinejoin="round"
                                                                                    className="h-4 w-4"
                                                                                >
                                                                                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                                                                                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                                                                                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                                                                                    <line x1="2" x2="22" y1="2" y2="22"></line>
                                                                                </svg>
                                                                            ) : (
                                                                                <svg
                                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                                    viewBox="0 0 24 24"
                                                                                    fill="none"
                                                                                    stroke="currentColor"
                                                                                    strokeWidth="2"
                                                                                    strokeLinecap="round"
                                                                                    strokeLinejoin="round"
                                                                                    className="h-4 w-4"
                                                                                >
                                                                                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                                                                                    <circle cx="12" cy="12" r="3"></circle>
                                                                                </svg>
                                                                            )}
                                                                        </Button>
                                                                    </div>


                                                                    <div className="space-y-4">
                                                                        <Label htmlFor="confirmPassword" className="text-[#BABABA]">
                                                                            Confirm Password
                                                                        </Label>
                                                                        <Input
                                                                            id="confirmPassword"
                                                                            type={!showPassword ? "text" : "password"}
                                                                            placeholder="Confirm new password"
                                                                            className={cn(
                                                                                "py-5",
                                                                                confirmPassword &&
                                                                                (doPasswordsMatch
                                                                                    ? "border-green-500 focus-visible:ring-green-500"
                                                                                    : "border-red-500 focus-visible:ring-red-500")
                                                                            )}
                                                                            value={confirmPassword}
                                                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                                                            disabled={isChangingPassword}
                                                                        />
                                                                        {confirmPassword && !doPasswordsMatch && (
                                                                            <p className="text-xs text-red-500 mt-1">Passwords don&apos;t match</p>
                                                                        )}
                                                                    </div>


                                                                </div>

                                                                {/* Password Requirements */}
                                                                <div className="text-xs text-white space-y-1">
                                                                    <p>Password requirements:</p>
                                                                    <ul className="list-disc list-inside space-y-1">
                                                                        <li className={newPassword.length >= 8 ? 'text-emerald-600' : 'text-white'}>
                                                                            At least 8 characters
                                                                        </li>
                                                                        <li className={/[A-Z]/.test(newPassword) ? 'text-emerald-600' : 'text-white'}>
                                                                            One uppercase letter
                                                                        </li>
                                                                        <li className={/[a-z]/.test(newPassword) ? 'text-emerald-600' : 'text-white'}>
                                                                            One lowercase letter
                                                                        </li>
                                                                        <li className={/\d/.test(newPassword) ? 'text-emerald-600' : 'text-white'}>
                                                                            One number
                                                                        </li>
                                                                    </ul>
                                                                    {confirmPassword && newPassword !== confirmPassword && (
                                                                        <p className="text-red-500 mt-2">Passwords do not match</p>
                                                                    )}
                                                                    {confirmPassword && newPassword === confirmPassword && confirmPassword.length > 0 && (
                                                                        <p className="text-green-600 mt-2">Passwords match ✓</p>
                                                                    )}
                                                                </div>

                                                                {/* Action Buttons */}
                                                                <div className="flex space-x-3 pt-2">
                                                                    <Button
                                                                        onClick={handlePasswordSubmit}
                                                                        disabled={
                                                                            isChangingPassword ||
                                                                            !newPassword ||
                                                                            !confirmPassword ||
                                                                            newPassword !== confirmPassword ||
                                                                            newPassword.length < 8
                                                                        }
                                                                        className=" py-6 relative overflow-hidden group transition-all bg-[#087A5A] py-5 hover:bg-[#087a5ada]  dark:bg-[#087A5A] dark:hover:bg-[#087a5ada] text-white dark:text-white font-medium cursor-pointer w-full"
                                                                    >
                                                                        {isChangingPassword ? "Changing..." : "Change Password"}
                                                                    </Button>

                                                                    <Button
                                                                        variant="ghost"
                                                                        className=" py-6 relative overflow-hidden group transition-all bg-[#087A5A] py-5 hover:bg-[#087a5ada]  dark:bg-[#087A5A] dark:hover:bg-[#087a5ada] text-white dark:text-white font-medium cursor-pointer "
                                                                        onClick={goBackToOtp}
                                                                        disabled={isChangingPassword}

                                                                    >
                                                                        Back
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </form>
                            </Form>
                        )}
                    </CardContent>
                </Card>


                <Card className="w-full  border-0 shadow-none   bg-transparent dark:bg-transparent">
                    <CardHeader className='px-0'>
                        <CardTitle className="dark:text-white text-[#184C3D] text-xl font-pt-sans font-semibold ">Account Recovery</CardTitle>
                    </CardHeader>
                    <CardContent className='bg-[#F3F4F9] dark:bg-[#181A1D] px-[19px] py-[16px] dark:shadow-[inset_0_0_8px_#B8B8B82B] dark:border-none border border-[#B8B8B8] shadow-md   max-md:px-[30px] max-md:py-[24px]   2xl:py-[21px] 2xl:px-[30px] rounded-[9px] '>
                        {isSubmitted ? (
                            <div className="flex flex-col items-center justify-center py-4 space-y-4">
                                <div className="dark:bg-[#2A2D32] bg-[#EBEBF5] py-[7px] px-6 rounded-[9px]">
                                    <svg className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p className="text-white text-center">Recovery request submitted. Check your email for further instructions.</p>
                                <div className='w-full flex justify-end'>
                                    <Button
                                        className="w-full bg-[#36AF8D] hover:bg-emerald-600 text-black font-medium"
                                        onClick={() => {
                                            setIsSubmittedRecovery(false);
                                            formRecovery.reset();
                                        }}
                                    >
                                        Submit another request
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <Form {...formRecovery}>
                                <form onSubmit={formRecovery.handleSubmit(onSubmitRecovery)} className="space-y-4">
                                    <FormField
                                        control={formRecovery.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input
                                                        placeholder="recovery@mail.com"
                                                        type="email"
                                                        className="dark:bg-[#2A2D32] bg-[#EBEBF5] py-[7px] px-6 rounded-[9px] text-[#838383] dark:shadow-[inset_0_0_8px_#B8B8B82B] dark:border-none border border-[#B8B8B8] shadow-md "
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-red-400" />
                                            </FormItem>
                                        )}
                                    />
                                    <div className='w-full flex items-center gap-7 max-md:flex-col'>
                                        <FormField
                                            control={formRecovery.control}
                                            name="securityQuestion"
                                            render={({ field }) => (
                                                <FormItem className='w-full'>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger className="dark:bg-[#2A2D32] bg-[#EBEBF5] py-[7px] px-6 rounded-[9px] text-[#838383] w-full dark:shadow-[inset_0_0_8px_#B8B8B82B] dark:border-none border border-[#B8B8B8] shadow-md ">
                                                                <SelectValue placeholder="Select a question" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="dark:bg-[#2A2D32] bg-[#EBEBF5] py-[7px] px-6 rounded-[9px] w-full">
                                                            {securityQuestions.map((question, index) => (
                                                                <SelectItem key={index} value={question} className="focus:bg-gray-700 text-[#838383]">
                                                                    {question}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage className="text-red-400" />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="answer"
                                            render={({ field }) => (
                                                <FormItem className='w-full'>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Type your answer"
                                                            className="dark:bg-[#2A2D32] bg-[#EBEBF5]  py-[7px] px-6 rounded-[9px] text-[#838383] dark:shadow-[inset_0_0_8px_#B8B8B82B] dark:border-none border border-[#B8B8B8] shadow-md "
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-red-400" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className='w-full flex justify-end'>
                                        <Button
                                            type="submit"
                                            className="w-[200px] h-[30px] rounded-[7px] bg-[#36AF8D] hover:bg-emerald-600 dark:bg-[#36AF8D] dark:hover:bg-emerald-600 text-black font-medium"
                                            disabled={isSubmittingRecovery}
                                        >
                                            {isSubmittingRecovery ? "Processing..." : "Save"}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        )}
                    </CardContent>
                </Card>


                <Card className="w-full   mb-32 shadow-none  border-0 bg-transparent dark:bg-transparent">
                    <CardContent className="py-0 px-0 space-y-6 2xl:space-y-5">
                        {/* Header */}
                        <div className="flex items-center gap-2 pt-6">
                            <ShieldCheck className="text-emerald-500" size={25} />
                            <h2 className="dark:text-white text-[#184C3D] text-xl font-pt-sans font-semibold ">Security Recommendations</h2>
                        </div>

                        {/* Password recommendation */}
                        <div className='bg-[#F3F4F9] dark:bg-[#181A1D] px-[19px] py-[16px]  dark:shadow-[inset_0_0_8px_#B8B8B82B] dark:border-none border border-[#B8B8B8] shadow-md   2xl:py-[9px] 2xl:px-[30px] max-md:px-[30px] max-md:py-[24px]  rounded-[9px] '>
                            <p className="dark:text-[#A4A4A4] text-black text-xl font-pt-sans ">
                                It&apos;s important to protect your medical data. Create a strong memorable password and
                                avoid reusing across platforms.
                            </p>
                        </div>

                        {/* Two-Factor Authentication */}
                        <div className=" ">
                            <div className="flex items-center justify-between pb-5">
                                <div className="flex items-center gap-2">
                                    <ShieldHalf className="dark:text-white text-[#184C3D]" size={20} />
                                    <h3 className="dark:text-white text-[#184C3D] text-xl font-pt-sans font-semibold">Two-Factor Authentication</h3>
                                </div>
                                <Switch
                                    checked={twoFactorEnabled}
                                    onCheckedChange={handleTwoFactorToggle}
                                    className="data-[state=checked]:bg-emerald-500 dark:data-[state=checked]:bg-emerald-500 dark:shadow-[inset_0_0_8px_#B8B8B82B] dark:border-none border border-[#B8B8B8] shadow-md "
                                />
                            </div>

                            {/* 2FA Details with QR Code */}
                            <div className="flex gap-4 2xl:py-[9px] 2xl:px-[30px] px-[19px] py-[16px] bg-[#F3F4F9] dark:bg-[#181A1D]
                             dark:shadow-[inset_0_0_8px_#B8B8B82B] dark:border-none border border-[#B8B8B8] shadow-md   rounded-[9px] items-center justify-center max-md:flex-col">
                                <div className="flex-1 ">
                                    <div className="grid grid-cols-9 gap-2 place-items-center ">
                                        <ShieldCheck className="text-[#17DB94] mt-1 col-span-2 max-md:col-span-3" size={50} />
                                        <div className='col-span-7 max-md:col-span-6'>
                                            <p className="dark:text-white text-black text-xl font-medium">
                                                Secure your Medical study materials
                                                with an extra layer of account security.
                                            </p>

                                            <Button
                                                variant="link"
                                                className="text-[#17DB94] dark:text-[#17DB94] p-0 h-auto mt-1"
                                                onClick={() => window.open('#', '_blank')}
                                            >
                                                Learn more
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-center">
                                    <div className="bg-white   dark:shadow-[inset_0_0_8px_#B8B8B82B] dark:border-none border border-[#B8B8B8] shadow-md  p-2 rounded-md h-[100px] w-[100px] flex items-center justify-center">
                                        {/* Replace with your actual QR code image */}
                                        <svg
                                            viewBox="0 0 100 100"
                                            className="h-full w-full"
                                        >
                                            <path
                                                d="M30,30 L30,10 L10,10 L10,30 L30,30 Z M25,25 L15,25 L15,15 L25,15 L25,25 Z"
                                                fill="black"
                                            />
                                            <path
                                                d="M70,30 L70,10 L50,10 L50,30 L70,30 Z M65,25 L55,25 L55,15 L65,15 L65,25 Z"
                                                fill="black"
                                            />
                                            <path
                                                d="M30,70 L30,50 L10,50 L10,70 L30,70 Z M25,65 L15,65 L15,55 L25,55 L25,65 Z"
                                                fill="black"
                                            />
                                            <path
                                                d="M10,35 L10,45 L20,45 L20,35 L10,35 Z"
                                                fill="black"
                                            />
                                            <path
                                                d="M35,10 L35,20 L45,20 L45,10 L35,10 Z"
                                                fill="black"
                                            />
                                            <path
                                                d="M10,35 L10,45 L20,45 L20,35 L10,35 Z"
                                                fill="black"
                                            />
                                            <path
                                                d="M35,50 L35,70 L40,70 L40,60 L45,60 L45,65 L55,65 L55,70 L65,70 L65,60 L70,60 L70,65 L75,65 L75,60 L80,60 L80,50 L75,50 L75,55 L65,55 L65,50 L60,50 L60,45 L55,45 L55,55 L50,55 L50,50 L35,50 Z"
                                                fill="black"
                                            />
                                            <path
                                                d="M75,70 L75,75 L70,75 L70,80 L75,80 L75,90 L80,90 L80,75 L85,75 L85,70 L75,70 Z"
                                                fill="black"
                                            />
                                            <path
                                                d="M50,75 L50,80 L55,80 L55,85 L65,85 L65,80 L60,80 L60,75 L50,75 Z"
                                                fill="black"
                                            />
                                            <path
                                                d="M60,10 L60,15 L65,15 L65,10 L60,10 Z M70,15 L70,20 L75,20 L75,25 L80,25 L80,30 L90,30 L90,25 L85,25 L85,20 L80,20 L80,15 L75,15 L75,10 L70,10 L70,15 Z"
                                                fill="black"
                                            />
                                            <path
                                                d="M85,30 L85,40 L90,40 L90,30 L85,30 Z"
                                                fill="black"
                                            />
                                            <path
                                                d="M80,40 L80,45 L85,45 L85,40 L80,40 Z"
                                                fill="black"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>


            </ScrollArea>


        </div>
    );
};

export default PasswordChangeForm;