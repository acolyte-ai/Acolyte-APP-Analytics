import { z } from "zod";

export const formSchema = z.object({
    fullName: z.string().min(1),
    phoneNumber: z.string(),
    email: z.string().email(),
    degree: z.string(),
    examTarget: z.string(),
    location: z.string(),
    year: z.string(),
    institution: z.string(),
    specialization: z.string(),
    aiPreferences: z.object({
        studyReminder: z.boolean(),
        examAlerts: z.boolean(),
        studySchedule: z.boolean(),
        learningStyle: z.boolean(),
    }),
    notificationPreferences: z.object({
        studyReminder: z.boolean(),
        examAlerts: z.boolean(),
        studySchedule: z.boolean(),
        learningStyle: z.boolean(),
    }),
    learningStyle: z.enum(["Visual", "Auditory", "Kinesthetic"]),
    notifyNow: z.string(),
});

