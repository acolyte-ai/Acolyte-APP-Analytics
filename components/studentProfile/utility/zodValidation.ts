import * as z from "zod";

// Define the schema with all optional fields
export const formSchema = z.object({
    fullName: z.string().optional(),
    phoneNumber: z.string().optional(),
    email: z.string().email("Invalid email address"),
    confirmEmail: z.string().email("Invalid email address"),
    degree: z.string().optional(),
    examTarget: z.string().optional(),
    location: z.string().optional(),
    year: z.string().optional(),
    institution: z.string().optional(),
    specialization: z.string().optional(),
    // aiPreferences: z.object({
    //     studyReminder: z.boolean(),
    //     examAlerts: z.boolean(),
    //     studySchedule: z.boolean(),
    //     learningStyle: z.boolean(),
    // }).optional(),
    // notificationPreferences: z.object({
    //     studyReminder: z.boolean(),
    //     examAlerts: z.boolean(),
    //     studySchedule: z.boolean(),
    //     learningStyle: z.boolean(),
    // }).optional(),
    // learningStyle: z.enum(["Visual", "Auditory", "Kinesthetic"]).optional(),
    // notifyNow: z.string().optional(),
}).refine((data) => {
    // Custom validation: if email is provided, confirmEmail should match
    if (data.email && data.confirmEmail && data.email !== data.confirmEmail) {
        return false;
    }
    return true;
}, {
    message: "Email addresses must match",
    path: ["confirmEmail"], // This will show the error on the confirmEmail field
});

export type FormData = z.infer<typeof formSchema>;